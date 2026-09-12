import { useState, useCallback, useMemo } from "react";
import { ToastContext } from "./toast.hook";
import ToastContainer from "./ToastContainer";

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type, message, title = "", duration = 3200) => {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newToast = { id, type, message, title };

        setToasts((prev) => [...prev.slice(-4), newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const toast = useMemo(() => ({
        success: (message, title = "") => addToast("success", message, title),
        error: (message, title = "") => addToast("error", message, title),
        info: (message, title = "") => addToast("info", message, title),
        warning: (message, title = "") => addToast("warning", message, title)
    }), [addToast]);

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export default ToastProvider;
