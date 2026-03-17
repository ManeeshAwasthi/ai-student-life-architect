import { getGeminiModel } from "./generative-ai";
import { JSON_SYSTEM_PROMPT } from "./prompts";

export async function callGemini(prompt: string, label: string): Promise<unknown> {
  const model = getGeminiModel();

  const callPromise = model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: JSON_SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`"${label}" timed out after 50s`)), 50_000)
  );

  const result = await Promise.race([callPromise, timeoutPromise]);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    // Fallback: try to extract a JSON object from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Invalid JSON from "${label}": ${text.slice(0, 200)}`);
  }
}
