import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Default to a currently supported Gemini multimodal text model.
// Change in .env or your deployment config as needed.
const GEMINI_MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  throw new Error("Missing required environment variable GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });
}

export function getGeminiModelId() {
  return GEMINI_MODEL_ID;
}
