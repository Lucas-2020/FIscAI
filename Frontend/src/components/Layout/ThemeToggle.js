import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { useThemeContext } from "../../contexts/ThemeContext";
import { FaSun, FaRegMoon } from "react-icons/fa";

export default function ThemeToggle() {
    const { mode, toggleTheme } = useThemeContext();

    return (
        <Tooltip title={mode === "light" ? "Modo escuro" : "Modo claro"}>
            <IconButton onClick={toggleTheme} color="primary" sx={{ ml: 1 }}>
                {mode === "light" ? <FaRegMoon /> : <FaSun />}
            </IconButton>
        </Tooltip>
    );
}