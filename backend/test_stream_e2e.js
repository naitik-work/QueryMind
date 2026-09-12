import "dotenv/config";
import { streamResponse, generateResponse, generateChatTitle } from "./src/services/ai.service.js";

async function testE2E() {
    console.log("=== Testing Title Generation ===");
    const title = await generateChatTitle("Explain Quantum Computing and Superposition");
    console.log("Generated Title:", title);

    console.log("\n=== Testing Complete Generate ===");
    const genRes = await generateResponse({
        messages: [{ role: "user", content: "Tell me in 1 sentence what is JavaScript." }]
    });
    console.log("Generate Result:", genRes);

    console.log("\n=== Testing Streaming ===");
    const stream = streamResponse({
        messages: [{ role: "user", content: "List 3 colors in bullet points." }],
        onStatus: s => console.log("Status update:", s)
    });

    let fullText = "";
    for await (const event of stream) {
        if (event.type === "chunk") {
            process.stdout.write(event.text);
            fullText += event.text;
        } else if (event.type === "sources") {
            console.log("Sources received:", event.sources?.length);
        }
    }
    console.log("\n\nStream Finished successfully! Full text length:", fullText.length);
}

testE2E().catch(err => {
    console.error("E2E Test Failed:", err);
    process.exit(1);
});
