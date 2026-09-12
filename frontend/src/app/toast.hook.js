import { createContext, useContext } from "react";

export const ToastContext = createContext({
    toast: {
        success: () => {},
        error: () => {},
        info: () => {},
        warning: () => {}
    },
    removeToast: () => {}
});

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
