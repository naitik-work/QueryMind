export default function ToastContainer({ toasts, onDismiss }) {
    if (!toasts || toasts.length === 0) return null;

    const renderIcon = (type) => {
        switch (type) {
            case "success":
                return (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case "error":
                return (
                    <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case "warning":
                return (
                    <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case "info":
            default:
                return (
                    <div className="w-5 h-5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                        N
                    </div>
                );
        }
    };

    return (
        <aside
            aria-live="polite"
            aria-atomic="true"
            className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2.5 pointer-events-none"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="alert"
                    className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg dark:shadow-2xl text-neutral-900 dark:text-neutral-100 animate-toast-in transition-all"
                >
                    {renderIcon(toast.type)}

                    <div className="flex-1 min-w-0 pt-0.5">
                        {toast.title && (
                            <p className="text-xs font-semibold tracking-tight text-neutral-900 dark:text-white truncate">
                                {toast.title}
                            </p>
                        )}
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed break-words">
                            {toast.message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onDismiss(toast.id)}
                        className="cursor-pointer -mr-1 -mt-1 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        aria-label="Dismiss toast"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </aside>
    );
}
