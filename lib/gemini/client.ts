import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

/**
 * Gemini API client — server-side only.
 *
 * The GEMINI_API_KEY env var intentionally has no NEXT_PUBLIC_ prefix
 * so it is never exposed to the browser.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

/** Pre-configured Gemini model for travel recommendations */
export const geminiModel: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

/**
 * Send a prompt to Gemini and return the text response.
 * Intended for use in API routes / server actions only.
 */
export async function askGemini(prompt: string): Promise<string> {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
}
