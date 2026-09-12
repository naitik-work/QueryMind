import "dotenv/config";
import { OpenRouterProvider } from "./src/services/ai/openrouter.provider.js";

async function testFallbackStream() {
    console.log("=== Testing OpenRouter Streaming Fallback ===");
    const openrouter = new OpenRouterProvider();

    const stream = openrouter.stream({
        messages: [{ role: "user", content: "Write a 2-line poem about the ocean." }],
        systemPrompt: "You are Nova, an AI assistant.",
        onStatus: s => console.log("Status:", s)
    });

    let text = "";
    for await (const event of stream) {
        if (event.type === "chunk") {
            process.stdout.write(event.text);
            text += event.text;
        }
    }
    console.log("\n\nOpenRouter Fallback Stream Finished successfully! Length:", text.length);
}

testFallbackStream().catch(err => {
    console.error("Fallback Test Failed:", err);
    process.exit(1);
});
