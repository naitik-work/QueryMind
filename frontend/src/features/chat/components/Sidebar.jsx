import { useState, useMemo } from "react";
import { useAuth } from "../../auth/hook/useAuth";
import { useTheme } from "../../../app/theme.hook";
import { useToast } from "../../../app/toast.hook";

export default function Sidebar({
    isOpen,
    onClose,
    chats,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onRenameChat,
    onOpenSettings,
    isLoading
}) {
    const { user, handleLogout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [deletingChatId, setDeletingChatId] = useState(null);

    // Filter and group conversations
    const conversationList = useMemo(() => {
        const list = Object.values(chats || {}).sort((a, b) => {
            const dateA = new Date(a.lastUpdated || 0);
            const dateB = new Date(b.lastUpdated || 0);
            return dateB - dateA;
        });

        if (!search.trim()) return list;

        const q = search.toLowerCase();
        return list.filter(c => c.title?.toLowerCase().includes(q));
    }, [chats, search]);

    const handleStartRename = (e, chat) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditTitle(chat.title);
    };

    const handleSaveRename = (e, chatId) => {
        e.preventDefault();
        e.stopPropagation();
        if (editTitle.trim()) {
            onRenameChat(chatId, editTitle.trim());
            toast.success("Conversation renamed");
        }
        setEditingChatId(null);
    };

    const handleStartDelete = (e, chatId) => {
        e.stopPropagation();
        setDeletingChatId(chatId);
    };

    const handleConfirmDelete = (chatId) => {
        onDeleteChat(chatId);
        setDeletingChatId(null);
        toast.success("Conversation deleted");
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Content */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 lg:w-72 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
                            N
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-white">
                                QueryMind
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                2.0
                            </span>
                        </div>
                    </div>

                    {/* Mobile close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="md:hidden p-1.5 cursor-pointer rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-3">
                    <button
                        type="button"
                        onClick={() => {
                            onNewChat();
                            if (window.innerWidth < 768) onClose();
                        }}
                        className="w-full flex cursor-pointer items-center justify-between px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-900 dark:text-neutral-100 text-xs font-medium transition shadow-2xs group"
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New conversation
                        </span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
                            Ctrl K
                        </kbd>
                    </button>
                </div>

                {/* Search Conversations */}
                <div className="px-3 pb-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter chats..."
                            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent pl-8 pr-7 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition"
                        />
                        <svg className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="cursor-pointer absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Conversations History List */}
                <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                    {isLoading && Object.keys(chats).length === 0 ? (
                        <div className="space-y-2 py-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                            ))}
                        </div>
                    ) : conversationList.length === 0 ? (
                        <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
                            {search ? "No conversations found" : "No past conversations"}
                        </div>
                    ) : (
                        conversationList.map(chat => {
                            const isCurrent = chat.id === currentChatId;
                            const isEditing = editingChatId === chat.id;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => {
                                        onSelectChat(chat.id);
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                    className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition ${isCurrent
                                        ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-white border border-neutral-200/80 dark:border-neutral-800"
                                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                                        }`}
                                >
                                    {isEditing ? (
                                        <form
                                            onSubmit={(e) => handleSaveRename(e, chat.id)}
                                            className="flex items-center gap-1 w-full"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onBlur={(e) => handleSaveRename(e, chat.id)}
                                                className="w-full bg-white dark:bg-black border border-neutral-400 dark:border-neutral-600 rounded px-1.5 py-0.5 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
                                            />
                                        </form>
                                    ) : (
                                        <>
                                            <span className="truncate pr-2 select-none">
                                                {chat.title}
                                            </span>

                                            {/* Action buttons (Rename / Delete) */}
                                            <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleStartRename(e, chat)}
                                                    className="p-1 cursor-pointer rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
                                                    title="Rename"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleStartDelete(e, chat.id)}
                                                    className="p-1 cursor-pointer rounded text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer User Profile & Actions */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/80 space-y-2.5">
                    {/* User profile row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-semibold text-xs shrink-0">
                                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                    {user?.username || "Guest"}
                                </p>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </div>

                        {/* Theme toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-1.5 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-300 transition"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Actions: Settings and Logout (Logout in Red) */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                            type="button"
                            onClick={onOpenSettings}
                            className="flex cursor-pointer items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex cursor-pointer items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-red-200 dark:border-red-950/80 bg-red-50/40 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-900 text-xs font-medium transition"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Delete Chat Confirmation Modal (Red Action) */}
            {deletingChatId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
                    <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-2xl text-neutral-900 dark:text-neutral-100 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold">
                                Delete conversation?
                            </h3>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                            This will permanently delete this conversation and all its messages. This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setDeletingChatId(null)}
                                className="px-3.5 py-1.5 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmDelete(deletingChatId)}
                                className="px-3.5 py-1.5 cursor-pointer rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-xs"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
