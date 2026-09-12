import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

async function testGemini36() {
    const list = [
        "gemini-3.6-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash-001",
        "gemini-flash"
    ];

    for (const model of list) {
        try {
            console.log(`Testing Gemini: ${model}`);
            const llm = new ChatGoogleGenerativeAI({
                model,
                apiKey: process.env.GEMINI_API_KEY,
                temperature: 0.3
            });
            const res = await llm.invoke([new HumanMessage("Hello")]);
            console.log(`SUCCESS with ${model}:`, res.content);
        } catch (err) {
            console.log(`FAILED with ${model}:`, err.message);
        }
    }
}

async function testOpenRouterFreeList() {
    const list = [
        "openrouter/free",
        "openrouter/auto",
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "meta-llama/llama-3.2-1b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "huggingfaceh4/zephyr-7b-beta:free"
    ];

    for (const model of list) {
        try {
            console.log(`Testing OpenRouter: ${model}`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Nova-Search"
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: "Say 'Hello'" }],
                    temperature: 0.3
                })
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`SUCCESS OpenRouter (${model}):`, data.choices?.[0]?.message?.content);
            } else {
                console.log(`FAILED OpenRouter (${model}):`, data.error?.message);
            }
        } catch (err) {
            console.log(`ERROR OpenRouter (${model}):`, err.message);
        }
    }
}

async function main() {
    await testGemini36();
    await testOpenRouterFreeList();
}

main();
