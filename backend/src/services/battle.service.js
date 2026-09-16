import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { battleGraph } from "./ai/battle.graph.js";

const DEFAULT_BATTLE_PROMPT = `You are a helpful, authoritative, and precise AI assistant.
Answer the user query clearly, accurately, and thoroughly with good structure, markdown formatting, and code blocks where applicable. Avoid unnecessary fluff.`;

/**
 * Helper to invoke an AI model based on provider configuration
 */
async function invokeBattleModel({ provider, modelName, query }) {
    const prov = (provider || "").toLowerCase();

    // 1. Google Gemini
    if (prov === "gemini") {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const model = new ChatGoogleGenerativeAI({
            model: modelName || "gemini-3.6-flash",
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.5
        });

        const messages = [
            new SystemMessage(DEFAULT_BATTLE_PROMPT),
            new HumanMessage(query)
        ];

        const res = await model.invoke(messages);
        const text = typeof res.content === "string" ? res.content : res.text || "";

        return {
            provider: "gemini",
            model: modelName || "gemini-3.6-flash",
            content: text.trim()
        };
    }

    // 2. Mistral AI
    if (prov === "mistral") {
        if (!process.env.MISTRAL_API_KEY) {
            throw new Error("MISTRAL_API_KEY is not configured");
        }

        const model = new ChatMistralAI({
            model: modelName || "mistral-small-latest",
            apiKey: process.env.MISTRAL_API_KEY,
            temperature: 0.5
        });

        const messages = [
            new SystemMessage(DEFAULT_BATTLE_PROMPT),
            new HumanMessage(query)
        ];

        const res = await model.invoke(messages);
        const text = typeof res.content === "string" ? res.content : res.text || "";

        return {
            provider: "mistral",
            model: modelName || "mistral-small-latest",
            content: text.trim()
        };
    }

    // 3. OpenRouter (with candidate list fallback)
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (apiKey) {
        const candidateModels = [
            modelName,
            "openrouter/free",
            "openrouter/auto",
            process.env.FALLBACK_AI_MODEL
        ].filter(Boolean);

        for (const candidate of candidateModels) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                        "X-Title": "Nova-Search-Battle"
                    },
                    body: JSON.stringify({
                        model: candidate,
                        messages: [
                            { role: "system", content: DEFAULT_BATTLE_PROMPT },
                            { role: "user", content: query }
                        ],
                        temperature: 0.5
                    })
                });

                const data = await response.json();
                if (response.ok && data.choices?.[0]?.message?.content) {
                    return {
                        provider: "openrouter",
                        model: candidate,
                        content: data.choices[0].message.content.trim()
                    };
                }
            } catch (err) {
                console.warn(`[BATTLE] OpenRouter model ${candidate} failed:`, err.message);
            }
        }
    }

    // 4. Mistral fallback if MISTRAL_API_KEY exists
    if (process.env.MISTRAL_API_KEY) {
        try {
            const mistralModel = new ChatMistralAI({
                model: "mistral-small-latest",
                apiKey: process.env.MISTRAL_API_KEY,
                temperature: 0.5
            });
            const res = await mistralModel.invoke([
                new SystemMessage(DEFAULT_BATTLE_PROMPT),
                new HumanMessage(query)
            ]);
            const text = typeof res.content === "string" ? res.content : res.text || "";
            return {
                provider: "mistral",
                model: "mistral-small-latest",
                content: text.trim()
            };
        } catch (mistralErr) {
            console.warn("[BATTLE] Mistral fallback failed:", mistralErr.message);
        }
    }

    // 5. Secondary Gemini fallback
    if (process.env.GEMINI_API_KEY) {
        console.warn(`[BATTLE] Fallback to Gemini 3.6 Flash for provider: ${provider}`);
        const fallbackGemini = new ChatGoogleGenerativeAI({
            model: "gemini-3.6-flash",
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.7
        });
        const res = await fallbackGemini.invoke([
            new SystemMessage(DEFAULT_BATTLE_PROMPT),
            new HumanMessage(query)
        ]);
        return {
            provider: "gemini",
            model: "gemini-3.6-flash-variant",
            content: (typeof res.content === "string" ? res.content : res.text || "").trim()
        };
    }

    throw new Error(`Unable to execute model for provider: ${provider}`);
}

/**
 * Main AI Battle Arena service
 */
export async function executeBattleService({ query, onStatus }) {
    if (!query || !query.trim()) {
        throw new Error("Query cannot be empty for Battle Mode");
    }

    const cleanQuery = query.trim();

    // Configure model 1
    const model1Provider = process.env.BATTLE_MODEL_1_PROVIDER || "gemini";
    const model1Model = process.env.BATTLE_MODEL_1_MODEL || process.env.PRIMARY_AI_MODEL || "gemini-3.6-flash";

    // Configure model 2 (ensure distinct from model 1)
    let model2Provider = process.env.BATTLE_MODEL_2_PROVIDER || "openrouter";
    let model2Model = process.env.BATTLE_MODEL_2_MODEL || "openrouter/free";

    if (onStatus) {
        onStatus({ status: "generating", label: "Generating two responses in parallel..." });
    }

    const model1Executor = async (q) => {
        return await invokeBattleModel({
            provider: model1Provider,
            modelName: model1Model,
            query: q
        });
    };

    const model2Executor = async (q) => {
        return await invokeBattleModel({
            provider: model2Provider,
            modelName: model2Model,
            query: q
        });
    };

    // Run LangGraph execution
    const graphResult = await battleGraph.invoke({
        query: cleanQuery,
        model1Executor,
        model2Executor
    });

    const { response1, response2, judge } = graphResult;

    const winnerName = judge?.winner === "response1"
        ? (response1?.model || "Response 1")
        : judge?.winner === "response2"
            ? (response2?.model || "Response 2")
            : "Tie";

    // Synthesized markdown representation for standard text fields
    const synthesizedContent = `### ⚖ AI Battle Mode Result

**Winner:** ${winnerName} (Score: ${judge?.response1Score ?? 0} vs ${judge?.response2Score ?? 0})

---

#### 🔹 Response 1 (${response1?.model || "Model 1"}):
${response1?.content || "No content"}

---

#### 🔸 Response 2 (${response2?.model || "Model 2"}):
${response2?.content || "No content"}

---

#### 🏆 AI Judge Evaluation:
${judge?.finalReasoning || "Evaluation completed."}`;

    return {
        battleMode: true,
        content: synthesizedContent,
        response1,
        response2,
        judge
    };
}
