import api from '../../services/api';

/**
 * Busca sugestões de NFe e NFSe do usuário logado
 */
export async function FetchSugestUser(id_usuario) {
    if (!id_usuario) return [];

    // Busca NFe
    const [respNFe, respNFSe] = await Promise.all([
        api.get('/bigdata/nfe/mostra/usuario'),
        api.get('/bigdata/nfse/mostra/usuario')
    ]);

    // NFe
    const sugestoesNFe = (respNFe.data || []).map((s, i) => ({
        id_sugestao_nfe: s.id_sugestao_nfe || i,
        descricao_produto: s.produto || "-",
        uf_emitente: s.uf_emitente || "-",
        uf_destinatario: s.uf_destinatario || "-",
        tipo_operacao: s.tipo_operacao || "-",
        natureza_operacao: s.natureza_operacao || "-",
        finalidade: s.finalidade || "-",
        regime_empresa: s.regime_empresa || "-",
        regime_produto: s.regime_produto || "-",
        industrializado: typeof s.industrializado === "boolean" ? (s.industrializado ? "Sim" : "Não") : "-",
        retorno_completo: s.retorno_completo || {},
        tipo_sugestao: "nfe",
        data_criacao: s.data_criacao || null
    }));

    // NFSe
    const sugestoesNFSe = (respNFSe.data || []).map((s, i) => ({
        id_sugestao_nfse: s.id_sugestao_nfse || i,
        descricao_servico: s.descricao_servico || "-",
        municipio_prestador: s.municipio_prestador || "-",
        municipio_tomador: s.municipio_tomador || "-",
        regime_empresa: s.regime_empresa || "-",
        valor_servico: s.valor_servico || "-",
        tomador_orgao_publico: typeof s.tomador_orgao_publico === "boolean" ? (s.tomador_orgao_publico ? "Sim" : "Não") : "-",
        tomador_exterior: typeof s.tomador_exterior === "boolean" ? (s.tomador_exterior ? "Sim" : "Não") : "-",
        retorno_completo: typeof s.retorno_completo === "string" ? (JSON.parse(s.retorno_completo) || {}) : (s.retorno_completo || {}),
        tipo_sugestao: "nfse",
        data_criacao: s.data_criacao || null
    }));

    // Junta tudo
    return [...sugestoesNFe, ...sugestoesNFSe];
}