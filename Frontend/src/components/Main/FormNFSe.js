import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Paper, Grid, TextField, RadioGroup, FormControlLabel, Radio, Button, Typography, Box, MenuItem, FormControl, FormLabel } from "@mui/material";
import { useCompany } from "../../contexts/CompanyContext";

import stateCity from './Location/StateCity.json';

const FormNFSe = forwardRef(function FormNFSe({ onGerarSugestao, disabled }, ref) {
    const { selectedCompany } = useCompany();

    // Campos do form
    const [uf_prestador, set_uf_prestador] = useState(selectedCompany?.uf);
    const [municipio_prestador, set_municipio_prestador] = useState("");
    const [uf_tomador, set_uf_tomador] = useState("");
    const [municipio_tomador, set_municipio_tomador] = useState("");
    const [descricao_servico, set_descricao_servico] = useState("");
    const [valor_servico, set_valor_servico] = useState("");
    const [tomador_orgao_publico, set_tomador_orgao_publico] = useState(false);
    const [tomador_exterior, set_tomador_exterior] = useState(false);

    // Estados
    const ufs = stateCity.estados;

    // Cidades
    const cidadesPrestador = ufs.find(uf => uf.sigla === uf_prestador)?.cidades || [];
    const cidadesTomador = ufs.find(uf => uf.sigla === uf_tomador)?.cidades || [];

    // Limpa formulário via ref
    useImperativeHandle(ref, () => ({
        reset: () => {
            set_uf_prestador("");
            set_uf_tomador("");
            set_municipio_prestador("");
            set_municipio_tomador("");
            set_descricao_servico("");
            set_valor_servico("");
            set_tomador_orgao_publico(false);
            set_tomador_exterior(false);
        }
    }));

    // Atualiza uf_prestador sempre que selectedCompany mudar
    useEffect(() => {
        set_uf_prestador(selectedCompany?.uf || "");
    }, [selectedCompany]);

    // Máscara de dinheiro (padrão BR)
    function mascaraDinheiro(value = "") {
        let v = value.replace(/\D/g, "");
        if (!v) return "";
        v = v.replace(/^0+/, '');
        if (v.length === 1) v = "00" + v;
        if (v.length === 2) v = "0" + v;
        let reais = v.slice(0, -2);
        let centavos = v.slice(-2);
        reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return (reais ? reais : "0") + "," + centavos;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCompany) return;

        // Envia para o backend
        const DadosEntrada = {
            regime_empresa: selectedCompany.regime_tributario,
            uf_prestador,
            municipio_prestador,
            uf_tomador,
            municipio_tomador,
            descricao_servico,
            valor_servico,
            tomador_orgao_publico,
            tomador_exterior,
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
                        Preencha os dados da NFS-e
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Selecione UF/Município e descreva o serviço para sugerir código LC 116, CNAE e ISS.
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="UF do Prestador"
                                select
                                required
                                value={uf_prestador}
                                onChange={e => set_uf_prestador(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {ufs.map(uf => (
                                    <MenuItem key={uf.sigla} value={uf.sigla}>{uf.sigla}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Município do Prestador"
                                select
                                required
                                value={municipio_prestador}
                                onChange={e => set_municipio_prestador(e.target.value)}
                                fullWidth
                                disabled={disabled || !uf_prestador}
                            >
                                {cidadesPrestador.map(cidade => (
                                    <MenuItem key={cidade} value={cidade}>{cidade}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="UF do Tomador"
                                select
                                required
                                value={uf_tomador}
                                onChange={e => set_uf_tomador(e.target.value)}
                                fullWidth
                                disabled={disabled}
                            >
                                {ufs.map(uf => (
                                    <MenuItem key={uf.sigla} value={uf.sigla}>{uf.sigla}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Município do Tomador"
                                select
                                required
                                value={municipio_tomador}
                                onChange={e => set_municipio_tomador(e.target.value)}
                                fullWidth
                                disabled={disabled || !uf_tomador}
                            >
                                {cidadesTomador.map(cidade => (
                                    <MenuItem key={cidade} value={cidade}>{cidade}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Descrição detalhada do serviço"
                                name="descricao_servico"
                                required
                                value={descricao_servico}
                                onChange={e => set_descricao_servico(e.target.value)}
                                fullWidth
                                multiline
                                minRows={3}
                                disabled={disabled}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.6 }}>
                                Dica: inclua o que é feito, como é entregue (presencial/online), periodicidade e público-alvo.
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Valor do Serviço"
                                name="valor_servico"
                                type="text"
                                value={valor_servico}
                                onChange={e => set_valor_servico(mascaraDinheiro(e.target.value))}
                                inputProps={{ maxLength: 17 }}
                                fullWidth
                                disabled={disabled}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4} display="flex" alignItems="center">
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
                                    Tomador é órgão público?
                                </FormLabel>
                                <RadioGroup
                                    row
                                    name="tomador_orgao_publico"
                                    value={tomador_orgao_publico ? "true" : "false"}
                                    onChange={e => set_tomador_orgao_publico(e.target.value === "true")}
                                >
                                    <FormControlLabel value={"true"} control={<Radio />} label="Sim" disabled={disabled} />
                                    <FormControlLabel value={"false"} control={<Radio />} label="Não" disabled={disabled} />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4} display="flex" alignItems="center">
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
                                    Tomador é do exterior?
                                </FormLabel>
                                <RadioGroup
                                    row
                                    name="tomador_exterior"
                                    value={tomador_exterior ? "true" : "false"}
                                    onChange={e => set_tomador_exterior(e.target.value === "true")}
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
                            Ao gerar, você receberá código/aliquota/retenções sugeridas e embasamento.
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
                                    ? "0 10px 26px rgba(156,39,176,.18)"
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

export default FormNFSe;