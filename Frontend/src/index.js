import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { SnackbarProvider } from './contexts/SnackbarContext';
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SnackbarProvider>
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  </SnackbarProvider>
);