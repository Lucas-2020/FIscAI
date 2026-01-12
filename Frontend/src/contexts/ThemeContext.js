import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "../theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState("light");
    const muiTheme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);
    const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, muiTheme }}>
            <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
export function useThemeContext() {
    return useContext(ThemeContext);
}