import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useSnackbar } from "./SnackbarContext";
import { useAuth } from "./AuthContext";

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
    const { user, loading: userLoading } = useAuth();

    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();

    // Busca empresas ao montar o contexto
    useEffect(() => {
        // Só busca empresas se já terminou de carregar usuário e tem user
        if (!userLoading && user?.id_usuario) {
            fetchCompanies();
        } else if (!userLoading && !user) {
            setCompanies([]);
            setSelectedCompany(null);
        }
        // eslint-disable-next-line
    }, [user, userLoading]);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        const id_usuario = user?.id_usuario;
        if (!id_usuario) {
            setCompanies([]);
            setSelectedCompany(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/empresa/read");
            setCompanies(response.data);

            // Seleciona a empresa padrão, se houver
            const padrao = response.data.find(e => e.empresa_padrao === true);
            if (padrao) {
                setSelectedCompany(padrao);
            } else if (response.data.length > 0) {
                setSelectedCompany(response.data[0]);
            } else {
                setSelectedCompany(null);
            }
        } catch (err) {
            setCompanies([]);
            setSelectedCompany(null);
            showSnackbar("Erro ao buscar empresas.", "error");
        }
        setLoading(false);
    }, [showSnackbar, user?.id_usuario]);

    const addCompany = async (companyData) => {
        const { cnpj, razao_social, uf, regime_tributario, empresa_padrao, skipApi } = companyData;
        if (!cnpj || !razao_social || !uf || !regime_tributario) {
            showSnackbar("Preencha todos os campos.", "warning");
            return false;
        }

        if (skipApi) return false;

        const id_usuario = user?.id_usuario;
        if (!id_usuario) {
            showSnackbar("Usuário não autenticado.", "error");
            return false;
        }

        setLoading(true);
        try {
            const response = await api.post('/empresa/create', {
                id_usuario, cnpj, razao_social, uf, regime_tributario, empresa_padrao
            });
            if (response.data.status === true) {
                showSnackbar("Empresa cadastrada com sucesso!", "success");
                await fetchCompanies();
                setLoading(false);
                return true;
            } else {
                showSnackbar("Empresa já cadastrada para esse CNPJ/UF.", "error");
            }
        } catch (err) {
            showSnackbar("Erro ao cadastrar empresa.", "error");
        }
        setLoading(false);
        return false;
    };

    const removeCompany = async (id_empresa) => {
        const id_usuario = user?.id_usuario;
        if (!id_usuario) {
            showSnackbar("Usuário não autenticado.", "error");
            return false;
        }
        try {
            // O backend espera no corpo: { id_empresa }
            const response = await api.delete("/empresa/inactive", { data: { id_empresa } });

            if (response.data.status === true) {
                showSnackbar("Empresa removida com sucesso!", "success");
                await fetchCompanies();
                return true;
            } else {
                showSnackbar("Erro ao remover empresa.", "error");
            }
        } catch (err) {
            showSnackbar("Erro ao remover empresa.", "error");
        }
        return false;
    };


    return (
        <CompanyContext.Provider
            value={{
                companies,
                selectedCompany,
                setSelectedCompany,
                addCompany,
                removeCompany,
                fetchCompanies,
                loading,
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    return useContext(CompanyContext);
}
