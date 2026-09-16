import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const JUDGE_SYSTEM_PROMPT = `You are an expert, impartial AI Judge evaluating two AI-generated responses to a user's query.

Your task is to critically compare both answers and determine which one is superior, or declare a tie if they are of virtually equal quality.

Evaluation Criteria:
1. Factual Correctness & Truthfulness: Heavily penalize any hallucinations, false facts, incorrect code syntax, or fabricated information.
2. Relevance & Directness: How well does each answer address the specific question or prompt asked?
3. Completeness & Depth: Does the response provide all necessary information, context, or code without unnecessary fluff?
4. Technical Accuracy: If code, algorithms, or technical explanations are involved, are they accurate, idiomatic, and functional?
5. Clarity & Organization: Is the formatting (headings, code blocks, bullet points) easy to read and understand?
6. Quality of Reasoning & Examples: Does the answer provide clear explanations and practical examples where helpful?

CRITICAL RULES:
- DO NOT favor an answer simply because it is longer. A concise, correct answer is often better than a verbose, repetitive one.
- DO NOT be biased by model style or markdown presentation.
- If both answers provide correct, comprehensive, and clear answers with negligible difference, select winner: "tie".
- Scores must be integers or decimals between 0 and 10 (e.g. 8.5, 9, 7).

You MUST return your evaluation strictly in valid JSON format matching the following schema:
{
  "response1Score": <number between 0 and 10>,
  "response2Score": <number between 0 and 10>,
  "winner": <"response1" | "response2" | "tie">,
  "response1Reasoning": "<concise breakdown of response 1's key strengths and any weaknesses or inaccuracies>",
  "response2Reasoning": "<concise breakdown of response 2's key strengths and any weaknesses or inaccuracies>",
  "finalReasoning": "<clear, decisive explanation of why the winner was selected or why they tied>"
}

Output ONLY the raw JSON object. Do not include markdown code block ticks (\`\`\`json), do not include preamble or postscript.`;

function getJudgeModel() {
    const provider = (process.env.BATTLE_JUDGE_PROVIDER || "gemini").toLowerCase();
    const modelName = process.env.BATTLE_JUDGE_MODEL || process.env.PRIMARY_AI_MODEL || "gemini-3.6-flash";

    if (provider === "gemini") {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is required for Judge evaluation");
        }
        return {
            name: "gemini",
            modelName,
            instance: new ChatGoogleGenerativeAI({
                model: modelName,
                apiKey: process.env.GEMINI_API_KEY,
                temperature: 0.2
            })
        };
    }

    // Default to Gemini
    return {
        name: "gemini",
        modelName,
        instance: new ChatGoogleGenerativeAI({
            model: modelName,
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.2
        })
    };
}

function parseJudgeJson(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Empty response received from Judge");
    }

    let cleaned = rawText.trim();

    // Remove markdown code fences if model enclosed JSON in ```json ... ```
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    // Extract first valid JSON object if there is extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }

    const parsed = JSON.parse(cleaned);

    let winner = (parsed.winner || "").toLowerCase().trim();
    if (winner !== "response1" && winner !== "response2" && winner !== "tie") {
        const s1 = Number(parsed.response1Score) || 0;
        const s2 = Number(parsed.response2Score) || 0;
        if (s1 > s2) winner = "response1";
        else if (s2 > s1) winner = "response2";
        else winner = "tie";
    }

    const normalizeScore = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return 5.0;
        return Math.max(0, Math.min(10, Math.round(num * 10) / 10));
    };

    return {
        response1Score: normalizeScore(parsed.response1Score),
        response2Score: normalizeScore(parsed.response2Score),
        winner,
        response1Reasoning: parsed.response1Reasoning || "No specific comments on Response 1.",
        response2Reasoning: parsed.response2Reasoning || "No specific comments on Response 2.",
        finalReasoning: parsed.finalReasoning || "Evaluated based on overall accuracy and clarity."
    };
}

/**
 * Evaluate two model responses for a given query
 */
export async function evaluateBattleResponses({ query, response1, response2 }) {
    const judge = getJudgeModel();

    const humanPrompt = `[USER QUERY]:
${query}

[RESPONSE 1] (${response1?.model || "Model 1"}):
${response1?.content || "(No response generated)"}

[RESPONSE 2] (${response2?.model || "Model 2"}):
${response2?.content || "(No response generated)"}

Please evaluate both responses now according to the criteria and output strictly the required JSON format.`;

    try {
        const messages = [
            new SystemMessage(JUDGE_SYSTEM_PROMPT),
            new HumanMessage(humanPrompt)
        ];

        const result = await judge.instance.invoke(messages);
        const rawContent = typeof result.content === "string" ? result.content : result.text || "";

        const parsed = parseJudgeJson(rawContent);

        return {
            ...parsed,
            provider: judge.name,
            model: judge.modelName
        };
    } catch (err) {
        console.warn("[JUDGE] Judge evaluation failed or returned unparseable content:", err.message);

        // Fallback: don't crash, return graceful status so responses remain viewable
        return {
            winner: "tie",
            response1Score: 7.0,
            response2Score: 7.0,
            response1Reasoning: "Evaluation details currently unavailable.",
            response2Reasoning: "Evaluation details currently unavailable.",
            finalReasoning: "The judge was temporarily unable to complete structured evaluation. Both generated responses are shown above for comparison.",
            provider: judge.name,
            model: judge.modelName,
            isFallback: true
        };
    }
}
