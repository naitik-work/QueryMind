export default function LoadingScreen({ message = "Initializing Nova workspace..." }) {
    return (
        <div className="min-h-screen h-[100dvh] w-full flex flex-col items-center justify-center bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors relative overflow-hidden select-none">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neutral-200/40 dark:bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Glowing brand icon with spinning ring */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white animate-spin" />
                    <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xl shadow-lg">
                        N
                    </div>
                </div>

                {/* Brand title and version badge */}
                <div className="flex items-center gap-2 pt-1">
                    <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white">
                        Nova
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                        2.0
                    </span>
                </div>

                {/* Status pill with pulsing dot */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {message}
                    </span>
                </div>

                {/* Subtle loading skeleton bar */}
                <div className="w-32 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mt-1">
                    <div className="w-full h-full bg-neutral-900 dark:bg-white origin-left animate-pulse" />
                </div>
            </div>
        </div>
    );
}
