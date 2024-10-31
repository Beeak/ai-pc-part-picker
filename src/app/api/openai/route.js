import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = process.env["GITHUB_ENDPOINT"];
const modelName = "gpt-4o";

export async function POST(req) {
  try {
    const {
      existingParts,
      requiredParts,
      budget,
      buildType,
      estimatedExistingValue = 0,
    } = await req.json();

    const numericBudget = Number(budget);
    const numericExistingValue = Number(estimatedExistingValue);

    if (isNaN(numericBudget) || numericBudget <= 0) {
      throw new Error("Invalid budget value");
    }

    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const effectiveBudget = numericBudget;
    const minBudget = buildType === "upgrade" ? 0 : effectiveBudget * 0.85;
    const maxBudget = effectiveBudget;

    console.log({
      effectiveBudget,
      minBudget,
      maxBudget,
      buildType,
      numericExistingValue,
    });

    const neededParts =
      buildType === "new"
        ? ["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case"]
        : requiredParts;

    const promptTemplate = `You are a precise PC building assistant that MUST include ALL required components.
    ${
      existingParts
        ? `Given existing PC parts: ${existingParts} (estimated value: $${numericExistingValue}), suggest compatible parts: ${requiredParts.join(
            ", "
          )}`
        : "Create a complete balanced PC build with ALL core components"
    }

Budget for new parts: $${effectiveBudget}
STRICT REQUIREMENTS:
1. MUST include every single one of these parts: ${neededParts.join(", ")}
2. Total cost MUST be between $${minBudget.toFixed(2)} and $${maxBudget.toFixed(
      2
    )}
3. All components must be compatible
4. MAXIMIZE the budget usage - aim for total cost close to $${maxBudget.toFixed(
      2
    )}
5. Try to keep bottlenecks to a minimum
6. Prioritize performance components (CPU/GPU) when allocating remaining budget
${existingParts ? "7. New parts must complement existing components" : ""}


Response MUST be valid JSON matching this schema:
{
  "parts": [
    {
      "type": "CPU",
      "model": "Model name",
      "estimated_price": 000.00
    }
  ],
  "total_cost": 0000.00,
  "remaining_budget": 000.00,
  "build_type": "gaming/workstation/general"

Verify ALL required parts are included before responding.`;

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: promptTemplate.trim(),
        },
      ],
      model: modelName,
      max_tokens: 500,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    if (!result.parts || !Array.isArray(result.parts)) {
      throw new Error(
        "Invalid response format: missing or invalid parts array"
      );
    }

    if (result.total_cost < minBudget) {
      console.warn(
        `Build total ($${
          result.total_cost
        }) is below minimum budget of $${minBudget.toFixed(2)}`
      );
    }

    if (result.total_cost > maxBudget) {
      throw new Error(
        `Build total ($${
          result.total_cost
        }) exceeds maximum budget of $${maxBudget.toFixed(2)}`
      );
    }

    const includedTypes = result.parts.map((p) => p.type);
    const missingParts = neededParts.filter((p) => !includedTypes.includes(p));

    if (missingParts.length > 0) {
      throw new Error(`Missing required parts: ${missingParts.join(", ")}`);
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        status: 500,
      }
    );
  }
}
