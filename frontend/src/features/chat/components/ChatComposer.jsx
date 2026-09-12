import { useState, useRef, useEffect } from "react";
import { FiArrowUp, FiX } from "react-icons/fi";

const ChatComposer = ({ onSend, disabled }) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + "px";
        }
    }, [value]);

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full px-4 pb-4 pt-1 sm:px-6 bg-transparent">
            <div className="mx-auto max-w-3xl">
                <div className="relative flex items-end gap-2 rounded-3xl border border-[#e5e5e5] dark:border-[#383838] bg-[#f4f4f4] dark:bg-[#2f2f2f] p-2 pl-4 shadow-sm transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-500">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message QueryMind..."
                        disabled={disabled}
                        rows={1}
                        className="flex-1 resize-none bg-transparent py-2 text-sm sm:text-base text-[#0d0d0d] dark:text-[#ececec] outline-none placeholder:text-[#8e8e8e] disabled:opacity-50 max-h-44"
                    />

                    {value && (
                        <button
                            onClick={() => setValue("")}
                            className="p-2 text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer mb-0.5"
                            title="Clear input"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!value.trim() || disabled}
                        className={`
                            flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition mb-0.5
                            ${value.trim() && !disabled
                                ? "bg-[#0d0d0d] dark:bg-[#ececec] text-white dark:text-[#0d0d0d] hover:opacity-90 active:scale-95 cursor-pointer"
                                : "bg-black/10 dark:bg-white/10 text-[#8e8e8e] cursor-not-allowed"
                            }
                        `}
                        title="Send message"
                    >
                        <FiArrowUp className="w-4 h-4" />
                    </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-[#8e8e8e]">
                    QueryMind can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
};

export default ChatComposer;
