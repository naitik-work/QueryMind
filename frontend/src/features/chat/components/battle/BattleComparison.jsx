import BattleResponse from "./BattleResponse";
import BattleJudge from "./BattleJudge";

export default function BattleComparison({ battle }) {
    if (!battle) return null;

    const { response1, response2, judge } = battle;

    const isWinner1 = judge?.winner === "response1";
    const isWinner2 = judge?.winner === "response2";
    const isTie = judge?.winner === "tie";

    return (
        <div className="w-full space-y-4 my-2">
            {/* Parallel Model Responses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <BattleResponse
                    title="Response 1"
                    modelName={response1?.model}
                    provider={response1?.provider}
                    content={response1?.content}
                    score={judge?.response1Score}
                    isWinner={isWinner1}
                    isTie={isTie}
                />
                <BattleResponse
                    title="Response 2"
                    modelName={response2?.model}
                    provider={response2?.provider}
                    content={response2?.content}
                    score={judge?.response2Score}
                    isWinner={isWinner2}
                    isTie={isTie}
                />
            </div>

            {/* AI Judge Evaluation Card */}
            {judge && (
                <BattleJudge
                    judge={judge}
                    model1Name={response1?.model}
                    model2Name={response2?.model}
                />
            )}
        </div>
    );
}
