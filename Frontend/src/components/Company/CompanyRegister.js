import React, { useState, useRef } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, useMediaQuery, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
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

export default function CompanyRegister() {
    const { addCompany, companies, setSelectedCompany } = useCompany();

    const responsiveGrid = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const { showSnackbar } = useSnackbar();
    const [cnpj, set_cnpj] = useState("");
    const [razao_social, set_razao_social] = useState("");
    const [uf, set_uf] = useState("");
    const [regime_tributario, set_regime_tributario] = useState("");
    const [loading, setLoading] = useState(false);

    const [ultimoCnpjConsultado, setUltimoCnpjConsultado] = useState("");
    const [loadingCnpj, setLoadingCnpj] = useState(false);

    const navigate = useNavigate();
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
            showSnackbar("Preencha todos os campos.", "warning");
            return;
        }

        if (cnpj.length !== 18) {
            showSnackbar("CNPJ incompleto! Preencha corretamente.", "warning");
            return;
        }

        setLoading(true);

        const dados = {
            cnpj,
            razao_social,
            uf,
            regime_tributario,
            empresa_padrao: true
        };

        // Use o contexto
        const ok = await addCompany(dados);

        setLoading(false);

        if (ok) {
            // Aguarde o contexto atualizar e navegue
            // Aguarde as empresas carregarem antes de selecionar
            setTimeout(() => {
                // Busque a empresa recém-cadastrada
                const novaEmpresa = companies.find(c => c.cnpj === cnpj);
                if (novaEmpresa) setSelectedCompany(novaEmpresa);
                navigate("/sugestor");
            }, 200); // um pequeno delay para garantir atualização
        }
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={3} sx={{ p: 4, width: responsiveGrid ? '90%' : '30%', borderRadius: 4 }}>
                <Typography variant="h6" mb={2} align="center">Cadastrar Empresa</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="CNPJ"
                        fullWidth
                        required
                        margin="normal"
                        value={cnpj}
                        onChange={e => set_cnpj(mascaraCNPJ(e.target.value))}
                        onBlur={handleCNPJ}
                        inputProps={{ maxLength: 18 }}
                        disabled={loading || loadingCnpj}
                    />
                    <TextField
                        label="Razão Social"
                        fullWidth
                        required
                        margin="normal"
                        value={razao_social}
                        onChange={e => set_razao_social(e.target.value)}
                        disabled={loading || loadingCnpj}
                    />
                    <TextField
                        label="UF"
                        margin="normal"
                        select
                        required
                        value={uf}
                        onChange={e => set_uf(e.target.value)}
                        fullWidth
                        disabled={loading || loadingCnpj}
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
                        margin="normal"
                        value={regime_tributario}
                        onChange={e => set_regime_tributario(e.target.value)}
                        disabled={loading || loadingCnpj}
                    >
                        {regimes.map(op => (
                            <MenuItem key={op} value={op}>{op}</MenuItem>
                        ))}
                    </TextField>
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
                        disabled={loading || loadingCnpj}
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
                    {loadingCnpj && (
                        <Box display="flex" alignItems="center" gap={1} my={1}>
                            <CircularProgress size={20} />
                            <Typography fontSize={15}>Buscando dados do CNPJ...</Typography>
                        </Box>
                    )}
                </form>
            </Paper>
        </Box>
    );
}