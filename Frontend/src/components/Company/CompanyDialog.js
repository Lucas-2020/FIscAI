import React, { useState, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, CircularProgress, Box, Typography } from "@mui/material";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useCompany } from "../../contexts/CompanyContext";
import api from '../../services/api';

const ufs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
    "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const regimes = [
    "Simples Nacional",
    "Lucro Presumido",
    "Lucro Real",
    "MEI"
];

function mascaraCNPJ(value = "") {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
}

export default function CompanyDialog({ open, onClose }) {
    const { addCompany, loading } = useCompany();
    const { showSnackbar } = useSnackbar();

    // Campos do formulário
    const [cnpj, set_cnpj] = useState("");
    const [razao_social, set_razao_social] = useState("");
    const [uf, set_uf] = useState("");
    const [regime_tributario, set_regime_tributario] = useState("");

    // Limpa campos ao fechar
    const handleClose = () => {
        set_cnpj(""); set_razao_social(""); set_uf(""); set_regime_tributario("");
        setUltimoCnpjConsultado("");
        onClose();
    };

    const [ultimoCnpjConsultado, setUltimoCnpjConsultado] = useState("");
    const [loadingCnpj, setLoadingCnpj] = useState(false);
    const razaoRef = useRef();

    // Preenche a Razão Social e o UF ao inserir o CNPJ
    const handleCNPJ = async () => {

        // Se estiver vazio limpa os campos
        if (!cnpj) {
            set_razao_social("");
            set_uf("");
            set_regime_tributario("");
            return;
        }

        // Checa condições antes de consultar
        if (cnpj.length !== 18 || cnpj === ultimoCnpjConsultado) return;

        setUltimoCnpjConsultado(cnpj);
        setLoadingCnpj(true);
        let timeout;
        try {
            const timeoutPromise = new Promise((_, reject) =>
                timeout = setTimeout(() => reject(new Error('timeout')), 5000)
            );
            const consultaPromise = api.post('/consulta/cnpj', { cnpj: cnpj });
            const resp = await Promise.race([consultaPromise, timeoutPromise]);
            if (resp && resp.data && resp.data.nome) {
                set_razao_social(resp.data.nome);
                set_uf(resp.data.uf);
            } else {
                showSnackbar("Não foi possível preencher automaticamente. Preencha manualmente.", "error");
                set_razao_social("");
                set_uf("");
                setTimeout(() => razaoRef.current && razaoRef.current.focus(), 100);
            }
        } catch (err) {
            showSnackbar("Não foi possível preencher automaticamente. Preencha manualmente.", "error");
            set_razao_social("");
            set_uf("");
            setTimeout(() => razaoRef.current && razaoRef.current.focus(), 100);
        } finally {
            setLoadingCnpj(false);
            clearTimeout(timeout);
        }
    };

    // Salva a empresa
    async function handleSubmit(e) {
        e.preventDefault();

        if (!cnpj || !razao_social || !uf || !regime_tributario) {
            addCompany({ cnpj, razao_social, uf, regime_tributario, empresa_padrao: false, skipApi: true });
            return;
        }

        if (cnpj.length !== 18) {
            showSnackbar("CNPJ incompleto! Preencha corretamente.", "warning");
            return;
        }

        const sucesso = await addCompany({ cnpj, razao_social, uf, regime_tributario, empresa_padrao: false });
        if (sucesso) {
            handleClose(); // fecha e limpa o dialog só no sucesso real
        }
    }


    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cadastrar Empresa</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        label="CNPJ"
                        fullWidth
                        required
                        margin="dense"
                        value={cnpj}
                        onChange={e => set_cnpj(mascaraCNPJ(e.target.value))}
                        onBlur={handleCNPJ}
                        inputProps={{ maxLength: 18 }}
                        disabled={loading}
                    />
                    <TextField
                        label="Razão Social"
                        fullWidth
                        required
                        margin="dense"
                        value={razao_social}
                        onChange={e => set_razao_social(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="UF"
                        margin="dense"
                        select
                        required
                        value={uf}
                        onChange={e => set_uf(e.target.value)}
                        fullWidth
                        disabled={loading}
                    >
                        {ufs.map(uf => (
                            <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Regime Tributário"
                        select
                        fullWidth
                        required
                        margin="dense"
                        value={regime_tributario}
                        onChange={e => set_regime_tributario(e.target.value)}
                        disabled={loading}
                    >
                        {regimes.map(op => (
                            <MenuItem key={op} value={op}>{op}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions style={{ paddingBottom: 20, paddingRight: 22 }}>
                    {loadingCnpj && (
                        <Box display="flex" alignItems="center" gap={1} my={1}>
                            <CircularProgress size={20} />
                            <Typography fontSize={15}>Buscando dados do CNPJ...</Typography>
                        </Box>
                    )}
                    <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button
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
                            {loading ? "Salvando..." : "Salvar"}
                        </span>
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}