import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "o1-preview";

export async function POST(req) {
  const { existingParts, requiredParts, budget } = await req.json();
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  try {
    const prompt = `I have the following parts: ${existingParts}. I need the following parts: ${requiredParts}. My budget is ${budget}. Suggest additional parts to complete my PC build within the budget.`;

    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: modelName,
    });

    const suggestions = response.choices[0].message.content;

    return new Response(JSON.stringify({ result: suggestions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error occurred:", error); // Log the error to the console
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
