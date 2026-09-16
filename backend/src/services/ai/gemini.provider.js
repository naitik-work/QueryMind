import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { searchInternet } from "../internet.service.js";

let geminiClient = null;

function getGeminiModel() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const modelName = process.env.PRIMARY_AI_MODEL || "gemini-3.6-flash";
    return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.4
    });
}

/**
 * Determine if search is needed based on prompt intent
 */
export function needsInternetSearch(query = "") {
    const q = query.toLowerCase();
    const triggerPatterns = [
        /\b(latest|news|today|yesterday|current|price|stock|update|recent|released|score|weather|now)\b/i,
        /\b(who is the (current|new)|what happened|who won)\b/i,
        /\b(search|google|browse|find online)\b/i
    ];
    return triggerPatterns.some(pattern => pattern.test(q));
}

/**
 * Check if the prompt is an email drafting or sending request
 */
export function isEmailDraftRequest(query = "") {
    if (!query || typeof query !== "string") return false;
    const q = query.trim().toLowerCase();

    // Ignore generic coding / tech inquiries unless specific email sending target is given
    const isCodeQuery = /\b(how\s+to|code|example|tutorial|library|package|nodemailer|api|syntax|script)\b/i.test(q);
    const hasEmailAddress = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(q);

    if (isCodeQuery && !hasEmailAddress) {
        return false;
    }

    // Direct action match: "draft email", "send an email", "compose a mail", "send mail", "shoot an email"
    const hasEmailIntent = /\b(draft|write|compose|send|shoot|dispatch|prepare)\s+(an?\s+)?(e-?mail|mail)\b/i.test(q);

    // Direct target match: "email user@example.com" or "mail user@example.com"
    const hasDirectTarget = /\b(e-?mail|mail)\s+(to\s+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i.test(q);

    // General send intent with email address present: e.g. "send this to abc@xyz.com"
    const hasSendAndAddress = hasEmailAddress && /\b(send|email|mail|forward|shoot|deliver)\b/i.test(q);

    return hasEmailIntent || hasDirectTarget || hasSendAndAddress;
}

/**
 * Extract recipient, subject, and body heuristics from email drafting query
 */
export function parseEmailDraftDetails(query = "") {
    const text = (query || "").trim();

    // 1. Extract email recipient
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const to = emailMatch ? emailMatch[1] : "";

    // 2. Extract subject if specified
    let subject = "Update from QueryMind";
    const subjectQuoted = text.match(/(?:with\s+)?subject\s*[:="']+\s*([^"'\n\r]+)["']/i);
    const subjectColon = text.match(/subject:\s*([^\n\r,]+)/i);
    const subjectAbout = text.match(/(?:about|regarding)\s+([^,.\n\r]+)/i);

    if (subjectQuoted && subjectQuoted[1].trim()) {
        subject = subjectQuoted[1].trim();
    } else if (subjectColon && subjectColon[1].trim()) {
        subject = subjectColon[1].trim();
    } else if (subjectAbout && subjectAbout[1].trim()) {
        subject = subjectAbout[1].trim();
    }

    // 3. Extract body content
    let body = "";
    const bodyExplicit = text.match(/(?:saying|with\s+(?:the\s+)?(?:body|content|message)|body:|message:)\s*[:"']*\s*([\s\S]+)/i);
    if (bodyExplicit && bodyExplicit[1].trim()) {
        body = bodyExplicit[1].replace(/["']+$/, "").trim();
    } else {
        // Fallback: strip command prefixes and recipient
        body = text
            .replace(/^(?:please\s+)?(?:draft|write|compose|send|shoot)\s+(?:an?\s+)?(?:e-?mail|mail)\s+/i, "")
            .replace(/(?:to\s+)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, "")
            .replace(/(?:with\s+)?subject\s*[:="']+\s*[^"'\n\r]+["']?/i, "")
            .replace(/^(?:about|saying|that|with)\s+/i, "")
            .trim();
    }

    if (!body) {
        body = "Hi,\n\nFollowing up on our recent conversation.\n\nBest regards,";
    }

    return { to, subject, body };
}


export class GeminiProvider {
    getName() {
        return "gemini";
    }

    getModelName() {
        return process.env.PRIMARY_AI_MODEL || "gemini-3.6-flash";
    }

    async generate({ messages, systemPrompt, onStatus }) {
        const model = getGeminiModel();
        const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

        let sources = [];
        let searchContext = "";

        if (needsInternetSearch(lastUserMsg)) {
            if (onStatus) onStatus({ status: "searching", label: "Searching the web..." });
            const searchRes = await searchInternet({ query: lastUserMsg });
            sources = searchRes.sources || [];
            if (searchRes.text) {
                searchContext = `\n\n[REAL-TIME SEARCH RESULTS]\n${searchRes.text}`;
            }
            if (onStatus) onStatus({ status: "reading", label: "Reading sources..." });
        }

        const formattedSystem = `${systemPrompt}${searchContext}`;
        const langChainMessages = [
            new SystemMessage(formattedSystem),
            ...messages.map(m => (m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)))
        ];

        if (onStatus) onStatus({ status: "generating", label: "Generating response..." });

        const result = await model.invoke(langChainMessages);
        const text = typeof result.content === "string" ? result.content : result.text || "";

        return {
            content: text,
            sources,
            provider: "gemini",
            model: this.getModelName()
        };
    }

    async *stream({ messages, systemPrompt, onStatus, signal }) {
        const model = getGeminiModel();
        const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

        let sources = [];
        let searchContext = "";

        if (needsInternetSearch(lastUserMsg)) {
            if (onStatus) onStatus({ status: "searching", label: "Searching the web..." });
            const searchRes = await searchInternet({ query: lastUserMsg });
            sources = searchRes.sources || [];
            if (searchRes.text) {
                searchContext = `\n\n[REAL-TIME SEARCH RESULTS]\n${searchRes.text}`;
            }
            if (onStatus) onStatus({ status: "reading", label: "Reading sources..." });
        }

        // Yield structured sources event
        if (sources.length > 0) {
            yield { type: "sources", sources };
        }

        const formattedSystem = `${systemPrompt}${searchContext}`;
        const langChainMessages = [
            new SystemMessage(formattedSystem),
            ...messages.map(m => (m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)))
        ];

        if (onStatus) onStatus({ status: "generating", label: "Generating response..." });

        const stream = await model.stream(langChainMessages, { signal });

        for await (const chunk of stream) {
            if (signal?.aborted) break;
            const textChunk = typeof chunk.content === "string" ? chunk.content : chunk.text || "";
            if (textChunk) {
                yield { type: "chunk", text: textChunk };
            }
        }
    }
}
