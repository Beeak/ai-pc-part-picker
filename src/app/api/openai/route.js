import fetch from "node-fetch";

const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
const apiKey = process.env["AZURE_OPENAI_KEY1"];
const modelName = "o1-preview";

export async function POST(req) {
  const { existingParts, requiredParts, budget } = await req.json();

  try {
    const prompt = `I have the following parts: ${existingParts}. I need the following parts: ${requiredParts}. My budget is ${budget}. Suggest additional parts to complete my PC build within the budget.`;

    const response = await fetch(
      `${endpoint}/openai/deployments/${modelName}/completions?api-version=2022-12-01`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          prompt,
          max_tokens: 100,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestions = data.choices[0].text;

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
