import { useState } from "react";
import BattleScore from "./BattleScore";

export default function BattleJudge({
    judge,
    model1Name,
    model2Name
}) {
    const [showBreakdown, setShowBreakdown] = useState(false);

    if (!judge) return null;

    const winner = judge.winner;
    const isResponse1Winner = winner === "response1";
    const isResponse2Winner = winner === "response2";
    const isTie = winner === "tie";

    let winnerLabel = "Tie (Equal Quality)";
    let winnerSubtext = "Both models provided comparable answers.";

    if (isResponse1Winner) {
        winnerLabel = `Response 1 (${model1Name || "Model 1"}) Wins`;
        winnerSubtext = "Selected as the superior answer based on accuracy and reasoning.";
    } else if (isResponse2Winner) {
        winnerLabel = `Response 2 (${model2Name || "Model 2"}) Wins`;
        winnerSubtext = "Selected as the superior answer based on accuracy and reasoning.";
    }

    return (
        <div className="rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-md p-5 space-y-4 transition">
            {/* Judge Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-sm shadow-2xs">
                        ⚖
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                AI Judge Evaluation
                            </h3>
                            {judge.model && (
                                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                                    via {judge.model}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Impartial evaluation of factual correctness, clarity, and reasoning
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <BattleScore
                        label="Response 1"
                        score={judge.response1Score}
                        isWinner={isResponse1Winner}
                    />
                    <span className="text-xs text-neutral-400 font-bold">vs</span>
                    <BattleScore
                        label="Response 2"
                        score={judge.response2Score}
                        isWinner={isResponse2Winner}
                    />
                </div>
            </div>

            {/* Winner Announcement Banner */}
            <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isTie
                        ? "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700"
                        : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60"
                }`}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                        {isTie ? "⚖" : "🏆"}
                    </span>
                    <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">
                            {winnerLabel}
                        </p>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                            {winnerSubtext}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowBreakdown(prev => !prev)}
                    className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer shrink-0"
                >
                    {showBreakdown ? "Hide Breakdown" : "View Breakdown"}
                </button>
            </div>

            {/* Final Decisive Reasoning */}
            {judge.finalReasoning && (
                <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Why this response won:
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed bg-neutral-50 dark:bg-neutral-950/40 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        {judge.finalReasoning}
                    </p>
                </div>
            )}

            {/* Optional Detailed Model Breakdown */}
            {showBreakdown && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                Response 1 Analysis ({model1Name || "Model 1"}):
                            </span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                {judge.response1Score}/10
                            </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-normal">
                            {judge.response1Reasoning || "No details provided."}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                Response 2 Analysis ({model2Name || "Model 2"}):
                            </span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                {judge.response2Score}/10
                            </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-normal">
                            {judge.response2Reasoning || "No details provided."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
