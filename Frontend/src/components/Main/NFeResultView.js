import React, { useRef, useState } from "react";
import { Box, Paper, Skeleton, useMediaQuery } from "@mui/material";
import FormNFe from "./FormNFe";
import ResultCard from "./ResultCard";
import api from '../../services/api';
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useCompany } from "../../contexts/CompanyContext";
import { useAuth } from "../../contexts/AuthContext";

export default function NFeResultView() {
    const { user } = useAuth();
    const { selectedCompany } = useCompany();
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    // Responsividade
    const responsiveGrid = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const USAR_CACHE_BANCO = true;

    const handleGerarSugestao = async (dadosFormulario) => {
        setLoading(true);
        setResultado(null);

        // 1. Busca sugestão salva no banco, se permitido
        try {
            if (USAR_CACHE_BANCO) {
                const respBanco = await api.post('/bigdata/nfe/mostra/entrada', dadosFormulario);
                if (respBanco.data && Object.keys(respBanco.data || {}).length > 0) {
                    let resposta = respBanco.data;
                    if (typeof resposta === "string") {
                        try { resposta = JSON.parse(resposta); } catch { }
                    }
                    if (resposta?.erro_orientacao) {
                        setResultado({ erro_orientacao: resposta.erro_orientacao });
                    } else {
                        setResultado(resposta);
                    }
                    setLoading(false);
                    return;
                }
            }
        } catch (e) { }

        // 2. Consulta IA normalmente
        try {
            const resp = await api.post('/llms/nfe', dadosFormulario);

            if (resp.data?.erro_orientacao) {
                setResultado({ erro_orientacao: resp.data.erro_orientacao });
            } else if (Object.keys(resp.data || {}).length === 0) {
                showSnackbar("Não foi possível gerar a sugestão fiscal para esses dados.", "warning");
                setResultado(null);
            } else {
                setResultado(resp.data);

                // Prepara dados para salvar sugestão no banco
                const id_usuario = user?.id_usuario;
                const id_empresa = selectedCompany?.id_empresa;
                const dadosSalvar = {
                    id_usuario,
                    id_empresa,
                    ...dadosFormulario,
                    retorno_completo: resp.data
                };
                try {
                    await api.post('/bigdata/nfe/cria', dadosSalvar);
                } catch (saveError) {
                    console.error(saveError)
                }
            }
        } catch (err) {
            showSnackbar("Erro ao gerar sugestão fiscal. Tente novamente.", "error");
            setResultado(null);
        }
        setLoading(false);
    };

    const formRef = useRef();

    const handleNovaConsulta = () => {
        setResultado(null);
        setLoading(false);
        if (formRef.current && typeof formRef.current.reset === "function") {
            formRef.current.reset();
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 2, md: 3 },
                alignItems: "stretch",
                mt: responsiveGrid ? 2 : 2,
                width: "100%",
                mx: "auto",
            }}
        >
            {/* Coluna: Form */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "55%" } }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        height: "100%",
                        width: "100%",
                        bgcolor: "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            px: { xs: 2, sm: 2.5 },
                            py: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            background:
                                theme =>
                                    theme.palette.mode === "dark"
                                        ? "linear-gradient(135deg, rgba(25,118,210,.18), rgba(0,0,0,0))"
                                        : "linear-gradient(135deg, rgba(25,118,210,.10), rgba(255,255,255,0))",
                        }}
                    >
                        <Box sx={{ fontWeight: 800, fontSize: 16 }}>Entrada • NF-e</Box>
                        <Box sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
                            Preencha os dados mínimos para gerar a sugestão fiscal.
                        </Box>
                    </Box>

                    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <FormNFe ref={formRef} onGerarSugestao={handleGerarSugestao} disabled={loading} />
                    </Box>
                </Paper>
            </Box>

            {/* Coluna: Resultado */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "42%" } }}>
                {loading ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3 },
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            height: "100%",
                        }}
                    >
                        <Skeleton variant="rectangular" height={44} sx={{ mb: 2, borderRadius: 2 }} />
                        <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                        <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                        <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                        <Skeleton variant="rectangular" height={44} sx={{ mb: 2, borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={38} width="60%" sx={{ mb: 1 }} />
                    </Paper>
                ) : (
                    <ResultCard resultado={resultado} onNovaConsulta={handleNovaConsulta} />
                )}
            </Box>
        </Box>
    );

}