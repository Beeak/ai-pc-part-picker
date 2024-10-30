import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = process.env["GITHUB_ENDPOINT"];
const modelName = "o1-preview";

async function createCompletion(client, prompt, retries = 3) {
  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: modelName,
    });
    return response.choices[0].message.content;
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const retryAfter = error.headers.get("Retry-After") || 60;
      console.warn(
        `Rate limit exceeded. Retrying after ${retryAfter} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return createCompletion(client, prompt, retries - 1);
    } else {
      throw error;
    }
  }
}

export async function POST(req) {
  const { existingParts, requiredParts, budget } = await req.json();

  try {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const prompt = `I have the following parts: ${existingParts}. I need the following parts: ${requiredParts}. My budget is ${budget}. Suggest additional parts to complete my PC build within the budget.`;

    const suggestions = await createCompletion(client, prompt);

    return new Response(JSON.stringify({ result: suggestions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
