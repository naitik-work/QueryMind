import { useDispatch, useSelector } from "react-redux";
import { setBattleMode } from "../../chat.slice";
import { updateUserPreferences } from "../../service/chat.api";
import { useToast } from "../../../../app/toast.hook";

export default function BattleModeToggle() {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const battleMode = useSelector(state => state.chat.battleMode);

    const handleToggle = async () => {
        const nextState = !battleMode;
        dispatch(setBattleMode(nextState));

        // Persist to user preferences in database (best-effort)
        try {
            await updateUserPreferences({ aiBattleMode: nextState });
        } catch {
            // localStorage already synced in reducer
        }

        if (nextState) {
            toast.success("AI Battle Mode enabled");
        } else {
            toast.info("AI Battle Mode disabled");
        }
    };

    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 transition">
            <div className="pr-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        AI Battle Mode
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                        {battleMode ? "ON" : "OFF"}
                    </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    Compare two AI responses and let a third AI judge them.
                </p>
            </div>
            <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    battleMode ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
                role="switch"
                aria-checked={battleMode}
                aria-label="Toggle AI Battle Mode"
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${
                        battleMode
                            ? "translate-x-5 bg-white dark:bg-black"
                            : "translate-x-0 bg-white dark:bg-neutral-400"
                    }`}
                />
            </button>
        </div>
    );
}
