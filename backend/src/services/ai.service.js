import { aiProviderManager } from "./ai/provider.manager.js";

/**
 * Generate complete AI response with fallback handling
 */
export async function generateResponse(input) {
    let messages = [];
    let preferences = {};
    let memories = [];
    let extraContext = "";

    if (Array.isArray(input)) {
        messages = input;
    } else if (input && typeof input === "object") {
        messages = input.messages || [];
        preferences = input.preferences || {};
        memories = input.memories || [];
        extraContext = input.extraContext || "";
    }

    return await aiProviderManager.generateResponse({
        messages,
        preferences,
        memories,
        extraContext
    });
}

/**
 * Stream AI response chunks with fallback handling
 */
export async function* streamResponse(input) {
    let messages = [];
    let preferences = {};
    let memories = [];
    let extraContext = "";
    let onStatus = input.onStatus;
    let signal = input.signal;

    if (Array.isArray(input)) {
        messages = input;
    } else if (input && typeof input === "object") {
        messages = input.messages || [];
        preferences = input.preferences || {};
        memories = input.memories || [];
        extraContext = input.extraContext || "";
    }

    yield* aiProviderManager.streamResponse({
        messages,
        preferences,
        memories,
        extraContext,
        onStatus,
        signal
    });
}

/**
 * Generate a concise conversation title with multi-layer fallback
 */
export async function generateChatTitle(message) {
    if (!message || !message.trim()) {
        return "New conversation";
    }

    const cleanInput = message.trim();
    const openRouterApiKey = process.env.OPEN_ROUTER_API_KEY;

    if (openRouterApiKey) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const model = process.env.FALLBACK_AI_MODEL || "openrouter/free";

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterApiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                    "X-Title": "QueryMind"
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: "You are a title generator. Generate a concise, engaging title capturing the topic in 2 to 4 words. Do not use quotes. Return ONLY the title text."
                        },
                        {
                            role: "user",
                            content: `Generate title for: "${cleanInput.slice(0, 150)}"`
                        }
                    ],
                    max_tokens: 16,
                    temperature: 0.3
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const title = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, "");
                if (title && title.length > 1 && title.length < 50) {
                    return title;
                }
            }
        } catch (err) {
            console.warn("[TITLE] OpenRouter title generation warning:", err.message);
        }
    }

    // Deterministic fallback title based on first words
    const words = cleanInput.split(/\s+/).slice(0, 4).join(" ");
    const fallbackTitle = words.charAt(0).toUpperCase() + words.slice(1);
    return fallbackTitle.length > 40 ? `${fallbackTitle.slice(0, 37)}...` : fallbackTitle;
}
