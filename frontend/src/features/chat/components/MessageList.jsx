import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiCopy, FiCheck, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";

const QueryMindAvatar = () => (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d0d0d] dark:bg-[#ececec] text-white dark:text-[#0d0d0d] text-xs mt-0.5">
        <FiZap className="w-3.5 h-3.5" />
    </div>
);

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition cursor-pointer px-2 py-1 rounded hover:bg-[#eaeaea] dark:hover:bg-[#2f2f2f]"
            title="Copy content"
        >
            {copied ? (
                <>
                    <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied!</span>
                </>
            ) : (
                <>
                    <FiCopy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                </>
            )}
        </button>
    );
};

const MessageList = ({ messages, isAiTyping }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAiTyping]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((msg, index) => (
                    <div
                        key={msg._id || index}
                        className={`flex gap-3.5 animate-fade-in ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        {msg.role === "ai" && <QueryMindAvatar />}

                        <div
                            className={`max-w-[82%] text-sm sm:text-base leading-relaxed ${
                                msg.role === "user"
                                    ? "rounded-3xl bg-[#f4f4f4] dark:bg-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] px-5 py-3 font-normal"
                                    : "text-[#0d0d0d] dark:text-[#ececec] flex-1 min-w-0"
                            }`}
                        >
                            {msg.role === "user" ? (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                                <div>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => (
                                                    <p className="mb-4 last:mb-0 leading-7 text-[#0d0d0d] dark:text-[#ececec]">{children}</p>
                                                ),
                                                h1: ({ children }) => (
                                                    <h1 className="mb-4 mt-6 text-lg font-bold text-[#0d0d0d] dark:text-[#ececec] first:mt-0">{children}</h1>
                                                ),
                                                h2: ({ children }) => (
                                                    <h2 className="mb-3 mt-5 text-base font-bold text-[#0d0d0d] dark:text-[#ececec] first:mt-0">{children}</h2>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="mb-2 mt-4 text-sm font-bold text-[#0d0d0d] dark:text-[#ececec] first:mt-0">{children}</h3>
                                                ),
                                                ul: ({ children }) => (
                                                    <ul className="mb-4 list-disc pl-5 space-y-1.5">{children}</ul>
                                                ),
                                                ol: ({ children }) => (
                                                    <ol className="mb-4 list-decimal pl-5 space-y-1.5">{children}</ol>
                                                ),
                                                li: ({ children }) => (
                                                    <li className="leading-relaxed">{children}</li>
                                                ),
                                                code: ({ children, className }) => {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    const language = match ? match[1] : "";
                                                    const isBlock = className?.includes("language-") || String(children).includes("\n");

                                                    if (isBlock) {
                                                        return (
                                                            <div className="my-4 overflow-hidden rounded-xl border border-[#383838] bg-[#0d0d0d] text-slate-100 shadow-xs">
                                                                <div className="flex items-center justify-between border-b border-[#212121] bg-[#171717] px-4 py-2 text-xs text-[#b4b4b4]">
                                                                    <span className="font-mono text-xs font-semibold uppercase">{language || "code"}</span>
                                                                    <CopyButton text={String(children).replace(/\n$/, "")} />
                                                                </div>
                                                                <pre className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed">
                                                                    <code>{children}</code>
                                                                </pre>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <code className="rounded bg-[#efefef] dark:bg-[#2f2f2f] px-1.5 py-0.5 font-mono text-xs font-medium text-[#0d0d0d] dark:text-[#ececec]">
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                a: ({ children, href }) => (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 underline font-medium hover:text-blue-600 transition"
                                                    >
                                                        {children}
                                                    </a>
                                                ),
                                                blockquote: ({ children }) => (
                                                    <blockquote className="mb-4 border-l-2 border-zinc-500 pl-4 py-1 italic text-[#676767] dark:text-[#b4b4b4]">
                                                        {children}
                                                    </blockquote>
                                                ),
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Action row */}
                                    <div className="mt-2 flex items-center justify-start gap-4">
                                        <CopyButton text={msg.content} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isAiTyping && (
                    <div className="flex items-center gap-3.5 animate-fade-in">
                        <QueryMindAvatar />
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#f4f4f4] dark:bg-[#2f2f2f]">
                            <span className="typing-dot" />
                            <span className="typing-dot [animation-delay:0.2s]" />
                            <span className="typing-dot [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default MessageList;
