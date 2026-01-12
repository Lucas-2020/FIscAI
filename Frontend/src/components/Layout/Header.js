import React, { useState } from "react";
import {
    AppBar, Toolbar, Box, Typography, MenuItem, Select, IconButton,
    Dialog, DialogActions, DialogTitle, Button, useMediaQuery, Tooltip,
    CircularProgress, Drawer, Stack, Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AvatarMenu from "./AvatarMenu";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { RiStarFill, RiStarLine, RiDeleteBin6Line } from "react-icons/ri";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

import api from '../../services/api';

export default function Header() {
    const { user } = useAuth();
    const { companies, selectedCompany, setSelectedCompany, removeCompany, fetchCompanies } = useCompany();
    const theme = useTheme();
    const smDown = useMediaQuery(theme.breakpoints.down("sm"));

    // Modal de remover empresa
    const [dialogOpen, setDialogOpen] = useState(false);
    const [companyToRemove, setCompanyToRemove] = useState(null);
    const [removing, setRemoving] = useState(false);

    // Drawer (mobile)
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleRemoveClick = (e, company) => {
        e.stopPropagation();
        setCompanyToRemove(company);
        setDialogOpen(true);
    };

    const handleRemoveConfirmed = async () => {
        if (companyToRemove) {
            setRemoving(true);
            const sucesso = await removeCompany(companyToRemove.id_empresa);
            setRemoving(false);
            if (sucesso) {
                setDialogOpen(false);
                setCompanyToRemove(null);
            }
        }
    };

    const defineEmpresaPadrao = async (id_empresa) => {
        const id_usuario = user?.id_usuario;
        if (!id_usuario) return;
        await api.post('/empresa/padrao', { id_usuario, id_empresa });
        if (typeof fetchCompanies === "function") fetchCompanies();
    };

    // SELECT DE EMPRESA
    const CompanySelect = (
        <Select
            value={selectedCompany?.cnpj || ""}
            size="small"
            displayEmpty
            onChange={e => {
                const cnpj = e.target.value;
                const empresa = companies.find(c => c.cnpj === cnpj);
                setSelectedCompany(empresa);
            }}
            sx={{
                minWidth: 210,
                bgcolor: "background.paper",
                borderRadius: 2
            }}
            renderValue={v => {
                if (!v) return <span>Empresa</span>;
                const emp = companies.find(c => c.cnpj === v);
                return emp ? emp.razao_social : "";
            }}
        >
            {companies.length === 0 && <MenuItem value="">Nenhuma empresa</MenuItem>}
            {companies.map(emp => (
                <MenuItem
                    key={emp.cnpj}
                    value={emp.cnpj}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        pl: 1,
                        pr: 1,
                    }}
                >
                    <Box sx={{
                        flex: 1,
                        paddingLeft: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <BusinessRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {emp.razao_social}
                        </span>
                        <span
                            style={{
                                fontSize: 13,
                                color: "#8898aa",
                                marginLeft: 8,
                                fontWeight: 500,
                                opacity: 0.75
                            }}
                        >
                            - {emp.uf}
                        </span>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
                        <Tooltip title={emp.empresa_padrao ? "Empresa padrão" : "Definir como padrão"} arrow>
                            <span>
                                <IconButton
                                    edge="end"
                                    size="small"
                                    sx={{
                                        borderRadius: "50%",
                                        "&:hover": { bgcolor: "#fffbe7" }
                                    }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        defineEmpresaPadrao(emp.id_empresa);
                                    }}
                                    disabled={emp.empresa_padrao}
                                    tabIndex={-1}
                                >
                                    {emp.empresa_padrao
                                        ? <RiStarFill style={{ color: '#ED6C02', fontSize: 20 }} />
                                        : <RiStarLine style={{ color: '#ED6C02', opacity: 0.4, fontSize: 20 }} />
                                    }
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Remover empresa" arrow>
                            <span>
                                <IconButton
                                    edge="end"
                                    size="small"
                                    sx={{
                                        color: "error.main",
                                        borderRadius: "50%",
                                        "&:hover": { bgcolor: "#ffeaea" }
                                    }}
                                    onClick={e => handleRemoveClick(e, emp)}
                                    tabIndex={-1}
                                >
                                    <RiDeleteBin6Line fontSize="large" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                </MenuItem>
            ))}

            <Divider variant="middle" />

            <Typography
                variant="caption"
                sx={{
                    display: "block",
                    mt: 2,
                    color: theme => theme.palette.text.secondary,
                    textAlign: "center",
                    maxWidth: 600,
                    width: "80%",
                    mx: "auto",
                    fontSize: 13,
                    lineHeight: 1.6,
                }}
            >
                <strong>Obs.:</strong> O <b>UF</b> e o <b>Regime Tributário</b> usados na sugestão serão sempre os da empresa selecionada acima.
            </Typography>
        </Select>
    );

    // ========== DESKTOP ==========
    if (!smDown) {
        return (
            <>
                <AppBar
                    position="static"
                    elevation={0}
                    color="inherit"
                    sx={{
                        borderRadius: "0 0 22px 22px",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        background:
                            theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(25,118,210,.22), rgba(0,0,0,0) 55%)"
                                : "linear-gradient(135deg, rgba(25,118,210,.12), rgba(255,255,255,0) 55%)",
                    }}
                >
                    <Toolbar sx={{ justifyContent: "space-between", minHeight: 68, px: { xs: 1.5, sm: 3 } }}>
                        {/* Esquerda: marca + contexto */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 220 }}>
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 3,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: theme.palette.primary.main,
                                    color: "#fff",
                                    boxShadow: theme.palette.mode === "dark"
                                        ? "0 10px 24px rgba(25,118,210,.20)"
                                        : "0 10px 24px rgba(25,118,210,.18)",
                                    fontWeight: 900,
                                    letterSpacing: 0.4,
                                }}
                            >
                                AI
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 900,
                                        lineHeight: 1.05,
                                        color: "text.primary",
                                    }}
                                >
                                    FiscAI
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        color: "text.secondary",
                                        mt: 0.2,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 280,
                                    }}
                                >
                                    Sugestões fiscais para NF-e e NFS-e
                                </Typography>
                            </Box>
                        </Box>

                        {/* Centro: seletor de empresa em “pill” */}
                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                px: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: "min(520px, 100%)",
                                    p: 0.6,
                                    borderRadius: 999,
                                    backdropFilter: "blur(10px)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <BusinessRoundedIcon sx={{ color: "text.secondary", ml: 1 }} fontSize="small" />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    {CompanySelect}
                                </Box>
                            </Box>
                        </Box>

                        {/* Direita: ações */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 220, justifyContent: "flex-end" }}>
                            <ThemeToggle />
                            <AvatarMenu />
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Dialog de confirmação de remoção */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => !removing && setDialogOpen(false)}
                    PaperProps={{ sx: { p: 1, minWidth: 500, borderRadius: 4 } }}
                >
                    <DialogTitle sx={{ fontWeight: 900 }}>
                        Deseja realmente remover esta empresa?
                    </DialogTitle>
                    <DialogActions sx={{ px: 2, pb: 1.5 }}>
                        <Button onClick={() => setDialogOpen(false)} color="primary" variant="outlined" disabled={removing} sx={{ borderRadius: 3, fontWeight: 800 }}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRemoveConfirmed}
                            color="error"
                            variant="contained"
                            sx={{
                                borderRadius: 3,
                                fontWeight: 900,
                                position: "relative",
                                "&.Mui-disabled": {
                                    backgroundColor: "rgba(160,160,160,0.6)",
                                    color: "#fff",
                                    cursor: "not-allowed",
                                },
                            }}
                            disabled={removing}
                        >
                            {removing && (
                                <CircularProgress size={20} sx={{ color: "white", position: "absolute", left: 16 }} />
                            )}
                            <span style={{ marginLeft: removing ? 24 : 0 }}>
                                {removing ? "Removendo..." : "Remover"}
                            </span>
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );

    }

    // ========== MOBILE ==========
    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                color="inherit"
                sx={{
                    borderRadius: "0 0 22px 22px",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    background:
                        theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, rgba(25,118,210,.22), rgba(0,0,0,0) 60%)"
                            : "linear-gradient(135deg, rgba(25,118,210,.12), rgba(255,255,255,0) 60%)",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between", minHeight: 56, px: 1.25 }}>
                    {/* Marca compacta */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 3,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: theme.palette.primary.main,
                                color: "#fff",
                                fontWeight: 900,
                                letterSpacing: 0.3,
                            }}
                        >
                            AI
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1 }}>
                                FiscAI
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.2 }}>
                                Sugestões fiscais
                            </Typography>
                        </Box>
                    </Box>

                    {/* Ações */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ThemeToggle small />
                        <IconButton
                            onClick={() => setDrawerOpen(true)}
                            edge="end"
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                ml: 0.5,
                                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.75)",
                            }}
                        >
                            <MenuIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                        <AvatarMenu small />
                    </Box>
                </Toolbar>

                {/* “faixa” do seletor abaixo do toolbar */}

            </AppBar>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        pt: 1,
                        pb: 2,
                        px: 0,
                        background: theme.palette.background.default,
                    },
                }}
            >
                <Box sx={{ width: "90%", maxWidth: 420, mx: "auto", position: "relative" }}>
                    <IconButton
                        onClick={() => setDrawerOpen(false)}
                        sx={{ position: "absolute", top: 6, right: 0, zIndex: 1 }}
                    >
                        <CloseIcon fontSize="medium" />
                    </IconButton>

                    <Box sx={{ pt: 1.5, pb: 1, pr: 5 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
                            Configurações rápidas
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Selecione a empresa para base fiscal das sugestões.
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2} alignItems="center" sx={{ width: "100%", pb: 2 }}>
                        <Box sx={{ width: "100%" }}>{CompanySelect}</Box>
                    </Stack>
                </Box>
            </Drawer>

            <Dialog
                open={dialogOpen}
                onClose={() => !removing && setDialogOpen(false)}
                PaperProps={{ sx: { p: 1, minWidth: 300, maxWidth: "90%", borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>
                    Deseja realmente remover esta empresa?
                </DialogTitle>
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    <Button onClick={() => setDialogOpen(false)} color="primary" variant="outlined" disabled={removing} sx={{ borderRadius: 3, fontWeight: 800 }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleRemoveConfirmed}
                        color="error"
                        variant="contained"
                        sx={{
                            borderRadius: 3,
                            fontWeight: 900,
                            position: "relative",
                            "&.Mui-disabled": {
                                backgroundColor: "rgba(160,160,160,0.6)",
                                color: "#fff",
                                cursor: "not-allowed",
                            },
                        }}
                        disabled={removing}
                    >
                        {removing && (
                            <CircularProgress size={20} sx={{ color: "white", position: "absolute", left: 16 }} />
                        )}
                        <span style={{ marginLeft: removing ? 24 : 0 }}>
                            {removing ? "Removendo..." : "Remover"}
                        </span>
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

}