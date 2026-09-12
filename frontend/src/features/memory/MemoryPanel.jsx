import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMemory } from "./useMemory";
import { setPanelOpen } from "./memory.slice";
import { FiArrowLeft, FiTrash2, FiCpu } from "react-icons/fi";
import { toast } from "react-toastify";

const CATEGORY_LABELS = {
    personal: "Personal Info",
    education: "Education & Learning",
    career: "Career & Goals",
    preferences: "Preferences & Styles",
    projects: "Projects & Code",
    skills: "Skills & Tech Stack",
    other: "Other Facts",
};

const MemoryPanel = () => {
    const dispatch = useDispatch();
    const { memories, loading } = useSelector((state) => state.memory);
    const { handleGetMemories, handleDeleteMemory, handleClearMemories } = useMemory();
    const [confirmClear, setConfirmClear] = useState(false);

    useEffect(() => {
        handleGetMemories();
    }, []);

    const grouped = memories.reduce((acc, mem) => {
        const cat = mem.category || "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(mem);
        return acc;
    }, {});

    const handleDelete = async (id) => {
        await handleDeleteMemory(id);
        toast.info("Memory deleted");
    };

    const handleClear = async () => {
        if (!confirmClear) {
            setConfirmClear(true);
            return;
        }
        await handleClearMemories();
        setConfirmClear(false);
        toast.info("All memories cleared");
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#212121]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#2f2f2f] px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => dispatch(setPanelOpen(false))}
                        className="rounded-lg p-1.5 text-[#676767] dark:text-[#b4b4b4] hover:bg-[#eaeaea] dark:hover:bg-[#2f2f2f] transition cursor-pointer"
                        title="Back to chat"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec] flex items-center gap-2">
                            <FiCpu className="w-4 h-4" />
                            <span>Personal Memories</span>
                        </h2>
                        <p className="text-xs text-[#8e8e8e]">Facts QueryMind uses to personalize responses</p>
                    </div>
                </div>

                {memories.length > 0 && (
                    <button
                        onClick={handleClear}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            confirmClear
                                ? "bg-red-600 text-white"
                                : "text-[#8e8e8e] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        }`}
                    >
                        {confirmClear ? "Confirm Clear All" : "Clear All"}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8e8e8e] border-t-transparent" />
                    </div>
                )}

                {!loading && memories.length === 0 && (
                    <div className="py-12 text-center max-w-md mx-auto">
                        <p className="text-sm text-[#8e8e8e]">
                            No memories recorded yet. QueryMind learns about you as you chat.
                        </p>
                    </div>
                )}

                {!loading && Object.entries(grouped).map(([category, mems]) => (
                    <div key={category} className="mb-6">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8e8e8e]">
                            {CATEGORY_LABELS[category] || category}
                        </h3>

                        <div className="space-y-2">
                            {mems.map((mem) => (
                                <div
                                    key={mem._id}
                                    className="group flex items-start justify-between rounded-xl border border-[#e5e5e5] dark:border-[#2f2f2f] bg-[#f9f9f9] dark:bg-[#171717] px-4 py-3"
                                >
                                    <div>
                                        <span className="font-mono text-xs font-semibold text-[#8e8e8e]">
                                            {mem.key}
                                        </span>
                                        <p className="mt-0.5 text-sm text-[#0d0d0d] dark:text-[#ececec]">{mem.value}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(mem._id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8e8e8e] hover:text-red-500 transition cursor-pointer"
                                        title="Delete memory"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemoryPanel;
