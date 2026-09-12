import { createContext, useContext } from "react";

export const ThemeContext = createContext({
    theme: "system",
    isDark: true,
    setTheme: () => {},
    toggleTheme: () => {}
});

export function useTheme() {
    return useContext(ThemeContext);
}
