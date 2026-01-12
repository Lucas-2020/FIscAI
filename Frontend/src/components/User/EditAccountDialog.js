import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import api from '../../services/api';

function isNomeValido(nome) {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(nome);
}

function mascaraCpfCnpj(value = "") {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, "");

    if (value.length <= 11) {
        // Aplica máscara de CPF: xxx.xxx.xxx-xx
        value = value
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .slice(0, 14);
    } else {
        // Aplica máscara de CNPJ: xx.xxx.xxx/xxxx-xx
        value = value
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .slice(0, 18);
    }
    return value;
}


export default function EditAccountDialog({ open, onClose }) {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();

    const [nome, set_nome] = useState(user?.nome || "");
    const [cpf_cnpj, set_cpf_cnpj] = useState(user?.cpf_cnpj || "");
    const [senha, set_senha] = useState("");
    const [confirmar_senha, set_confirmar_senha] = useState("");
    const [loading, setLoading] = useState(false);

    // Atualiza os campos sempre que abrir o dialog
    useEffect(() => {
        async function fetchUser() {
            const id_usuario = user?.id_usuario;
            if (id_usuario && open) {
                try {
                    const res = await api.get('/usuario/read');
                    set_nome(res.data?.nome || "");
                    set_cpf_cnpj(res.data?.cpf_cnpj || "");
                } catch {
                    set_nome("");
                    set_cpf_cnpj("");
                }
            }
            set_senha("");
            set_confirmar_senha("");
        }
        if (open) fetchUser();
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nome) {
            showSnackbar("Preencha o nome.", "warning");
            return;
        }
        if (!cpf_cnpj) {
            showSnackbar("Preencha o nome.", "warning");
            return;
        }

        if (cpf_cnpj.length !== 18 && cpf_cnpj.length !== 14) {
            showSnackbar("Documento incompleto! Preencha corretamente.", "warning");
            return;
        }

        if (!isNomeValido(nome)) {
            showSnackbar("Nome deve conter apenas letras.", "error");
            return;
        }
        if (senha && senha !== confirmar_senha) {
            showSnackbar("Senhas não conferem.", "error");
            return;
        }

        setLoading(true);

        const id_usuario = user?.id_usuario;
        if (!id_usuario) {
            showSnackbar("Usuário não autenticado.", "error");
            setLoading(false);
            return;
        }

        // Monta payload: só manda senha se foi digitada
        const payload = senha
            ? { id_usuario, nome, cpf_cnpj, senha }
            : { id_usuario, nome, cpf_cnpj };

        try {
            const res = await api.put('/usuario/update', payload);
            if (res.data.status === true) {
                showSnackbar("Dados atualizados com sucesso!", "success");
                onClose();
            } else {
                showSnackbar("Erro ao atualizar os dados.", "error");
            }
        } catch {
            showSnackbar("Erro ao atualizar os dados.", "error");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Editar Conta</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
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
                        label="Nova Senha"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={senha}
                        onChange={e => set_senha(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Confirmar Senha Nova"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmar_senha}
                        onChange={e => set_confirmar_senha(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions style={{ paddingBottom: 20, paddingRight: 22 }}>
                    <Button onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        sx={{
                            position: 'relative',
                            '&.Mui-disabled': {
                                backgroundColor: 'rgba(160,160,160,0.6)',
                                color: '#fff',
                                cursor: 'not-allowed',
                            }
                        }}
                    >
                        {loading && (
                            <CircularProgress
                                size={20}
                                sx={{ color: "white", position: "absolute", left: 16 }}
                            />
                        )}
                        <span style={{ marginLeft: loading ? 24 : 0 }}>
                            {loading ? "Salvando..." : "Salvar"}
                        </span>
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}