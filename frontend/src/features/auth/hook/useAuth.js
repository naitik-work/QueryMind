import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, login, logout, getMe, verifyEmail } from "../services/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";
import { setChats, setCurrentChatId, resetActiveChat } from "../../chat/chat.slice";
import { disconnectSocket } from "../../chat/service/chat.socket";

export function useAuth() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);
    const error = useSelector(state => state.auth.error);

    const handleRegister = useCallback(async ({ email, username, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await register({ email, username, password });
            return {
                success: true,
                message: data.message || "Account created. Please check your email to verify your account."
            };
        } catch (err) {
            const msg =
                err.response?.data?.errors?.[0]?.message ||
                err.response?.data?.message ||
                err.response?.data?.err ||
                err.message ||
                "Registration failed. Please check your input.";
            dispatch(setError(msg));
            return { success: false, message: msg };
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogin = useCallback(async ({ email, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return { success: true, user: data.user };
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.err ||
                err.message ||
                "Login failed. Please check your credentials.";
            dispatch(setError(msg));
            return { success: false, message: msg };
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            await logout();
        } catch (err) {
            console.warn("[AUTH] Logout warning:", err.message);
        } finally {
            disconnectSocket();
            dispatch(setUser(null));
            dispatch(resetActiveChat());
            dispatch(setChats({}));
            dispatch(setCurrentChatId(null));
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleGetMe = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            if (data?.user) {
                dispatch(setUser(data.user));
            } else {
                dispatch(setUser(null));
            }
        } catch {
            dispatch(setUser(null));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleVerifyEmail = useCallback(async (token) => {
        try {
            const data = await verifyEmail(token);
            return {
                success: true,
                message: data.message || "Email verified successfully!",
                alreadyVerified: data.alreadyVerified
            };
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.err ||
                "Email verification failed or token expired.";
            return {
                success: false,
                message: msg,
                expired: err.response?.data?.expired
            };
        }
    }, []);

    const clearError = useCallback(() => {
        dispatch(setError(null));
    }, [dispatch]);

    return {
        user,
        loading,
        error,
        handleRegister,
        handleLogin,
        handleLogout,
        handleGetMe,
        handleVerifyEmail,
        clearError
    };
}