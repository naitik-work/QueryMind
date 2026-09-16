import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import SourcesList from "./SourcesList";
import BattleComparison from "../battle/BattleComparison";

export default function MessageItem({
    msg,
    index,
    onCopyResponse,
    copiedIndex
}) {
    const isUser = msg.role === "user";
    const sources = msg.metadata?.sources || [];
    const isBattle = Boolean(msg.metadata?.battle?.isBattle);

    if (isUser) {
        return (
            <div className="flex flex-col items-end">
                <div className="select-text max-w-[92%] sm:max-w-[80%] rounded-2xl rounded-br-xs px-4 py-3 text-sm bg-neutral-950 dark:bg-neutral-800 text-white shadow-xs">
                    <p className="select-text cursor-text whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                    </p>
                </div>
            </div>
        );
    }

    // AI Battle Message
    if (isBattle && msg.metadata?.battle) {
        return (
            <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs">
                        <span>⚔</span>
                        <span>AI Battle Arena</span>
                    </span>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        Two models compared by AI Judge
                    </span>
                </div>

                <div className="w-full">
                    <BattleComparison battle={msg.metadata.battle} />
                </div>
            </div>
        );
    }

    // Standard AI Message
    return (
        <div className="flex flex-col items-start">
            <div className="select-text max-w-[92%] sm:max-w-[80%] rounded-2xl rounded-bl-xs px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
                <SourcesList sources={sources} />

                <div className="select-text prose-QueryMind">
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
                                    <CodeBlock className={className}>
                                        {children}
                                    </CodeBlock>
                                );
                            }
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Copy button */}
            <div className="flex items-center gap-1 mt-1 text-neutral-400 dark:text-neutral-500 text-xs">
                <button
                    type="button"
                    onClick={() => onCopyResponse(msg.content, index)}
                    className="p-1 cursor-pointer rounded hover:text-neutral-900 dark:hover:text-neutral-200 transition"
                    title="Copy response"
                >
                    {copiedIndex === index ? (
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium text-[11px]">
                            Copied
                        </span>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
