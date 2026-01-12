import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#9D00FF" },
        background: { default: "#f7f9fb", paper: "#fff" }
    },
    shape: { borderRadius: 8 }
});

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#9D00FF" },
        background: { default: "#22262d", paper: "#23272e" }
    },
    shape: { borderRadius: 8 }
});