import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null,
        streamingMessage: null,
        generationStatus: null,
        activeAction: null,
        searchQuery: ""
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload;
            state.chats[chatId] = {
                id: chatId,
                title: title || "New conversation",
                messages: [],
                lastUpdated: new Date().toISOString()
            };
            state.currentChatId = chatId;
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role, metadata, id, createdAt } = action.payload;
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: "Conversation",
                    messages: [],
                    lastUpdated: new Date().toISOString()
                };
            }
            state.chats[chatId].messages.push({
                id: id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                content,
                role,
                metadata: metadata || {},
                createdAt: createdAt || new Date().toISOString()
            });
            state.chats[chatId].lastUpdated = new Date().toISOString();
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: "Conversation",
                    messages: [],
                    lastUpdated: new Date().toISOString()
                };
            }
            state.chats[chatId].messages = messages;
        },
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setGenerationStatus: (state, action) => {
            state.generationStatus = action.payload;
        },
        setSources: (state, action) => {
            const { sources } = action.payload;
            if (state.streamingMessage) {
                state.streamingMessage.sources = sources;
            } else {
                state.streamingMessage = {
                    content: "",
                    role: "ai",
                    sources,
                    isStreaming: true
                };
            }
        },
        setStreamingChunk: (state, action) => {
            const { chatId, chunk } = action.payload;
            if (!state.streamingMessage || state.streamingMessage.chatId !== chatId) {
                state.streamingMessage = {
                    chatId,
                    content: chunk,
                    role: "ai",
                    sources: state.streamingMessage?.sources || [],
                    isStreaming: true
                };
            } else {
                state.streamingMessage.content += chunk;
            }
        },
        setActionRequired: (state, action) => {
            state.activeAction = action.payload;
        },
        finalizeStreamingMessage: (state, action) => {
            const { chatId, message } = action.payload;
            if (state.chats[chatId]) {
                state.chats[chatId].messages.push(message);
                state.chats[chatId].lastUpdated = new Date().toISOString();
            }
            state.streamingMessage = null;
            state.generationStatus = null;
            state.isLoading = false;
        },
        stopStreaming: (state, action) => {
            const { chatId, message } = action.payload || {};
            if (chatId && message && state.chats[chatId]) {
                state.chats[chatId].messages.push(message);
            }
            state.streamingMessage = null;
            state.generationStatus = null;
            state.isLoading = false;
        },
        deleteChatSuccess: (state, action) => {
            const chatId = action.payload;
            delete state.chats[chatId];
            if (state.currentChatId === chatId) {
                const remainingChatIds = Object.keys(state.chats);
                state.currentChatId = remainingChatIds.length > 0 ? remainingChatIds[0] : null;
            }
        },
        renameChatSuccess: (state, action) => {
            const { chatId, title } = action.payload;
            if (state.chats[chatId]) {
                state.chats[chatId].title = title;
            }
        },
        resetActiveChat: (state) => {
            state.currentChatId = null;
            state.streamingMessage = null;
            state.generationStatus = null;
            state.activeAction = null;
            state.error = null;
        }
    }
});

export const {
    createNewChat,
    addNewMessage,
    addMessages,
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    setSearchQuery,
    setGenerationStatus,
    setSources,
    setStreamingChunk,
    setActionRequired,
    finalizeStreamingMessage,
    stopStreaming,
    deleteChatSuccess,
    renameChatSuccess,
    resetActiveChat
} = chatSlice.actions;

export default chatSlice.reducer;