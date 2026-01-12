import React, { useState } from "react";
import {
    IconButton, Avatar, Menu, MenuItem, Divider, ListItemIcon, ListItemText
} from "@mui/material";
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CompanyDialog from "../Company/CompanyDialog";
import EditAccountDialog from "../User/EditAccountDialog";
import SugestDialog from "../Sugests/SugestDialog";
import { FetchSugestUser } from "../Sugests/FetchSugestUser";

export default function AvatarMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openCompany, setOpenCompany] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openSugestoes, setOpenSugestoes] = useState(false);

    const { user, signOut } = useAuth();

    const navigate = useNavigate();

    const handleCadastrarEmpresa = () => {
        setOpenCompany(true);
    };

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleMinhasSugestoes = () => {
        setOpenSugestoes(true);
        handleClose();
    };

    const fetchSugestoes = () => FetchSugestUser(user?.id_usuario);

    return (
        <>
            <IconButton size="large" onClick={handleMenu}>
                <Avatar sx={{ bgcolor: "#bdbdbd" }}>
                    {user?.nome?.[0]?.toUpperCase() || "U"}
                </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} sx={{ mt: 1 }}>
                <MenuItem
                    onClick={() => {
                        handleClose();
                        handleCadastrarEmpresa();
                    }}
                >
                    <ListItemIcon>
                        <BusinessRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <span>
                        <ListItemText>
                            Cadastrar Empresa
                        </ListItemText>
                    </span>
                </MenuItem>
                <MenuItem onClick={handleMinhasSugestoes}>
                    <ListItemIcon>
                        <AssignmentRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Minhas Sugestões</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); setOpenEdit(true); }}>
                    <ListItemIcon>
                        <EditNoteRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Editar Conta</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleClose(); signOut(); navigate("/"); }}>
                    <ListItemIcon>
                        <LogoutRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Sair</ListItemText>
                </MenuItem>
            </Menu>
            <CompanyDialog open={openCompany} onClose={() => setOpenCompany(false)} />
            <EditAccountDialog open={openEdit} onClose={() => setOpenEdit(false)} />
            <SugestDialog open={openSugestoes} onClose={() => setOpenSugestoes(false)} fetchSugestoes={fetchSugestoes} />

        </>
    );
}