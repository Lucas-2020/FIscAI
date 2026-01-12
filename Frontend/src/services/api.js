import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

let accessToken = null;

export function setAccessToken(token) {
    accessToken = token;
}

api.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    async (err) => {
        const original = err.config;

        // Evita loop e ignora erros sem response (offline, CORS, etc.)
        if (!err.response) throw err;

        // Sem endpoint de refresh: ao tomar 401, encerra sessão no front
        if (err.response.status === 401 && !original?._retry) {
            original._retry = true;

            try {
                localStorage.removeItem("auth.accessToken");
                localStorage.removeItem("auth.user");
            } catch { }

            setAccessToken(null);

            // Se você usa React Router, o ideal é navegar via router,
            // mas esse fallback funciona em qualquer setup:
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        throw err;
    }
);

export default api;