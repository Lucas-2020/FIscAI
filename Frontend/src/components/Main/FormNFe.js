import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Paper, Grid, TextField, RadioGroup, FormControlLabel, Radio, Button, Typography, Box, MenuItem, FormControl, FormLabel } from "@mui/material";
import { useCompany } from "../../contexts/CompanyContext";

const FormNFe = forwardRef(function FormNFe({ onGerarSugestao, disabled }, ref) {
    const { selectedCompany } = useCompany();

    const ufs = [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
        "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ];
    const operacoes = ["Entrada", "Saída"];
    const naturezas = ["Venda", "Bonificação", "Devolução", "Remessa", "Outros"];
    const finalidades = ["NF-e Normal", "NF-e Devolução", "NF-e Complementar", "NF-e Ajuste"];
    const regimesProdutos = ["Substituição Tributária", "Regime Monofásico", "Tributação Normal", "Isenção", "Suspensão", "Alíquota Zero", "Imunidade"];

    // Variáveis do formulário
    const [uf_destinatario, set_uf_destinatario] = useState("");
    const [tipo_operacao, set_tipo_operacao] = useState("");
    const [natureza_operacao, set_natureza_operacao] = useState("");
    const [finalidade, set_finalidade] = useState("");
    const [produto, set_produto] = useState("");
    const [regime_produto, set_regime_produto] = useState("");
    const [industrializado, set_industrializado] = useState(false);

    useImperativeHandle(ref, () => ({
        reset: () => {
            set_uf_destinatario("");
            set_tipo_operacao("");
            set_natureza_operacao("");
            set_finalidade("");
            set_produto("");
            set_regime_produto("");
            set_industrializado(false);
        }
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCompany) return;

        const DadosEntrada = {
            // Pega sempre os dados atualizados da empresa selecionada!
            regime_empresa: selectedCompany.regime_tributario,
            uf_emitente: selectedCompany.uf,
            uf_destinatario,
            tipo_operacao,
            natureza_operacao,
            finalidade,
            produto,
            regime_produto,
            industrializado: industrializado
        };

        //console.log(DadosEntrada)
        onGerarSugestao(DadosEntrada);
    };

    return (
        <>
            {selectedCompany && (
                <Typography
                    variant="h6"
                    mb={2}
                    fontWeight={800}
                    fontSize={18}
                    color="primary"
                    sx={{
                        display: { xs: "block", sm: "none" },
                        textAlign: "center",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        maxWidth: 700,
                    }}
                >
                    {selectedCompany.razao_social}
                    <span
                        style={{
                            fontSize: 13,
                            color: "#8898aa",
                            marginLeft: 8,
                            fontWeight: 600,
                            opacity: 0.8,
                        }}
                    >
                        {selectedCompany.uf ? `/ ${selectedCompany.uf}` : ""}
                    </span>
                </Typography>
            )}

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                        Preencha os dados da NF-e
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Campos essenciais para a IA sugerir NCM/CFOP e tributações com justificativa.
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="UF do Destinatário"
                                name="uf_destinatario"
                                select
                                required
                                value={uf_destinatario}
                                onChange={e => set_uf_destinatario(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {ufs.map(uf => (
                                    <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Tipo da Operação"
                                name="tipo_operacao"
                                select
                                required
                                value={tipo_operacao}
                                onChange={e => set_tipo_operacao(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {operacoes.map(op => (
                                    <MenuItem key={op} value={op}>{op}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Natureza da Operação"
                                name="natureza_operacao"
                                select
                                required
                                value={natureza_operacao}
                                onChange={e => set_natureza_operacao(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {naturezas.map(fin => (
                                    <MenuItem key={fin} value={fin}>{fin}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Finalidade"
                                name="finalidade"
                                select
                                required
                                value={finalidade}
                                onChange={e => set_finalidade(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {finalidades.map(fin => (
                                    <MenuItem key={fin} value={fin}>{fin}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Descrição do Produto"
                                name="produto"
                                placeholder="Ex.: Refrigerante Coca Cola - lata de alumínio 350 ml"
                                required
                                value={produto}
                                onChange={e => set_produto(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.6 }}>
                                Quanto mais detalhado, melhor a classificação (ex.: tipo, material, uso, modelo, embalagem, volume/peso).
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Regime do Produto"
                                name="regime"
                                select
                                required
                                value={regime_produto}
                                onChange={e => set_regime_produto(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {regimesProdutos.map(reg => (
                                    <MenuItem key={reg} value={reg}>{reg}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} display="flex" alignItems="center">
                            <FormControl component="fieldset" sx={{ width: "100%" }}>
                                <FormLabel
                                    component="legend"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: 13,
                                        color: "text.secondary",
                                        mb: 0.5,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.6,
                                    }}
                                >
                                    Produto industrializado
                                </FormLabel>
                                <RadioGroup
                                    row
                                    name="industrializado"
                                    value={industrializado ? "true" : "false"}
                                    onChange={e => set_industrializado(e.target.value === "true")}
                                >
                                    <FormControlLabel value={"true"} control={<Radio />} label="Sim" disabled={disabled} />
                                    <FormControlLabel value={"false"} control={<Radio />} label="Não" disabled={disabled} />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box
                        mt={2.5}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: { xs: "stretch", sm: "center" },
                            gap: 1.5,
                            flexDirection: { xs: "column", sm: "row" },
                            pt: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            Ao gerar, você receberá campos sugeridos com justificativas e observações.
                        </Typography>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={disabled || !selectedCompany}
                            sx={{
                                borderRadius: 3,
                                fontWeight: 800,
                                py: 1.15,
                                px: 2.4,
                                boxShadow: theme => theme.palette.mode === "dark"
                                    ? "0 10px 26px rgba(25,118,210,.20)"
                                    : "0 10px 26px rgba(25,118,210,.18)",
                            }}
                        >
                            Gerar sugestão
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Typography
                variant="caption"
                sx={{
                    display: "block",
                    mt: 2,
                    color: theme => theme.palette.text.secondary,
                    textAlign: "center",
                    maxWidth: 640,
                    mx: "auto",
                    fontSize: 13,
                    lineHeight: 1.6,
                }}
            >
                <strong>Aviso:</strong> As sugestões fiscais são geradas por IA e servem como apoio. Recomendamos validar com a
                legislação vigente e/ou seu responsável fiscal.
            </Typography>
        </>
    );

});

export default FormNFe;