import React, { useState } from "react";
import {
    Box, Button, TextField, Typography, Paper, Link, useMediaQuery, CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from '../../contexts/SnackbarContext';

function isNomeValido(nome) {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(nome);
}

function mascaraCpfCnpj(value = "") {
    value = value.replace(/\D/g, "");
    if (value.length <= 11) {
        value = value
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .slice(0, 14);
    } else {
        value = value
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .slice(0, 18);
    }
    return value;
}

export default function Register() {
    const responsiveGrid = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const { signUp, signIn } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [nome, set_nome] = useState("");
    const [email, set_email] = useState("");
    const [cpf_cnpj, set_cpf_cnpj] = useState("");
    const [senha, set_senha] = useState("");
    const [confirmar_senha, set_confirmar_senha] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();

        if (!isNomeValido(nome)) {
            showSnackbar("Nome deve conter apenas letras.", "error");
            return;
        }
        if (!email || !senha || !confirmar_senha) {
            showSnackbar("Preencha todos os campos.", "warning");
            return;
        }
        if (senha !== confirmar_senha) {
            showSnackbar("Senhas não conferem.", "error");
            return;
        }

        setLoading(true);

        try {
            const dados = { nome, email, cpf_cnpj, senha };

            const r = await signUp(dados);
            if (!r.ok) {
                showSnackbar("E-mail já cadastrado!", "warning");
                return;
            }

            const s = await signIn(email, senha);

            showSnackbar("Conta criada com sucesso!", "success");

            if (s?.ok) {
                navigate("/cadastrar/empresa");
            } else {
                navigate("/");
            }

        } catch (err) {
            showSnackbar("Erro ao criar conta. Tente novamente.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={3} sx={{ p: 4, width: responsiveGrid ? '90%' : '30%', borderRadius: 4 }}>
                <Typography variant="h5" mb={2} align="center">Criar Conta</Typography>
                <form onSubmit={handleRegister}>
                    <TextField
                        label="Nome"
                        fullWidth
                        required
                        margin="normal"
                        value={nome}
                        onChange={e => set_nome(e.target.value)}
                        inputProps={{ pattern: "[A-Za-zÀ-ÿ\\s]*" }}
                        disabled={loading}
                    />
                    <TextField
                        label="CPF/CNPJ"
                        placeholder="Apenas para controle de adesão"
                        fullWidth
                        required
                        margin="normal"
                        value={cpf_cnpj}
                        onChange={e => set_cpf_cnpj(mascaraCpfCnpj(e.target.value))}
                        inputProps={{ maxLength: 18 }}
                        disabled={loading}
                    />
                    <TextField
                        label="E-mail"
                        type="email"
                        fullWidth
                        required
                        margin="normal"
                        value={email}
                        onChange={e => set_email(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Senha"
                        type="password"
                        fullWidth
                        required
                        margin="normal"
                        value={senha}
                        onChange={e => set_senha(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Confirmar Senha"
                        type="password"
                        fullWidth
                        required
                        margin="normal"
                        value={confirmar_senha}
                        onChange={e => set_confirmar_senha(e.target.value)}
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
                            {loading ? "Criando..." : "Criar conta"}
                        </span>
                    </Button>
                </form>

                <Typography align="center" variant="body2" mt={2}>
                    Já tem uma conta?{" "}
                    <Link component="button" underline="hover" onClick={() => navigate("/")}>
                        Entrar
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}