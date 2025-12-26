import { GoogleGenerativeAI } from "@google/generative-ai";

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  // There is no listModels in the SDK directly easily, but we can try to initialize and check.
  console.log("Checking models...");
}
list();
