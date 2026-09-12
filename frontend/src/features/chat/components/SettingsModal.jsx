import { useState, useEffect } from "react";
import { getMemories, createMemory, deleteMemory, getUserPreferences, updateUserPreferences } from "../service/chat.api";
import { useTheme } from "../../../app/theme.hook";
import { useToast } from "../../../app/toast.hook";

export default function SettingsModal({ isOpen, onClose, user }) {
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const [preferences, setPreferences] = useState({
        personalizationEnabled: true,
        responseStyle: "balanced",
        technicalLevel: "intermediate",
        preferredLanguage: "en",
        preferredName: ""
    });
    const [memories, setMemories] = useState([]);
    const [newMemoryContent, setNewMemoryContent] = useState("");
    const [newMemoryType, setNewMemoryType] = useState("preference");
    const [saveStatus, setSaveStatus] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        let active = true;
        Promise.all([
            getUserPreferences().catch(() => ({ preferences: {} })),
            getMemories().catch(() => ({ memories: [] }))
        ]).then(([prefRes, memRes]) => {
            if (!active) return;
            if (prefRes?.preferences) {
                setPreferences(prev => ({ ...prev, ...prefRes.preferences }));
            }
            if (memRes?.memories) {
                setMemories(memRes.memories);
            }
        });

        return () => {
            active = false;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const showSaveFeedback = (msg, isError = false) => {
        setSaveStatus(msg);
        if (isError) {
            toast.error(msg);
        } else {
            toast.success(msg);
        }
        setTimeout(() => setSaveStatus(""), 2500);
    };

    const handleTogglePersonalization = async () => {
        const updated = !preferences.personalizationEnabled;
        setPreferences(prev => ({ ...prev, personalizationEnabled: updated }));
        try {
            await updateUserPreferences({ personalizationEnabled: updated });
            showSaveFeedback("Updated personalization setting");
        } catch {
            showSaveFeedback("Failed to update personalization", true);
        }
    };

    const handleStyleChange = async (style) => {
        setPreferences(prev => ({ ...prev, responseStyle: style }));
        try {
            await updateUserPreferences({ responseStyle: style });
            showSaveFeedback("Updated response style");
        } catch {
            showSaveFeedback("Failed to update response style", true);
        }
    };

    const handleLevelChange = async (level) => {
        setPreferences(prev => ({ ...prev, technicalLevel: level }));
        try {
            await updateUserPreferences({ technicalLevel: level });
            showSaveFeedback("Updated technical level");
        } catch {
            showSaveFeedback("Failed to update technical level", true);
        }
    };

    const handleAddMemory = async (e) => {
        e.preventDefault();
        if (!newMemoryContent.trim()) return;

        try {
            const res = await createMemory({
                content: newMemoryContent.trim(),
                type: newMemoryType,
                importance: 3
            });
            if (res?.memory) {
                setMemories(prev => [res.memory, ...prev]);
                setNewMemoryContent("");
                showSaveFeedback("Memory added");
            }
        } catch {
            showSaveFeedback("Failed to add memory", true);
        }
    };

    const handleDeleteMemory = async (id) => {
        try {
            await deleteMemory(id);
            setMemories(prev => prev.filter(m => m._id !== id));
            showSaveFeedback("Memory deleted");
        } catch {
            showSaveFeedback("Failed to delete memory", true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
            <div
                className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100"
                role="dialog"
                aria-modal="true"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                            N
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                                Settings & Personalization
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Manage AI memory, preferences, and theme
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        aria-label="Close settings"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* User Account Info */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-semibold text-xs">
                                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user?.verified
                                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                        }`}>
                            {user?.verified ? "Verified" : "Unverified"}
                        </span>
                    </div>

                    {/* Theme Preference */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                            Interface Theme
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {["light", "dark", "system"].map(mode => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setTheme(mode)}
                                    className={`py-2 px-3 cursor-pointer rounded-xl border text-xs font-medium capitalize transition flex items-center justify-center gap-2 ${
                                        theme === mode
                                            ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white"
                                            : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400"
                                    }`}
                                >
                                    {mode === "light" && (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    )}
                                    {mode === "dark" && (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    )}
                                    {mode === "system" && (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Personalization Toggle */}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                                    AI Personalization & Memory
                                </h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    Allow Nova to remember your durable preferences across conversations
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleTogglePersonalization}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    preferences.personalizationEnabled ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                                }`}
                                role="switch"
                                aria-checked={preferences.personalizationEnabled}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        preferences.personalizationEnabled
                                            ? "translate-x-5 bg-white dark:bg-black"
                                            : "translate-x-0 bg-white dark:bg-neutral-400"
                                    }`}
                                />
                            </button>
                        </div>

                        {preferences.personalizationEnabled && (
                            <div className="space-y-4 pt-2">
                                {/* Style options */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                                        Response Style
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "concise", label: "Concise" },
                                            { id: "balanced", label: "Balanced" },
                                            { id: "detailed", label: "Detailed" }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleStyleChange(item.id)}
                                                className={`py-1.5 px-3 cursor-pointer rounded-lg border text-xs font-medium transition ${
                                                    preferences.responseStyle === item.id
                                                        ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white"
                                                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Technical Level */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                                         Technical Depth
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "beginner", label: "Foundational" },
                                            { id: "intermediate", label: "Intermediate" },
                                            { id: "advanced", label: "Expert" }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleLevelChange(item.id)}
                                                className={`py-1.5 px-3 cursor-pointer rounded-lg border text-xs font-medium transition ${
                                                    preferences.technicalLevel === item.id
                                                        ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white"
                                                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Memories List & Add */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                            Saved Memories ({memories.length})
                                        </label>
                                    </div>

                                    {/* Add Memory Form */}
                                    <form onSubmit={handleAddMemory} className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <select
                                            value={newMemoryType}
                                            onChange={e => setNewMemoryType(e.target.value)}
                                            className="w-full sm:w-auto cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500"
                                        >
                                            <option value="preference" className="dark:bg-neutral-900">Preference</option>
                                            <option value="instruction" className="dark:bg-neutral-900">Instruction</option>
                                            <option value="profile" className="dark:bg-neutral-900">Profile</option>
                                            <option value="goal" className="dark:bg-neutral-900">Goal</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newMemoryContent}
                                            onChange={e => setNewMemoryContent(e.target.value)}
                                            placeholder="e.g. Always write code with TypeScript"
                                            className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMemoryContent.trim()}
                                            className="w-full sm:w-auto px-3.5 py-1.5 cursor-pointer rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-medium text-xs transition disabled:opacity-40"
                                        >
                                            Add
                                        </button>
                                    </form>

                                    {/* Memory items with Red Delete Icon */}
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {memories.length === 0 ? (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic py-2">
                                                No saved memories yet. You can add explicit preferences here, or say "Remember that..." in chat.
                                            </p>
                                        ) : (
                                            memories.map(mem => (
                                                <div
                                                    key={mem._id}
                                                    className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs"
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                            {mem.type}
                                                        </span>
                                                        <span className="truncate text-neutral-800 dark:text-neutral-200">
                                                            {mem.content}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMemory(mem._id)}
                                                        className="cursor-pointer text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded p-1 transition shrink-0 ml-2"
                                                        title="Delete memory"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                        {saveStatus}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 cursor-pointer rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-medium transition"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
