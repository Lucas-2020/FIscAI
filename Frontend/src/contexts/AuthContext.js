import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../services/api";

const AuthContext = createContext();

const STORAGE_TOKEN = "auth.accessToken";
const STORAGE_USER = "auth.user";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function persistSession(accessToken, userObj) {
        setAccessToken(accessToken);
        setUser(userObj);

        if (accessToken) localStorage.setItem(STORAGE_TOKEN, accessToken);
        if (userObj) localStorage.setItem(STORAGE_USER, JSON.stringify(userObj));
    }

    function clearSession() {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
    }

    async function signIn(email, senha) {
        const { data } = await api.post("/usuario/login", { email, senha });
        if (!data?.status) return { ok: false, data };

        persistSession(data.accessToken, data.user);
        return { ok: true };
    }

    async function signUp(payload) {
        const { data } = await api.post("/usuario/create", payload);
        if (!data?.status) return { ok: false, data };

        persistSession(data.accessToken, data.user);
        return { ok: true };
    }

    async function signOut() {
        // try { await api.post("/auth/logout"); } catch {}
        clearSession();
    }

    // restaura sessão no refresh (sem refresh endpoint)
    useEffect(() => {
        try {
            const token = localStorage.getItem(STORAGE_TOKEN);
            const userRaw = localStorage.getItem(STORAGE_USER);

            if (token && userRaw) {
                const userParsed = JSON.parse(userRaw);
                setAccessToken(token);
                setUser(userParsed);
            }
        } catch {
            // se storage estiver corrompido, limpa pra evitar loop
            clearSession();
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}