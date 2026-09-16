/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "../../../app/toast.hook";
import CodeBlock from "./chat/CodeBlock";
import SourcesList from "./chat/SourcesList";
import MessageItem from "./chat/MessageItem";

function EmailActionCard({ action, onConfirm, onCancel }) {
  const [to, setTo] = useState(action.details?.to || "");
  const [subject, setSubject] = useState(action.details?.subject || "");
  const [body, setBody] = useState(action.details?.body || "");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setTo(action.details?.to || "");
    setSubject(action.details?.subject || "");
    setBody(action.details?.body || "");
    setIsSending(false);
  }, [action.actionId, action.details]);

  const handleSend = () => {
    setIsSending(true);
    onConfirm({
      actionId: action.actionId,
      approved: true,
      parameters: { to, subject, body },
    });
  };

  return (
    <div className="my-4 p-5 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md text-xs shadow-md space-y-3.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
          <div>
            <div className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Email Agent Draft</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Review and edit details below before dispatching
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
          Confirmation Required
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
            To (Recipient)
          </label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-black/60 px-3.5 py-2 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-black/60 px-3.5 py-2 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Body Content
          </label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email body here..."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-black/60 px-3.5 py-2 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 leading-relaxed resize-y transition"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <button
          type="button"
          onClick={() =>
            onCancel({ actionId: action.actionId, approved: false })
          }
          disabled={isSending}
          className="px-4 py-2 cursor-pointer rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium text-xs disabled:opacity-50"
        >
          Cancel Draft
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!to.trim() || !body.trim() || isSending}
          className="px-5 py-2 cursor-pointer rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold text-xs transition shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          {isSending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-white dark:border-t-black rounded-full animate-spin"></span>
              <span>Sending Email...</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>Confirm & Send Email</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ChatArea({
  chat,
  streamingMessage,
  activeAction,
  isLoading,
  error,
  onToggleSidebar,
  onPromptSelect,
  onConfirmAction,
  onRetry,
}) {
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messages = useMemo(() => chat?.messages || [], [chat?.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  const handleCopyResponse = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const starterPrompts = [
    {
      title: "Explain Node.js event loop",
      desc: "Microtasks, macrotasks, and libuv phases clearly structured",
      prompt:
        "Explain the Node.js event loop, including microtask queue, macrotask queue, and phases with a clear diagram.",
    },
    {
      title: "Compare React 19 vs Next.js",
      desc: "Architecture, Server Actions, and rendering paradigms",
      prompt:
        "Compare React 19 native features with Next.js App Router. What are the key architectural tradeoffs?",
    },
    {
      title: "Search recent AI releases",
      desc: "Live web search for latest AI model releases and benchmarks",
      prompt:
        "Search the latest news and releases in open source AI models this month.",
    },
    {
      title: "Draft a project update email",
      desc: "Structured email for project stakeholders or team",
      prompt:
        "Draft an email to team@example.com proposing a new search feature and requesting feedback by Friday.",
    },
  ];

  return (
    <section className="flex-1 flex flex-col h-full min-w-0 bg-white overflow-y-auto dark:bg-black transition-colors">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0 bg-white/90 dark:bg-black/90 backdrop-blur-xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
            {chat?.title || "New conversation"}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white"></span>
            Nova
          </span>
        </div>
      </header>

      {/* Conversation Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Empty State when no messages */}
        {messages.length === 0 && !streamingMessage && !isLoading && (
          <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xl shadow-xs">
              N
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                What can I help you explore?
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                Search real-time web sources, write clean code, analyze
                problems, or draft and send emails.
              </p>
            </div>

            {/* Starter Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {starterPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPromptSelect(item.prompt)}
                  className="p-3.5 cursor-pointer rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition text-left shadow-2xs group"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white transition">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skeletons when fetching chat history */}
        {isLoading && messages.length === 0 && (
          <div className="max-w-3xl mx-auto space-y-4 py-4">
            <div className="h-10 w-2/3 ml-auto rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            <div className="h-24 w-4/5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          </div>
        )}

        {/* Message List */}
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <MessageItem
              key={msg.id || index}
              msg={msg}
              index={index}
              onCopyResponse={handleCopyResponse}
              copiedIndex={copiedIndex}
            />
          ))}

          {/* Active Email Action Draft */}
          {activeAction && (
            <EmailActionCard
              action={activeAction}
              onConfirm={onConfirmAction}
              onCancel={onConfirmAction}
            />
          )}

          {/* Streaming Assistant Message */}
          {streamingMessage && (
            <div className="flex flex-col items-start">
              <div className="select-text max-w-[92%] sm:max-w-[80%] rounded-2xl rounded-bl-xs px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
                <SourcesList sources={streamingMessage.sources} />

                <div className="select-text prose-nova">
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
                      },
                    }}
                  >
                    {streamingMessage.content}
                  </ReactMarkdown>

                  {/* Streaming blinking cursor indicator */}
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-neutral-900 dark:bg-white animate-pulse align-middle" />
                </div>
              </div>
            </div>
          )}

          {/* Error State Banner (in Red) */}
          {error && (
            <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-red-800 dark:text-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
                <svg
                  className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>AI Service Notice</span>
              </div>
              <p className="leading-relaxed">{error}</p>
              <div className="flex items-center gap-3 pt-1">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-3 py-1.5 cursor-pointer rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition shadow-xs"
                  >
                    Retry Request
                  </button>
                )}
                <a
                  href="mailto:hamzakhantz@gmail.com"
                  className="text-red-700 dark:text-red-300 underline font-medium"
                >
                  Contact Developer (hamzakhantz@gmail.com)
                </a>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </section>
  );
}
