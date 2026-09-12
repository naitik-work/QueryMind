import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        socket = io(socketUrl, {
            withCredentials: true,
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            transports: ["websocket", "polling"]
        });
    }
    return socket;
};

export const initializeSocketConnection = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};