
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModels() {
    console.log("🚀 Iniciando prueba FINAL de modelos Gemini...");
    const apiKey = "AIzaSyDcjKEv2fTwuPHG9uz4wPX4RwKz89S3X-Y";

    if (!apiKey) return;

    const genAI = new GoogleGenerativeAI(apiKey);

    // El único que ha funcionado en el test anterior es gemini-2.0-flash-exp
    const modelName = "gemini-2.0-flash-exp";
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`\n--- PROBANDO ${modelName} CON SYSTEM INSTRUCTION ---`);
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'hola' }] }],
            systemInstruction: {
                role: 'system',
                parts: [{ text: 'Eres un asistente que responde en una palabra.' }]
            }
        });
        const response = await result.response;
        console.log(`✅ ${modelName} SOPORTA SYSTEM INSTRUCTION: "${response.text().trim()}"`);
    } catch (error: any) {
        console.log(`❌ ${modelName} FALLÓ: ${error.message.split('\n')[0]}`);
    }
}

testModels();
