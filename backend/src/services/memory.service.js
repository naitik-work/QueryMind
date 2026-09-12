import memoryModel from "../models/memory.model.js";
import { extractMemoryFromMessage } from "./ai.service.js";

const SENSITIVE_PATTERNS = /password|passwd|secret|token|api.?key|credit.?card|ssn|social.?security|cvv|pin.?code/i;

export async function extractAndSaveMemories(message, userId, chatId) {
    try {
        const candidates = await extractMemoryFromMessage(message);
        if (!Array.isArray(candidates) || candidates.length === 0) return;

        const validCategories = ["personal", "education", "career", "preferences", "projects", "skills", "other"];

        for (const memory of candidates) {
            if (!memory.key || !memory.value || !memory.category) continue;
            if (SENSITIVE_PATTERNS.test(memory.key) || SENSITIVE_PATTERNS.test(memory.value)) continue;

            const category = validCategories.includes(memory.category.toLowerCase().trim())
                ? memory.category.toLowerCase().trim()
                : "other";

            await memoryModel.findOneAndUpdate(
                { user: userId, key: memory.key.toLowerCase().trim() },
                {
                    user: userId,
                    key: memory.key.toLowerCase().trim(),
                    value: memory.value.trim(),
                    category,
                    source: chatId ? chatId.toString() : undefined,
                    confidence: typeof memory.confidence === "number" ? memory.confidence : 0.8
                },
                { upsert: true, new: true }
            );
        }
    } catch (err) {
        console.log("Memory extraction error:", err.message);
    }
}

export async function getRelevantMemories(userId, query) {
    try {
        let memories = [];

        if (query && query.length > 2) {
            try {
                memories = await memoryModel
                    .find(
                        { user: userId, $text: { $search: query } },
                        { score: { $meta: "textScore" } }
                    )
                    .sort({ score: { $meta: "textScore" } })
                    .limit(15)
                    .lean();
            } catch {
                memories = [];
            }
        }

        if (memories.length < 5) {
            const existingIds = memories.map(m => m._id);
            const additional = await memoryModel
                .find({
                    user: userId,
                    _id: { $nin: existingIds }
                })
                .sort({ confidence: -1, updatedAt: -1 })
                .limit(15 - memories.length)
                .lean();

            memories = [...memories, ...additional];
        }

        return memories;
    } catch (err) {
        console.log("Memory retrieval error:", err.message);
        return [];
    }
}

export async function getAllMemories(userId) {
    return memoryModel
        .find({ user: userId })
        .sort({ category: 1, updatedAt: -1 })
        .lean();
}

export async function deleteMemory(memoryId, userId) {
    return memoryModel.findOneAndDelete({ _id: memoryId, user: userId });
}

export async function clearAllMemories(userId) {
    return memoryModel.deleteMany({ user: userId });
}
