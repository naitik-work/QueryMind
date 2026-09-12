import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export async function register({ email, username, password }) {
    const response = await api.post("/api/auth/register", { email, username, password });
    return response.data;
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
}

export async function logout() {
    const response = await api.post("/api/auth/logout");
    return response.data;
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me");
    return response.data;
}

export async function verifyEmail(token) {
    const response = await api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
}

export default api;