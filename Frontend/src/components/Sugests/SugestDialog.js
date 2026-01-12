import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, Tabs, Tab,
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Box, Chip, IconButton, Divider, Tooltip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CloseIcon from '@mui/icons-material/Close';
import { FileCopy, Lightbulb, Description } from "@mui/icons-material";

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
    const isNFe = chaves.includes("ncm");
    const isNFSe = chaves.includes("codigo_servico_lc116") || chaves.includes("aliquota_iss");
    const ordem = isNFe ? ORDEM_NFE : (isNFSe ? ORDEM_NFSE : []);
    const jaListados = new Set();

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

function formatKeyLabel(key) {
    return key.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function SugestaoAccordion({ retorno_completo }) {
    if (!retorno_completo) return null;

    // Garante objeto (pode vir string do banco)
    let campos = retorno_completo;
    if (typeof campos === "string") {
        try { campos = JSON.parse(retorno_completo); } catch { }
    }

    // Separe observacoes_legais para exibir no final
    const { observacoes_legais, ...outros } = campos;
    const camposOrdenados = ordenarCampos(outros);

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Description color="primary" />
                <Typography fontWeight={600} variant="subtitle1">Sugestão Fiscal</Typography>
            </Box>
            {camposOrdenados.map(([key, value], idx, arr) => (
                <Box key={key} mb={2}>
                    <Typography
                        fontWeight={600}
                        variant="subtitle2"
                        sx={{ color: "primary.main", letterSpacing: 1, mb: 0.5 }}
                    >
                        {formatKeyLabel(key)}:
                    </Typography>
                    {Array.isArray(value) && value.length > 0 ? (
                        value.map((item, i) =>
                            typeof item === "object" && item.valor !== undefined ? (
                                <Box
                                    key={i}
                                    sx={{
                                        bgcolor: "#e3f0fc",
                                        borderRadius: 2,
                                        px: 2, py: 1, mb: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Chip
                                        label={item.valor}
                                        sx={{
                                            bgcolor: "primary.main",
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontSize: 15,
                                            mr: 1
                                        }}
                                        icon={<Lightbulb style={{ color: "#fff" }} />}
                                    />
                                    <Typography variant="body2" sx={{ color: "#153657", flex: 1 }}>
                                        {item.justificativa}
                                    </Typography>
                                    <Tooltip title="Copiar valor" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigator.clipboard.writeText(item.valor)}
                                            sx={{
                                                bgcolor: "#fff",
                                                color: "primary.main",
                                                ":hover": { bgcolor: "#e3f0fc" }
                                            }}
                                        >
                                            <FileCopy fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ) : (
                                <Chip
                                    key={i}
                                    label={String(item)}
                                    color="primary"
                                    sx={{ fontSize: 13, bgcolor: "#e3f0fc", mb: 1 }}
                                />
                            )
                        )
                    ) : (
                        <Typography variant="body2" color="text.secondary">Sem opções sugeridas.</Typography>
                    )}
                    {idx < arr.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
            ))}
            {observacoes_legais && Array.isArray(observacoes_legais) && (
                <Box mt={2}>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                        <Box display="flex" alignItems="center" mb={1} gap={1}>
                            <InfoOutlinedIcon sx={{ color: "primary.main" }} />
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                Observações Técnicas
                            </Typography>
                        </Box>
                        <Box ml={1}>
                            {observacoes_legais.map((obs, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        bgcolor: "#e3f0fc",
                                        borderRadius: 2,
                                        px: 2, py: 1, mb: 1,
                                        fontSize: 15,
                                        color: "#153657",
                                        display: "flex", alignItems: "center", gap: 1,
                                    }}
                                >
                                    <InfoOutlinedIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.7 }} />
                                    {obs}
                                    <Tooltip title="Copiar observação" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigator.clipboard.writeText(obs)}
                                        >
                                            <FileCopy fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default function SugestDialog({ open, onClose, fetchSugestoes }) {
    const [sugestoes, setSugestoes] = useState([]);
    const [aba, setAba] = useState(0);

    // Separação: nfe x nfse
    const sugestoesNFe = sugestoes.filter(s => !s.tipo_sugestao || s.tipo_sugestao === "nfe");
    const sugestoesNFSe = sugestoes.filter(s => s.tipo_sugestao === "nfse");

    useEffect(() => {
        if (open) {
            fetchSugestoes().then(setSugestoes);
        }
    }, [open, fetchSugestoes]);

    function ResumoSugestaoNFe({ s }) {
        const produto = s.descricao_produto || s.produto || "-";
        const campos = [
            { label: "UF Emitente", value: s.uf_emitente },
            { label: "UF Destinatário", value: s.uf_destinatario },
            { label: "Tipo Op.", value: s.tipo_operacao },
            { label: "Natureza Op.", value: s.natureza_operacao },
            { label: "Finalidade", value: s.finalidade }
        ];

        return (
            <Box width="100%">
                <Typography fontWeight={700} fontSize={18} color="primary.main">
                    {produto}
                </Typography>
                <Box mt={0.5} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    {campos.map((c, idx) => (
                        <React.Fragment key={c.label}>
                            <Typography component="span" fontSize={14} color="text.secondary">
                                {c.label}:
                            </Typography>
                            <Typography
                                component="span"
                                fontSize={14}
                                color="text.primary"
                                fontWeight={500}
                                sx={{ ml: 0.5, mr: 1 }}
                            >
                                {c.value}
                            </Typography>
                            {idx < campos.length - 1 && (
                                <Typography
                                    component="span"
                                    fontSize={15}
                                    color="text.disabled"
                                    sx={{ mx: 0.5, opacity: 0.6 }}
                                >
                                    |
                                </Typography>
                            )}
                        </React.Fragment>
                    ))}
                </Box>
            </Box>
        );
    }

    function ResumoSugestaoNFSe({ s }) {
        // Resumo simplificado para NFSe
        const servico = s.descricao_servico || "-";
        const campos = [
            { label: "Valor Serviço", value: s.valor_servico },
            { label: "Município Tomador", value: s.municipio_tomador },
            { label: "Regime", value: s.regime_empresa }
        ];
        return (
            <Box width="100%">
                <Typography fontWeight={700} fontSize={18} color="primary.main">
                    {servico}
                </Typography>
                <Box mt={0.5} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    {campos.map((c, idx) => (
                        <React.Fragment key={c.label}>
                            <Typography component="span" fontSize={14} color="text.secondary">
                                {c.label}:
                            </Typography>
                            <Typography
                                component="span"
                                fontSize={14}
                                color="text.primary"
                                fontWeight={500}
                                sx={{ ml: 0.5, mr: 1 }}
                            >
                                {c.value}
                            </Typography>
                            {idx < campos.length - 1 && (
                                <Typography
                                    component="span"
                                    fontSize={15}
                                    color="text.disabled"
                                    sx={{ mx: 0.5, opacity: 0.6 }}
                                >
                                    |
                                </Typography>
                            )}
                        </React.Fragment>
                    ))}
                </Box>
            </Box>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentOutlinedIcon color="primary" />
                Minhas Sugestões
                <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 10 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Tabs value={aba} onChange={(_, v) => setAba(v)} variant="fullWidth">
                <Tab label="Sugestões NF-e" />
                <Tab label="Sugestões NFS-e" />
            </Tabs>
            <DialogContent dividers sx={{ minHeight: 450, bgcolor: "#f7fafc" }}>
                {/* ABA NFe */}
                {aba === 0 && (
                    sugestoesNFe.length === 0 ?
                        <Typography color="text.secondary">Nenhuma sugestão encontrada.</Typography>
                        :
                        sugestoesNFe.map((s, i) => (
                            <Accordion key={s.id_sugestao_nfe || i} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <ResumoSugestaoNFe s={s} />
                                </AccordionSummary>
                                <AccordionDetails>
                                    <SugestaoAccordion retorno_completo={s.retorno_completo} />
                                </AccordionDetails>
                            </Accordion>
                        ))
                )}
                {/* ABA NFSe */}
                {aba === 1 && (
                    sugestoesNFSe.length === 0 ?
                        <Typography color="text.secondary">Nenhuma sugestão encontrada.</Typography>
                        :
                        sugestoesNFSe.map((s, i) => (
                            <Accordion key={s.id_sugestao_nfse || i} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <ResumoSugestaoNFSe s={s} />
                                </AccordionSummary>
                                <AccordionDetails>
                                    <SugestaoAccordion retorno_completo={s.retorno_completo} />
                                </AccordionDetails>
                            </Accordion>
                        ))
                )}
            </DialogContent>
        </Dialog>
    );
}