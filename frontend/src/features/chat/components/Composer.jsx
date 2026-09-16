import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "../../../app/toast.hook";
import { toggleBattleMode } from "../chat.slice";

export default function Composer({
    input,
    setInput,
    onSend,
    onStop,
    isStreaming,
    isLoading,
    generationStatus
}) {
    const dispatch = useDispatch();
    const battleMode = useSelector(state => state.chat.battleMode);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const { toast } = useToast();

    // Auto-resize textarea up to 160px
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const newHeight = Math.min(el.scrollHeight, 160);
        el.style.height = `${Math.max(newHeight, 44)}px`;
    }, [input]);

    // Cleanup voice recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore already stopped
                }
            }
        };
    }, []);

    const toggleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.info("Voice speech recognition is not supported in this browser. Please try Chrome or Edge.");
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.warn(e);
                }
            }
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                if (transcript) {
                    setInput((prev) => {
                        const trimmed = prev.trim();
                        return trimmed ? `${trimmed} ${transcript}` : transcript;
                    });
                }
            };

            recognition.onerror = (event) => {
                console.warn("[VOICE] Recognition error:", event.error);
                if (event.error === "not-allowed") {
                    toast.error("Microphone access was denied. Please allow microphone permissions.");
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error("[VOICE] Failed to start:", err);
            toast.error("Could not activate microphone.");
            setIsListening(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (isStreaming) {
                return;
            }
            if (input.trim()) {
                if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                }
                onSend(input.trim());
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isStreaming) {
            onStop();
            return;
        }
        if (input.trim()) {
            if (isListening && recognitionRef.current) {
                recognitionRef.current.stop();
            }
            onSend(input.trim());
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4">
            {/* Status indicator pill above composer if active */}
            {generationStatus ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 shadow-2xs animate-pulse-subtle">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-ping"></span>
                        <span>{generationStatus}</span>
                    </span>
                </div>
            ) : battleMode ? (
                <div className="flex items-center justify-between px-3 py-1 mb-2 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-900 dark:text-white font-semibold flex items-center gap-1.5">
                            <span>⚔</span>
                            <span>AI Battle Mode ON</span>
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                            Query will run two models in parallel with AI Judge evaluation
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(toggleBattleMode())}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                    >
                        Turn OFF
                    </button>
                </div>
            ) : null}

            <form
                onSubmit={handleSubmit}
                className="relative flex items-end gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-2 shadow-sm focus-within:border-neutral-500 dark:focus-within:border-neutral-500 transition-all duration-150"
            >
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        battleMode
                            ? "Ask a question to compare two AI models in battle..."
                            : "Ask QueryMind anything, search the web, or draft an email..."
                    }
                    className="w-full resize-none bg-transparent px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none max-h-40 overflow-y-auto leading-relaxed"
                />

                <div className="flex items-center gap-1.5 shrink-0 pb-1 pr-1">
                    {/* Voice Input Microphone Button */}
                    <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-2 cursor-pointer rounded-xl transition shadow-2xs ${
                            isListening
                                ? "bg-red-500 text-white animate-pulse ring-2 ring-red-400"
                                : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                        title={isListening ? "Listening... click to stop" : "Voice input (speech-to-text)"}
                        aria-label={isListening ? "Stop listening" : "Start voice input"}
                    >
                        {isListening ? (
                            <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="6" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>

                    {isStreaming ? (
                        <button
                            type="button"
                            onClick={onStop}
                            className="p-2 cursor-pointer rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-black transition shadow-2xs"
                            title="Stop generating"
                            aria-label="Stop generating"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="p-2 cursor-pointer rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs focus:outline-none"
                            title="Send message (Enter)"
                            aria-label="Send message"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    )}
                </div>
            </form>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                <span className="truncate pr-2">QueryMind synthesizes real-time sources with structured formatting.</span>
                <span className="hidden sm:inline shrink-0">
                    <strong>Shift + Enter</strong> for new line
                </span>
            </div>
        </div>
    );
}
