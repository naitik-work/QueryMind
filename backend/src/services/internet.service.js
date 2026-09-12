import { tavily as Tavily } from "@tavily/core";

let tavilyClient = null;

function getTavilyClient() {
    if (!tavilyClient && process.env.TAVILY_API_KEY) {
        tavilyClient = Tavily({
            apiKey: process.env.TAVILY_API_KEY
        });
    }
    return tavilyClient;
}

export const searchInternet = async ({ query }) => {
    const client = getTavilyClient();
    if (!client) {
        console.warn("[SEARCH] Tavily API key is missing or not configured");
        return {
            sources: [],
            text: "Internet search is currently unavailable because no API key is configured.",
            raw: null
        };
    }

    try {
        console.log(`[SEARCH] Querying Tavily: "${query}"`);
        const response = await client.search(query, {
            maxResults: 5,
            searchDepth: "basic",
            includeAnswer: true
        });

        const rawResults = response.results || [];
        const sources = rawResults.map(item => {
            let domain = "";
            try {
                domain = new URL(item.url).hostname.replace(/^www\./, "");
            } catch {
                domain = "web";
            }

            return {
                title: item.title || domain,
                url: item.url,
                domain,
                snippet: item.content || item.snippet || ""
            };
        });

        // Format a concise context block for the model
        const contextLines = sources.map((s, idx) => `[${idx + 1}] "${s.title}" (${s.url})\n${s.snippet}`);
        const formattedContext = contextLines.join("\n\n");

        return {
            sources,
            answer: response.answer || null,
            text: formattedContext,
            raw: response
        };
    } catch (error) {
        console.error("[SEARCH] Tavily search failed:", error.message);
        return {
            sources: [],
            text: `Search attempt failed: ${error.message}`,
            raw: null
        };
    }
};
