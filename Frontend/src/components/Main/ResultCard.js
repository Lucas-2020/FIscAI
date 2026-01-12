import React from "react";
import {
    Paper, Typography, Box, Button, Chip, Divider,
    Tooltip, IconButton, useTheme
} from "@mui/material";
import { FileCopy, Info, Description, Lightbulb, WarningAmber } from "@mui/icons-material";
import jsPDF from "jspdf";

// Ordem dos campos para NFe
const ORDEM_NFE = [
    "ncm",
    "cfop",
    "cst_icms",
    "aliquota_icms",
    "cst_ipi",
    "aliquota_ipi",
    "cst_pis",
    "aliquota_pis",
    "cst_cofins",
    "aliquota_cofins",
    "observacoes_legais",
];

// Ordem dos campos para NFS-e
const ORDEM_NFSE = [
    "codigo_servico_lc116",
    "descricao_classificada",
    "cnae_sugerido",
    "aliquota_iss",
    "iss_retido",
    "municipio_incidente",
    "retencoes",
    "regime_empresa",
    "embasamento_legal",
    "xml_tags",
    "observacoes_legais",
];

// Função auxiliar para ordenar os campos
function ordenarCampos(obj) {
    if (!obj) return [];

    const chaves = Object.keys(obj);

    // Detecta pelo(s) campo(s) se é NFe ou NFS-e (heurística simples)
    const isNFe = chaves.includes("ncm");
    const isNFSe = chaves.includes("codigo_servico_lc116") || chaves.includes("aliquota_iss");

    const ordem = isNFe ? ORDEM_NFE : (isNFSe ? ORDEM_NFSE : []);
    const jaListados = new Set();

    // Monta o array de [chave, valor] na ordem desejada, depois adiciona extras no final
    const result = [];
    ordem.forEach((key) => {
        if (obj[key] !== undefined) {
            result.push([key, obj[key]]);
            jaListados.add(key);
        }
    });
    chaves.forEach((key) => {
        if (!jaListados.has(key) && key !== "erro_orientacao") {
            result.push([key, obj[key]]);
        }
    });
    return result;
}

