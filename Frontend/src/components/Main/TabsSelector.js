import React, { useEffect } from "react";
import { Tabs, Tab, Tooltip, useMediaQuery } from "@mui/material";
import { MdReceipt, MdReceiptLong } from "react-icons/md";
import { useCompany } from "../../contexts/CompanyContext";

/*const tabs = [
    { label: "NF-e", value: "nfe", icon: <MdReceipt /> },
    { label: "NFS-e", value: "nfse", icon: <MdReceiptLong /> },
];*/

export default function TabsSelector({ tab, setTab }) {
    const { selectedCompany } = useCompany();
    const isMEI = selectedCompany?.regime_tributario === "MEI";

    // Responsividade
    const responsiveGrid = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    // Troca para NFS-e automaticamente se selecionou empresa MEI e estava na aba NF-e
    useEffect(() => {
        if (isMEI && tab === "nfe") setTab("nfse");
    }, [isMEI, tab, setTab]);

    return (
        <Tabs
            value={tab}
            onChange={(_, v) => {
                if (isMEI && v === "nfe") return;
                setTab(v);
            }}
            textColor="primary"
            indicatorColor="primary"
            sx={{
                minHeight: 44,
                p: 0.5,
                borderRadius: 999,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)",
                backdropFilter: "blur(10px)",
                "& .MuiTabs-indicator": { height: 3, borderRadius: 999 },
                "& .MuiTab-root": {
                    minHeight: 40,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2,
                },
            }}
        >
            <Tab
                key="nfe"
                label={
                    isMEI ? (
                        <Tooltip title="Somente NFS-e é permitida para empresas MEI">
                            <span
                                style={{
                                    cursor: "not-allowed",
                                    opacity: 0.55,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                NF-e
                            </span>
                        </Tooltip>
                    ) : (
                        "NF-e"
                    )
                }
                icon={<MdReceipt />}
                iconPosition="start"
                value="nfe"
                disabled={isMEI}
                sx={{
                    fontSize: responsiveGrid ? 14 : 15,
                    ...(isMEI && {
                        pointerEvents: "auto !important",
                        cursor: "not-allowed !important",
                    }),
                }}
            />
            <Tab
                key="nfse"
                label="NFS-e"
                icon={<MdReceiptLong />}
                iconPosition="start"
                value="nfse"
                sx={{ fontSize: responsiveGrid ? 14 : 15 }}
            />
        </Tabs>
    );

}