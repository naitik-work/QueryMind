import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
});

export async function getMemories() {
    const response = await api.get("/api/memories");
    return response.data;
}

export async function deleteMemoryApi(memoryId) {
    const response = await api.delete(`/api/memories/${memoryId}`);
    return response.data;
}

export async function clearAllMemoriesApi() {
    const response = await api.delete("/api/memories/clear");
    return response.data;
}
