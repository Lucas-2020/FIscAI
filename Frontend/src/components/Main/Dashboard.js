import React, { useState, useEffect } from "react";
import Header from "../Layout/Header";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useCompany } from "../../contexts/CompanyContext";
import NFeResultView from "./NFeResultView";
import NFSeResultView from "./NFSeResultView";
import TabsSelector from "../Main/TabsSelector";

export default function Dashboard() {
    const { selectedCompany } = useCompany();
    const [tab, setTab] = useState("nfe");

    // Previne "undefined" (ex: forçar para nfse se MEI)
    useEffect(() => {
        if (selectedCompany?.regime_tributario === "MEI" && tab === "nfe") {
            setTab("nfse");
        }
    }, [selectedCompany, tab]);

    return (
        <>
            <Header />

            <Box
                sx={{
                    minHeight: "calc(100vh - 64px)",
                    background:
                        theme =>
                            theme.palette.mode === "dark"
                                ? "radial-gradient(1200px 600px at 10% 10%, rgba(25,118,210,.25), transparent 55%), radial-gradient(900px 500px at 90% 20%, rgba(156,39,176,.22), transparent 55%)"
                                : "radial-gradient(1200px 600px at 10% 10%, rgba(25,118,210,.12), transparent 55%), radial-gradient(900px 500px at 90% 20%, rgba(156,39,176,.10), transparent 55%)",
                    py: { xs: 2, sm: 4 },
                }}
            >
                <Box sx={{ px: { xs: 1, sm: 3 }, width: "90%", mx: "auto" }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3 },
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            mb: { xs: 2, sm: 3 },
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                pointerEvents: "none",
                                background:
                                    theme =>
                                        theme.palette.mode === "dark"
                                            ? "linear-gradient(120deg, rgba(25,118,210,.14), transparent 55%)"
                                            : "linear-gradient(120deg, rgba(25,118,210,.10), transparent 55%)",
                            }}
                        />
                        <Box sx={{ position: "relative" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: { xs: "flex-start", sm: "center" },
                                    justifyContent: "space-between",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Box
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: 20, sm: 24 },
                                            lineHeight: 1.15,
                                        }}
                                    >
                                        Sugestões fiscais para emissão
                                    </Box>
                                    <Box
                                        sx={{
                                            mt: 0.5,
                                            color: "text.secondary",
                                            fontSize: 14,
                                            maxWidth: 720,
                                        }}
                                    >
                                        Preencha os dados e gere uma sugestão completa para NF-e ou NFS-e, com justificativas e observações
                                        técnicas.
                                    </Box>

                                    {selectedCompany ? (
                                        <Box
                                            sx={{
                                                mt: 1.5,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                flexWrap: "wrap",
                                                color: "text.secondary",
                                                fontSize: 13,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    px: 1.2,
                                                    py: 0.5,
                                                    borderRadius: 999,
                                                    bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    maxWidth: "100%",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                                title={selectedCompany.razao_social}
                                            >
                                                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                    {selectedCompany.razao_social}
                                                </Box>
                                                <Box component="span" sx={{ ml: 1, opacity: 0.8 }}>
                                                    {selectedCompany.uf ? `• ${selectedCompany.uf}` : ""}
                                                    {selectedCompany.regime_tributario ? ` • ${selectedCompany.regime_tributario}` : ""}
                                                </Box>
                                            </Box>

                                            <Box sx={{ opacity: 0.8 }}>
                                                Escolha o tipo de nota abaixo:
                                            </Box>
                                        </Box>
                                    ) : null}
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: { xs: "center", sm: "flex-end" },
                                        width: { xs: "100%", sm: "auto" },
                                    }}
                                >
                                    <TabsSelector tab={tab} setTab={setTab} />
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {!selectedCompany ? (
                        <Paper
                            sx={{
                                p: { xs: 2.5, sm: 4 },
                                mt: 1,
                                textAlign: "center",
                                borderRadius: 4,
                                border: "1px dashed",
                                borderColor: "divider",
                                bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)",
                            }}
                        >
                            <Box sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>
                                Nenhuma empresa selecionada
                            </Box>
                            <Box sx={{ color: "text.secondary", maxWidth: 520, mx: "auto" }}>
                                Cadastre e selecione uma empresa para acessar a ferramenta e liberar a geração de sugestões fiscais.
                            </Box>
                        </Paper>
                    ) : (
                        <>
                            {tab === "nfe" && <NFeResultView />}
                            {tab === "nfse" && <NFSeResultView />}
                        </>
                    )}
                </Box>
            </Box>
        </>
    );

}