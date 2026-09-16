import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Chat Endpoints
export const sendMessage = async ({ message, chatId, battleMode }) => {
    const response = await api.post("/api/chats/message", { message, chat: chatId, battleMode });
    return response.data;
};

export const getChats = async () => {
    const response = await api.get("/api/chats");
    return response.data;
};

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
};

export const renameChat = async (chatId, title) => {
    const response = await api.patch(`/api/chats/${chatId}`, { title });
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
};

// Memory Endpoints
export const getMemories = async () => {
    const response = await api.get("/api/memory");
    return response.data;
};

export const createMemory = async ({ content, type, importance }) => {
    const response = await api.post("/api/memory", { content, type, importance });
    return response.data;
};

export const updateMemory = async (id, data) => {
    const response = await api.patch(`/api/memory/${id}`, data);
    return response.data;
};

export const deleteMemory = async (id) => {
    const response = await api.delete(`/api/memory/${id}`);
    return response.data;
};

// User Preferences Endpoints
export const getUserPreferences = async () => {
    const response = await api.get("/api/user/preferences");
    return response.data;
};

export const updateUserPreferences = async (preferences) => {
    const response = await api.patch("/api/user/preferences", preferences);
    return response.data;
};

export default api;