// Label amigável
function formatKeyLabel(key) {
    return key.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function ResultCard({ resultado, onNovaConsulta }) {
    const theme = useTheme();

    // Cores para warning
    const warningColor = theme.palette.warning.main || "#ffa726";
    const warningBg = theme.palette.mode === "dark" ? "#352910" : "#fff8e1";

    // Caso orientação fiscal (erro_orientacao)
    if (resultado && resultado.erro_orientacao) {
        return (
            <Paper
                elevation={4}
                sx={{
                    p: { xs: 2, md: 4 },
                    borderRadius: 5,
                    bgcolor: warningBg,
                    border: `1.5px solid ${warningColor}`,
                    minHeight: 400,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                }}
            >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <WarningAmber sx={{ color: warningColor, fontSize: 32 }} />
                    <Typography variant="h6" fontWeight={700} color={warningColor}>
                        Orientação Fiscal
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: warningColor,
                        fontWeight: 500,
                        whiteSpace: "pre-line",
                        mb: 2
                    }}
                >
                    {resultado.erro_orientacao}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => navigator.clipboard.writeText(resultado.erro_orientacao)}
                        sx={{ borderRadius: 3, fontWeight: 600 }}
                        startIcon={<FileCopy />}
                    >
                        Copiar Orientação
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            const doc = new jsPDF();
                            doc.setFontSize(18);
                            doc.setFont("helvetica", "bold");
                            doc.text("Orientação Fiscal", 14, 18);
                            doc.setFontSize(12);
                            doc.setFont("helvetica", "normal");
                            const splitText = doc.splitTextToSize(resultado.erro_orientacao, 180);
                            doc.text(splitText, 14, 30);
                            doc.save("orientacao-fiscal.pdf");
                        }}
                        sx={{ borderRadius: 3, fontWeight: 600 }}
                    >
                        Exportar PDF
                    </Button>
                </Box>
            </Paper>
        );
    }

    if (!resultado) {
        return (
            <Paper
                sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === "dark" ? "#1A2027" : "#f7fafc",
                }}
            >
                <Box py={6} textAlign="center" color="text.secondary">
                    Aguarde a geração da sugestão fiscal para este produto.
                </Box>
            </Paper>
        );
    }

    const { observacoes_legais, ...outros } = resultado;
    const camposOrdenados = ordenarCampos(outros);

    const exportarPDF = () => {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let y = 18;

        // Cabeçalho
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Resultado da Sugestão", margin, y);
        y += 9;

        // Blocos dos campos
        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        camposOrdenados.forEach(([key, value]) => {
            if (y > 270) { // Nova página se chegar perto do final
                doc.addPage();
                y = 18;
            }
            // Campo (título)
            doc.setFont("helvetica", "bold");
            doc.text(formatKeyLabel(key) + ":", margin, y);
            y += 6;

            doc.setFont("helvetica", "normal");
            if (Array.isArray(value) && value.length) {
                value.forEach((item, idx) => {
                    let line = "";
                    if (typeof item === "object" && item.valor !== undefined) {
                        line = `- ${item.valor}: ${item.justificativa}`;
                    } else {
                        line = `- ${String(item)}`;
                    }
                    const lines = doc.splitTextToSize(line, pageWidth - margin * 2);
                    doc.text(lines, margin + 4, y);
                    y += lines.length * 6;
                });
            } else {
                // Texto comum (inclui quebra)
                const lines = doc.splitTextToSize(String(value ?? "—"), pageWidth - margin * 2);
                doc.text(lines, margin + 4, y);
                y += lines.length * 6;
            }
            y += 2; // Espaço extra entre blocos
            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 4;
        });

        // Observações Legais (se existirem)
        if (observacoes_legais && Array.isArray(observacoes_legais) && observacoes_legais.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 18;
            }
            y += 4;
            doc.setFontSize(15);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 80, 180);
            doc.text("Observações Técnicas", margin, y);
            y += 8;
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            observacoes_legais.forEach((obs) => {
                const obsLines = doc.splitTextToSize("• " + obs, pageWidth - margin * 2);
                doc.text(obsLines, margin + 2, y);
                y += obsLines.length * 6;
            });
        }

        doc.save("resultado.pdf");
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                overflow: "hidden",
            }}
        >
            {/* Top bar */}
            <Box
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    background:
                        theme =>
                            theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(25,118,210,.16), rgba(0,0,0,0))"
                                : "linear-gradient(135deg, rgba(25,118,210,.10), rgba(255,255,255,0))",
                }}
            >
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Description sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                            Sugestão gerada
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                        Valores sugeridos com justificativa e observações técnicas.
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={exportarPDF}
                        sx={{ borderRadius: 3, fontWeight: 800 }}
                    >
                        Exportar PDF
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onNovaConsulta}
                        sx={{ borderRadius: 3, fontWeight: 900 }}
                    >
                        Nova consulta
                    </Button>
                </Box>
            </Box>

            {/* Conteúdo */}
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                {camposOrdenados.map(([key, value], idx, arr) => (
                    <Box key={key} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Typography
                                fontWeight={900}
                                variant="subtitle2"
                                sx={{
                                    color: theme.palette.primary.main,
                                    letterSpacing: 0.6,
                                    textTransform: "uppercase",
                                    fontSize: 12,
                                }}
                            >
                                {formatKeyLabel(key)}
                            </Typography>

                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.35,
                                    borderRadius: 999,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    color: "text.secondary",
                                    fontSize: 12,
                                    bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)",
                                }}
                            >
                                {Array.isArray(value) ? `${value.length} opção(ões)` : "—"}
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                mt: 1,
                                p: 1.5,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.015)",
                            }}
                        >
                            {Array.isArray(value) && value.length > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                                    {value.map((item, i) =>
                                        typeof item === "object" && item.valor !== undefined ? (
                                            <Box
                                                key={i}
                                                sx={{
                                                    borderRadius: 2.5,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    px: 1.5,
                                                    py: 1.3,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 1,
                                                    bgcolor: theme => theme.palette.mode === "dark" ? "#121826" : "#fff",
                                                }}
                                            >
                                                {/* Linha de cima: Chip + Copiar */}
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                                    <Chip
                                                        label={item.valor}
                                                        sx={{
                                                            fontWeight: 900,
                                                            fontSize: 14,
                                                            bgcolor: theme.palette.primary.main,
                                                            color: "#fff",
                                                        }}
                                                        icon={<Lightbulb style={{ color: "#fff" }} />}
                                                    />

                                                    <Tooltip title="Copiar valor" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigator.clipboard.writeText(item.valor)}
                                                            sx={{
                                                                borderRadius: 2,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.02)",
                                                            }}
                                                        >
                                                            <FileCopy fontSize="inherit" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                {/* Descrição abaixo */}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "text.primary",
                                                        lineHeight: 1.55,
                                                        whiteSpace: "pre-line",
                                                    }}
                                                >
                                                    {item.justificativa}
                                                </Typography>
                                            </Box>

                                        ) : (
                                            <Chip
                                                key={i}
                                                label={String(item)}
                                                sx={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)",
                                                }}
                                            />
                                        )
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Sem opções sugeridas.
                                </Typography>
                            )}
                        </Box>

                        {idx < arr.length - 1 && <Divider sx={{ mt: 2.5 }} />}
                    </Box>
                ))}

                {observacoes_legais && Array.isArray(observacoes_legais) && (
                    <>
                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                            <Info sx={{ color: theme.palette.primary.main }} />
                            <Typography variant="subtitle1" fontWeight={900}>
                                Observações técnicas
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                            {observacoes_legais.map((obs, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        px: 1.6,
                                        py: 1.3,
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 1.2,
                                        bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)",
                                    }}
                                >
                                    <Info fontSize="small" color="action" sx={{ mt: "2px", opacity: 0.75 }} />
                                    <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.55 }}>
                                        {obs}
                                    </Typography>
                                    <Tooltip title="Copiar observação" arrow>
                                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(obs)}>
                                            <FileCopy fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                mt: 2.5,
                                p: 1.5,
                                borderRadius: 3,
                                border: "1px dashed",
                                borderColor: "divider",
                                bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.015)",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.2,
                            }}
                        >
                            <Tooltip title="As observações ajudam no preenchimento e na conferência antes da emissão." arrow>
                                <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                                    <Info fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                Use estas observações como apoio na validação fiscal e no preenchimento do seu emissor.
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Paper>
    );

}