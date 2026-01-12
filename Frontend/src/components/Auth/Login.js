import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Link, useMediaQuery, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from '../../contexts/SnackbarContext';
import api from '../../services/api';

export default function Login() {

    const responsiveGrid = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        var dados = { 'email': email, 'senha': senha };

        await api.post('usuario/login', dados).then(async response => {

            try {
                const r = await signIn(email, senha);
                if (r.ok) return navigate("/sugestor");

                if (r.data?.message === "negativo_email" || r.data?.message === "negativo_senha") {
                    showSnackbar('Credenciais incorretas ou conta não cadastrada! Clique em "Criar Conta" para cadastrar-se.', "warning");
                }
            } catch (err) {
                showSnackbar("Ocorreu um erro ao tentar fazer login. Tente novamente.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }


        }).catch((err) => {
            showSnackbar('Ocorreu um erro ao tentar fazer login. Tente novamente.', 'error');
            setLoading(false);
            console.error(err)
        });
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>

            <Paper elevation={3} sx={{ p: 4, width: responsiveGrid ? '90%' : '30%', borderRadius: 4 }}>
                <Typography variant="h5" mb={2} align="center" sx={{ fontWeight: "bold" }}>Entrar</Typography>
                <form onSubmit={handleLogin}>
                    <TextField
                        id="email"
                        label="E-mail"
                        type="email"
                        fullWidth
                        required
                        margin="normal"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        id="senha"
                        label="Senha"
                        type="password"
                        fullWidth
                        required
                        margin="normal"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        disabled={loading}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{
                            mt: 2,
                            mb: 1,
                            position: 'relative',
                            '&.Mui-disabled': {
                                backgroundColor: 'rgba(160,160,160,0.6)',
                                color: '#fff',
                                cursor: 'not-allowed',
                            }
                        }}
                        disabled={loading}
                    >
                        {loading && (
                            <CircularProgress
                                size={20}
                                sx={{ color: "white", position: "absolute", left: 16 }}
                            />
                        )}
                        <span style={{ marginLeft: loading ? 24 : 0 }}>
                            {loading ? "Entrando..." : "Entrar"}
                        </span>
                    </Button>

                </form>
                <Typography align="center" variant="body2" mt={2}>
                    Não tem uma conta?{" "}
                    <Link component="button" underline="hover" onClick={() => navigate("/cadastrar/conta")}>
                        Criar conta
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}