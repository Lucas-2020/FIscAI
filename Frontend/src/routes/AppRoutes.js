import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import CompanyRegister from "../components/Company/CompanyRegister";
import Dashboard from "../components/Main/Dashboard";

import { useAuth } from "../contexts/AuthContext";

import {
    Box,
    CircularProgress
} from '@mui/material';

export default function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        // Exibe um loader simples, pode ser <CircularProgress /> ou similar
        return <Box
            sx={{
                minHeight: "100vh", // ocupa toda a tela vertical
                width: "100vw",     // ocupa toda a tela horizontal (opcional, geralmente só o height basta)
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff"     // tela branca
            }}
        >
            <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={50} />
            </Box>
        </Box>;
    }

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/cadastrar/conta" element={<Register />} />
            <Route path="/cadastrar/empresa" element={user ? <CompanyRegister /> : <Navigate to="/" />} />
            <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
    );
}
