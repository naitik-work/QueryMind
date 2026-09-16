export default function SourcesList({ sources }) {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <svg
                    className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                </svg>
                <span>Sources ({sources.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((src, idx) => (
                    <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group cursor-pointer flex flex-col p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-zinc-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition shadow-2xs"
                    >
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 truncate mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500"></span>
                            <span className="truncate">{src.domain || "Web Source"}</span>
                        </div>
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 group-hover:underline line-clamp-1 transition">
                            {src.title}
                        </p>
                        {src.snippet && (
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                                {src.snippet}
                            </p>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
}
