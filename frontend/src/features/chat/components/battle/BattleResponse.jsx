import { useState } from "react";
import ReactMarkdown from "react-markdown";
import BattleScore from "./BattleScore";
import { useToast } from "../../../../app/toast.hook";

function BattleCodeBlock({ children, className }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const codeString = String(children).replace(/\n$/, "");
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-2.5 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 text-xs shadow-2xs">
            <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/90 border-b border-neutral-800 text-neutral-400 font-mono text-[10px]">
                <span>{language}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex cursor-pointer items-center gap-1 text-neutral-400 hover:text-white transition"
                    title="Copy code"
                >
                    {copied ? (
                        <span className="text-white font-medium">Copied!</span>
                    ) : (
                        <span>Copy</span>
                    )}
                </button>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed">
                <code>{children}</code>
            </pre>
        </div>
    );
}

export default function BattleResponse({
    title,
    modelName,
    provider,
    content,
    score,
    isWinner,
    isTie
}) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success(`${title} copied to clipboard`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`flex flex-col h-full rounded-2xl border transition-all shadow-xs overflow-hidden ${
                isWinner
                    ? "border-emerald-500/60 dark:border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 ring-1 ring-emerald-500/30"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60"
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                        {title}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {modelName || "AI Model"}
                    </span>
                    {provider && (
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500">
                            ({provider})
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isWinner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 animate-pulse">
                            <span>🏆</span>
                            <span>Winner</span>
                        </span>
                    )}
                    {isTie && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            Tie
                        </span>
                    )}
                    {typeof score !== "undefined" && score !== null && (
                        <BattleScore score={score} isWinner={isWinner} />
                    )}
                </div>
            </div>

            {/* Markdown Body */}
            <div className="flex-1 p-4 overflow-y-auto text-xs sm:text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 prose-QueryMind select-text">
                <ReactMarkdown
                    components={{
                        code({ inline, className, children, ...props }) {
                            if (inline) {
                                return (
                                    <code
                                        className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            }
                            return (
                                <BattleCodeBlock className={className}>
                                    {children}
                                </BattleCodeBlock>
                            );
                        }
                    }}
                >
                    {content || "_No response content available_"}
                </ReactMarkdown>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-end bg-neutral-50/40 dark:bg-neutral-900/30">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition cursor-pointer p-1 rounded"
                    title={`Copy ${title}`}
                >
                    {copied ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
