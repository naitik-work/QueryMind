import { useEffect, useState } from "react";
import { ThemeContext } from "./theme.hook";

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        try {
            return localStorage.getItem("nova_theme") || "system";
        } catch {
            return "system";
        }
    });

    const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return true;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => setSystemPrefersDark(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const isDark = theme === "system" ? systemPrefersDark : theme === "dark";

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        try {
            localStorage.setItem("nova_theme", theme);
        } catch (e) {
            console.warn("Could not persist theme to localStorage:", e);
        }
    }, [theme, isDark]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            const currentIsDark = prev === "system" ? systemPrefersDark : prev === "dark";
            return currentIsDark ? "light" : "dark";
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
