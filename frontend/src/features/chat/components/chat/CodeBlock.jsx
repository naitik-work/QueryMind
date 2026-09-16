import { useState } from "react";
import { useToast } from "../../../../app/toast.hook";

export default function CodeBlock({ children, className }) {
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
        <div className="relative my-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 text-xs shadow-2xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-900/90 border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                <span>{language}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex cursor-pointer items-center gap-1 text-neutral-400 hover:text-white transition"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white font-medium">Copied!</span>
                        </>
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
            <pre className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed">
                <code>{children}</code>
            </pre>
        </div>
    );
}
