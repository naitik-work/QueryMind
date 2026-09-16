import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getChats,
    getMessages,
    deleteChat as deleteChatApi,
    renameChat as renameChatApi,
    sendMessage as sendMessageHttp
} from "../service/chat.api";
import { initializeSocketConnection, getSocket } from "../service/chat.socket";
import {
    createNewChat,
    addNewMessage,
    addMessages,
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    setGenerationStatus,
    setSources,
    setStreamingChunk,
    setActionRequired,
    finalizeStreamingMessage,
    stopStreaming,
    deleteChatSuccess,
    renameChatSuccess,
    resetActiveChat,
    setBattleMode,
    toggleBattleMode
} from "../chat.slice";
import { useToast } from "../../../app/toast.hook";

export const useChat = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const chats = useSelector(state => state.chat.chats);
    const currentChatId = useSelector(state => state.chat.currentChatId);
    const isLoading = useSelector(state => state.chat.isLoading);
    const error = useSelector(state => state.chat.error);
    const streamingMessage = useSelector(state => state.chat.streamingMessage);
    const generationStatus = useSelector(state => state.chat.generationStatus);
    const activeAction = useSelector(state => state.chat.activeAction);
    const searchQuery = useSelector(state => state.chat.searchQuery);
    const battleMode = useSelector(state => state.chat.battleMode);

    const activeChatRef = useRef(currentChatId);
    const streamingMessageRef = useRef(streamingMessage);
    const battleModeRef = useRef(battleMode);

    useEffect(() => {
        activeChatRef.current = currentChatId;
        streamingMessageRef.current = streamingMessage;
        battleModeRef.current = battleMode;
    }, [currentChatId, streamingMessage, battleMode]);

    // Set up and clean up Socket.IO listeners
    useEffect(() => {
        const socket = initializeSocketConnection();

        const onChatCreated = (data) => {
            if (data?.chat) {
                dispatch(createNewChat({
                    chatId: data.chat.id || data.chat._id,
                    title: data.chat.title
                }));
                dispatch(setCurrentChatId(data.chat.id || data.chat._id));
            }
        };

        const onMessageSaved = (data) => {
            if (data?.chatId && data?.message) {
                dispatch(addNewMessage({
                    chatId: data.chatId,
                    content: data.message.content,
                    role: data.message.role,
                    id: data.message.id,
                    createdAt: data.message.createdAt
                }));
            }
        };

        const onStatus = (data) => {
            if (data?.label) {
                dispatch(setGenerationStatus(data.label));
            }
        };

        const onSources = (data) => {
            if (data?.sources) {
                dispatch(setSources({ chatId: data.chatId, sources: data.sources }));
            }
        };

        const onChunk = (data) => {
            if (data?.chunk) {
                dispatch(setStreamingChunk({ chatId: data.chatId, chunk: data.chunk }));
            }
        };

        const onActionRequired = (data) => {
            dispatch(setActionRequired(data));
        };

        const onDone = (data) => {
            if (data?.chatId && data?.message) {
                dispatch(finalizeStreamingMessage({
                    chatId: data.chatId,
                    message: data.message
                }));
            }
        };

        const onStopped = (data) => {
            dispatch(stopStreaming({
                chatId: data?.chatId,
                message: data?.message
            }));
        };

        const onActionCompleted = (data) => {
            dispatch(setActionRequired(null));
            toast.success("Email sent successfully!");
            if (data?.message && data?.chatId) {
                dispatch(addNewMessage({
                    chatId: data.chatId,
                    content: data.message.content,
                    role: data.message.role,
                    id: data.message.id,
                    createdAt: data.message.createdAt
                }));
            }
        };

        const onActionCancelled = () => {
            dispatch(setActionRequired(null));
            toast.info("Email draft cancelled");
        };

        const onActionError = (data) => {
            toast.error(data?.message || "Failed to execute email action");
        };

        const onChatError = (data) => {
            dispatch(setError(data?.message || "An error occurred during response generation."));
            dispatch(setGenerationStatus(null));
        };

        socket.on("chat:created", onChatCreated);
        socket.on("chat:message_saved", onMessageSaved);
        socket.on("chat:status", onStatus);
        socket.on("chat:sources", onSources);
        socket.on("chat:chunk", onChunk);
        socket.on("chat:action_required", onActionRequired);
        socket.on("chat:done", onDone);
        socket.on("chat:stopped", onStopped);
        socket.on("action:completed", onActionCompleted);
        socket.on("action:cancelled", onActionCancelled);
        socket.on("action:error", onActionError);
        socket.on("chat:error", onChatError);

        return () => {
            socket.off("chat:created", onChatCreated);
            socket.off("chat:message_saved", onMessageSaved);
            socket.off("chat:status", onStatus);
            socket.off("chat:sources", onSources);
            socket.off("chat:chunk", onChunk);
            socket.off("chat:action_required", onActionRequired);
            socket.off("chat:done", onDone);
            socket.off("chat:stopped", onStopped);
            socket.off("action:completed", onActionCompleted);
            socket.off("action:cancelled", onActionCancelled);
            socket.off("action:error", onActionError);
            socket.off("chat:error", onChatError);
        };
    }, [dispatch, toast]);

    // Send Message via Socket (with HTTP fallback if needed)
    const handleSendMessage = useCallback(async ({ message, chatId }) => {
        const socket = getSocket();
        const targetChatId = chatId || activeChatRef.current;

        dispatch(setError(null));

        const isBattle = Boolean(battleModeRef.current);

        if (socket && socket.connected) {
            socket.emit("chat:send", {
                message,
                chatId: targetChatId,
                battleMode: isBattle
            });
        } else {
            // HTTP Fallback
            try {
                dispatch(setLoading(true));
                const data = await sendMessageHttp({ message, chatId: targetChatId, battleMode: isBattle });
                const { chat, aiMessage, title } = data;
                const newOrExistingChatId = targetChatId || chat?._id;

                if (!targetChatId && chat) {
                    dispatch(createNewChat({
                        chatId: newOrExistingChatId,
                        title: title || chat.title
                    }));
                }

                dispatch(addNewMessage({
                    chatId: newOrExistingChatId,
                    content: message,
                    role: "user"
                }));

                if (aiMessage) {
                    dispatch(addNewMessage({
                        chatId: newOrExistingChatId,
                        content: aiMessage.content,
                        role: aiMessage.role,
                        metadata: aiMessage.metadata,
                        id: aiMessage._id
                    }));
                }

                dispatch(setCurrentChatId(newOrExistingChatId));
            } catch (err) {
                dispatch(setError(err.response?.data?.message || err.message || "Failed to send message"));
            } finally {
                dispatch(setLoading(false));
            }
        }
    }, [dispatch]);

    // Stop active generation
    const handleStopGeneration = useCallback(() => {
        const socket = getSocket();
        const activeChat = activeChatRef.current;
        const currentStreaming = streamingMessageRef.current;

        if (socket && socket.connected) {
            socket.emit("chat:stop", {
                chatId: activeChat,
                partialContent: currentStreaming?.content || ""
            });
        }
        dispatch(stopStreaming({ chatId: activeChat }));
    }, [dispatch]);

    // Confirm or cancel sensitive tool action (e.g. send email)
    const handleConfirmAction = useCallback(({ actionId, approved, parameters }) => {
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit("action:confirm", {
                actionId,
                approved,
                parameters,
                chatId: activeChatRef.current
            });
        }
    }, []);

    // Get all user chats
    const handleGetChats = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            const data = await getChats();
            const { chats: list = [] } = data;

            const chatMap = list.reduce((acc, c) => {
                acc[c._id] = {
                    id: c._id,
                    title: c.title,
                    messages: [],
                    lastUpdated: c.updatedAt || c.createdAt
                };
                return acc;
            }, {});

            dispatch(setChats(chatMap));
        } catch (err) {
            console.error("[CHAT] Failed to get chats:", err);
            dispatch(setError("Failed to load chat history"));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    // Open chat and fetch messages if needed
    const handleOpenChat = useCallback(async (chatId) => {
        if (!chatId) return;

        dispatch(setCurrentChatId(chatId));

        if (!chats[chatId]?.messages || chats[chatId].messages.length === 0) {
            try {
                dispatch(setLoading(true));
                const data = await getMessages(chatId);
                const { messages = [] } = data;

                dispatch(addMessages({
                    chatId,
                    messages: messages.map(m => ({
                        id: m._id,
                        content: m.content,
                        role: m.role,
                        metadata: m.metadata || {},
                        createdAt: m.createdAt
                    }))
                }));
            } catch (err) {
                console.error("[CHAT] Failed to get messages:", err);
                dispatch(setError("Failed to load conversation messages"));
            } finally {
                dispatch(setLoading(false));
            }
        }
    }, [chats, dispatch]);

    // Delete chat
    const handleDeleteChat = useCallback(async (chatId) => {
        try {
            await deleteChatApi(chatId);
            dispatch(deleteChatSuccess(chatId));
        } catch (err) {
            console.error("[CHAT] Delete chat error:", err);
            dispatch(setError("Failed to delete chat"));
        }
    }, [dispatch]);

    // Rename chat
    const handleRenameChat = useCallback(async (chatId, newTitle) => {
        if (!newTitle || !newTitle.trim()) return;
        try {
            await renameChatApi(chatId, newTitle.trim());
            dispatch(renameChatSuccess({ chatId, title: newTitle.trim() }));
        } catch (err) {
            console.error("[CHAT] Rename chat error:", err);
            dispatch(setError("Failed to rename chat"));
        }
    }, [dispatch]);

    // Start a fresh, clean conversation state without database record
    const handleNewChat = useCallback(() => {
        dispatch(resetActiveChat());
    }, [dispatch]);

    return {
        chats,
        currentChatId,
        isLoading,
        error,
        streamingMessage,
        generationStatus,
        activeAction,
        searchQuery,
        battleMode,
        handleSendMessage,
        handleStopGeneration,
        handleConfirmAction,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleRenameChat,
        handleNewChat,
        handleToggleBattleMode: () => dispatch(toggleBattleMode()),
        handleSetBattleMode: (val) => dispatch(setBattleMode(val)),
        clearChatError: () => dispatch(setError(null))
    };
};