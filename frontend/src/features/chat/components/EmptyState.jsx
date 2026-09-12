import React from "react";
import { FiBookOpen, FiCode, FiLayers, FiCpu, FiZap } from "react-icons/fi";

const suggestionPrompts = [
    {
        title: "Study & Prep",
        prompt: "Prepare me for a MERN stack interview with real technical questions",
        icon: FiBookOpen
    },
    {
        title: "Coding Help",
        prompt: "Explain JavaScript closures and event loop with clear code examples",
        icon: FiCode
    },
    {
        title: "Architecture Review",
        prompt: "Review my Socket.IO architecture and state management setup",
        icon: FiLayers
    },
    {
        title: "Personal Memory",
        prompt: "Remember that I am learning React and preparing for MERN roles",
        icon: FiCpu
    }
];

const EmptyState = ({ onSelectPrompt }) => (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full select-none animate-fade-in">
        <div className="text-center w-full">
            {/* Minimal Avatar */}
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#0d0d0d] dark:bg-[#ececec] text-white dark:text-[#0d0d0d] shadow-sm">
                <FiZap className="w-5 h-5" />
            </div>

            <h2 className="mb-8 text-2xl sm:text-3xl font-bold text-[#0d0d0d] dark:text-[#ececec] tracking-tight">
                What can I help with today?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {suggestionPrompts.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={idx}
                            onClick={() => onSelectPrompt && onSelectPrompt(item.prompt)}
                            className="group flex flex-col justify-between rounded-2xl border border-[#e5e5e5] dark:border-[#383838] bg-[#f9f9f9] dark:bg-[#2f2f2f] p-4 text-xs sm:text-sm transition hover:bg-[#f0f0f0] dark:hover:bg-[#383838] active:scale-[0.98] text-left cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-[#0d0d0d] dark:text-[#ececec] flex items-center gap-2">
                                    <IconComponent className="w-4 h-4 text-[#676767] dark:text-[#b4b4b4]" />
                                    <span>{item.title}</span>
                                </span>
                            </div>
                            <p className="text-[#676767] dark:text-[#b4b4b4] leading-relaxed line-clamp-2">
                                {item.prompt}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

export default EmptyState;
