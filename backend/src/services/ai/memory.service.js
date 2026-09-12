import memoryModel from "../../models/memory.model.js";
import userModel from "../../models/user.model.js";

/**
 * Format memories into context instructions for the LLM
 */
export function formatMemoriesForContext(memories = [], preferences = {}) {
    const lines = [];

    if (preferences.preferredName) {
        lines.push(`- User's preferred name: ${preferences.preferredName}`);
    }
    if (preferences.responseStyle) {
        lines.push(`- Response style preference: ${preferences.responseStyle}`);
    }
    if (preferences.technicalLevel) {
        lines.push(`- Technical level: ${preferences.technicalLevel}`);
    }

    memories.forEach(mem => {
        lines.push(`- [${mem.type}]: ${mem.content}`);
    });

    if (lines.length === 0) return "";

    return `\n\n[USER PERSONALIZATION & PERSISTENT MEMORY]
You have access to the user's persistent profile and remembered facts across conversations:
${lines.join("\n")}
Important Guidelines:
1. When the user asks what their name is, who they are, or what you remember about them, refer to these persistent memory facts accurately and directly.
2. Incorporate these preferences naturally into answers without mentioning the internal memory system unless asked.
3. CURRENT USER INSTRUCTIONS ALWAYS OVERRIDE THESE PERSISTENT PREFERENCES if there is any conflict.`;
}

/**
 * Extract durable memories and preferences from a user message
 */
export function extractMemoriesFromText(text = "") {
    const trimmed = text.trim();
    const results = [];

    // 1. Direct name statement ("My name is Hamza", "Call me Hamza Khan", "I am Hamza, remember it")
    const nameMatch = trimmed.match(/(?:my name is|call me|i am called)\s+([a-zA-Z0-9_\-\s]+?)(?:[,.]|\s+and\s+|\s+please|\s+remember|\s+save|$)/i);
    if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim().replace(/[.!?]+$/, "");
        if (name.length >= 2 && name.length <= 40 && !/^(a|an|the|trying|learning|working|looking|wondering)$/i.test(name)) {
            results.push({
                type: "profile",
                content: `User's name is ${name}`,
                preferredName: name,
                importance: 5
            });
        }
    }

    // 2. Remember at start ("Remember that my name is Hamza", "Please remember I prefer React")
    const rememberStart = trimmed.match(/^(?:please\s+)?remember\s+(?:that\s+|to\s+)?(.+)/i);
    if (rememberStart && rememberStart[1]) {
        let content = rememberStart[1].trim().replace(/[.!?]+$/, "");
        if (content.length >= 3 && content.length <= 300) {
            results.push({
                type: "instruction",
                content,
                importance: 5
            });
        }
    }

    // 3. Remember at end ("My name is Hamza, please remember it", "I prefer TypeScript and remember this")
    const rememberEnd = trimmed.match(/^(.+?)(?:[,.]|\s+and)?\s+(?:please\s+)?(?:remember\s+(?:it|this|that|me)|save\s+(?:this|it)|keep\s+in\s+mind)/i);
    if (rememberEnd && rememberEnd[1]) {
        let content = rememberEnd[1].trim().replace(/^(?:please\s+)?/, "").replace(/[.!?]+$/, "");
        if (content.length >= 3 && content.length <= 300) {
            results.push({
                type: "instruction",
                content,
                importance: 5
            });
        }
    }

    // 4. Preferences ("I prefer Python", "Always use dark mode", "I like clean comments")
    const prefMatch = trimmed.match(/^(?:always\s+)?(?:i\s+prefer|i\s+like|i\s+love|prefer)\s+(.+)/i);
    if (prefMatch && prefMatch[1]) {
        let content = prefMatch[1].trim().replace(/[.!?]+$/, "");
        if (content.length >= 3 && content.length <= 300) {
            results.push({
                type: "preference",
                content: `Prefers ${content}`,
                importance: 4
            });
        }
    }

    // 5. Profession / Role / Profile
    const roleMatch = trimmed.match(/^(?:i\s+work\s+as|my\s+role\s+is|my\s+job\s+is|i\s+am\s+an?\s+(?:software|web|fullstack|frontend|backend|engineer|developer|designer|student))\s*(.+)?/i);
    if (roleMatch) {
        let content = trimmed.replace(/[.!?]+$/, "");
        results.push({
            type: "profile",
            content,
            importance: 4
        });
    }

    return results;
}

/**
 * Detect and persist durable memory in the database
 */
export async function detectAndStoreDurableMemory({ userId, message }) {
    if (!userId || !message) return null;

    try {
        const extractedItems = extractMemoriesFromText(message);
        if (extractedItems.length === 0) return null;

        for (const item of extractedItems) {
            // If preferred name was extracted, update user profile
            if (item.preferredName) {
                await userModel.findByIdAndUpdate(userId, {
                    "preferences.preferredName": item.preferredName
                });
                console.log(`[MEMORY] Updated user ${userId} preferredName to: "${item.preferredName}"`);
            }

            // Check if identical memory already exists for user
            const existing = await memoryModel.findOne({
                user: userId,
                content: { $regex: new RegExp(`^${item.content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
            });

            if (!existing) {
                await memoryModel.create({
                    user: userId,
                    type: item.type,
                    content: item.content,
                    importance: item.importance,
                    source: "detected"
                });
                console.log(`[MEMORY] Saved memory for user ${userId}: [${item.type}] "${item.content}"`);
            }
        }

        return true;
    } catch (err) {
        console.warn("[MEMORY] Failed to detect or store memory:", err.message);
        return null;
    }
}

