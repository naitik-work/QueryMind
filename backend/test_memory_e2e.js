import "dotenv/config";
import mongoose from "mongoose";
import userModel from "./src/models/user.model.js";
import memoryModel from "./src/models/memory.model.js";
import { detectAndStoreDurableMemory, formatMemoriesForContext } from "./src/services/ai/memory.service.js";
import { generateResponse } from "./src/services/ai.service.js";

async function runMemoryTest() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/perplexity";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for memory test");

    // Create or find test user
    let user = await userModel.findOne({ email: "memory_tester@test.com" });
    if (!user) {
        user = await userModel.create({
            username: "tester_hamza",
            email: "memory_tester@test.com",
            password: "password12345"
        });
    }

    console.log(`\n--- Turn 1: User says name and asks to remember ---`);
    const turn1Message = "My name is Hamza and remember it.";
    await detectAndStoreDurableMemory({ userId: user._id, message: turn1Message });

    // Fetch updated user and memories
    const updatedUser = await userModel.findById(user._id);
    const storedMemories = await memoryModel.find({ user: user._id });
    console.log("Updated user preferredName:", updatedUser.preferences?.preferredName);
    console.log("Stored memories in DB:", storedMemories.map(m => `[${m.type}] ${m.content}`));

    console.log(`\n--- Turn 2 (New Chat): User asks 'What is my name?' ---`);
    const prompt = formatMemoriesForContext(storedMemories, updatedUser.preferences);
    console.log("Formatted context prompt injected into LLM:\n", prompt);

    const aiRes = await generateResponse({
        messages: [{ role: "user", content: "What is my name?" }],
        preferences: updatedUser.preferences,
        memories: storedMemories
    });

    console.log("\nAI Response in new chat:\n", typeof aiRes === "string" ? aiRes : aiRes.content);

    // Clean up test user & memories
    await memoryModel.deleteMany({ user: user._id });
    await userModel.deleteOne({ _id: user._id });
    await mongoose.disconnect();
    console.log("\n--- Memory E2E Test Completed Successfully ---");
}

runMemoryTest().catch(err => {
    console.error("Memory test failed:", err);
    process.exit(1);
});
