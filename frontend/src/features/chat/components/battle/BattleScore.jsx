export default function BattleScore({ score, label, isWinner }) {
    const numScore = parseFloat(score);
    const validScore = !isNaN(numScore) ? Math.round(numScore * 10) / 10 : 0;

    let colorClass = "bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700";

    if (validScore >= 8) {
        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    } else if (validScore >= 6) {
        colorClass = "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800";
    } else if (validScore >= 4) {
        colorClass = "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    } else if (validScore > 0) {
        colorClass = "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
    }

    return (
        <div className="flex items-center gap-2">
            {label && (
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {label}:
                </span>
            )}
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass} ${
                    isWinner ? "ring-2 ring-emerald-500/30" : ""
                }`}
            >
                <span>{validScore}</span>
                <span className="text-[10px] opacity-60">/ 10</span>
            </span>
        </div>
    );
}
