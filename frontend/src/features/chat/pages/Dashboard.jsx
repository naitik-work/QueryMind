import { useEffect, useState, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hook/useAuth";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import Composer from "../components/Composer";
import SettingsModal from "../components/SettingsModal";

const Dashboard = () => {
    const {
        chats,
        currentChatId,
        isLoading,
        error,
        streamingMessage,
        generationStatus,
        activeAction,
        handleSendMessage,
        handleStopGeneration,
        handleConfirmAction,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleRenameChat,
        handleNewChat
    } = useChat();

    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [lastPrompt, setLastPrompt] = useState("");

    // Load user chats on initial mount
    useEffect(() => {
        handleGetChats();
    }, [handleGetChats]);

    // Keyboard shortcut for New Chat (Ctrl+K / Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                handleNewChat();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNewChat]);

    const handleSend = useCallback((messageText) => {
        const trimmed = messageText.trim();
        if (!trimmed) return;

        setLastPrompt(trimmed);
        handleSendMessage({ message: trimmed, chatId: currentChatId });
        setInput("");
    }, [currentChatId, handleSendMessage]);

    const handleRetry = useCallback(() => {
        if (lastPrompt) {
            handleSend(lastPrompt);
        }
    }, [lastPrompt, handleSend]);

    const currentChat = currentChatId ? chats[currentChatId] : null;

    return (
        <main className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors">
            {/* Left Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                chats={chats}
                currentChatId={currentChatId}
                onSelectChat={handleOpenChat}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onOpenSettings={() => setIsSettingsOpen(true)}
                isLoading={isLoading}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* Chat Messages */}
                <ChatArea
                    chat={currentChat}
                    currentChatId={currentChatId}
                    streamingMessage={streamingMessage}
                    activeAction={activeAction}
                    isLoading={isLoading}
                    error={error}
                    onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                    onPromptSelect={handleSend}
                    onConfirmAction={handleConfirmAction}
                    onStopGeneration={handleStopGeneration}
                    onRetry={lastPrompt ? handleRetry : null}
                />

                {/* Fixed Composer at bottom */}
                <Composer
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    onStop={handleStopGeneration}
                    isStreaming={Boolean(streamingMessage?.isStreaming)}
                    isLoading={isLoading}
                    generationStatus={generationStatus}
                />
            </div>

            {/* Settings & Memory Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />
        </main>
    );
};

export default Dashboard;
