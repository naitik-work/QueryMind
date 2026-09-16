import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { evaluateBattleResponses } from "./judge.service.js";

/**
 * LangGraph State Definition for AI Battle Arena
 */
export const BattleStateAnnotation = Annotation.Root({
    query: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => ""
    }),
    model1Executor: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => null
    }),
    model2Executor: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => null
    }),
    response1: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => null
    }),
    response2: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => null
    }),
    judge: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => null
    }),
    error: Annotation({
        reducer: (curr, next) => next ?? curr,
        default: () => null
    })
});

/**
 * Node 1: generate_responses
 * Concurrently executes Model 1 and Model 2 via Promise.allSettled
 */
async function generateResponsesNode(state) {
    const { query, model1Executor, model2Executor } = state;

    if (!model1Executor || !model2Executor) {
        throw new Error("Both model executors must be provided to the battle graph");
    }

    console.log("[BATTLE GRAPH] Executing Model 1 and Model 2 concurrently in parallel...");

    const [res1Result, res2Result] = await Promise.allSettled([
        model1Executor(query),
        model2Executor(query)
    ]);

    let response1;
    let response2;

    if (res1Result.status === "fulfilled") {
        response1 = res1Result.value;
    } else {
        console.error("[BATTLE GRAPH] Model 1 execution failed:", res1Result.reason?.message);
        response1 = {
            model: "Model 1",
            provider: "unavailable",
            content: `Model 1 was unable to generate a response: ${res1Result.reason?.message || "Service error"}`
        };
    }

    if (res2Result.status === "fulfilled") {
        response2 = res2Result.value;
    } else {
        console.error("[BATTLE GRAPH] Model 2 execution failed:", res2Result.reason?.message);
        response2 = {
            model: "Model 2",
            provider: "unavailable",
            content: `Model 2 was unable to generate a response: ${res2Result.reason?.message || "Service error"}`
        };
    }

    return {
        response1,
        response2
    };
}

/**
 * Node 2: judge_responses
 * Runs the structured judge model to evaluate and score both answers
 */
async function judgeResponsesNode(state) {
    const { query, response1, response2 } = state;

    console.log("[BATTLE GRAPH] AI Judge evaluating answers...");

    const judgeResult = await evaluateBattleResponses({
        query,
        response1,
        response2
    });

    return {
        judge: judgeResult
    };
}

/**
 * Build and compile the LangGraph workflow
 */
export function buildBattleGraph() {
    const workflow = new StateGraph(BattleStateAnnotation)
        .addNode("generate_responses", generateResponsesNode)
        .addNode("judge_responses", judgeResponsesNode)
        .addEdge(START, "generate_responses")
        .addEdge("generate_responses", "judge_responses")
        .addEdge("judge_responses", END);

    return workflow.compile();
}

export const battleGraph = buildBattleGraph();
