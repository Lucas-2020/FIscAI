require('dotenv').config();

const connection = require('../../Database/connection');

const funcoes = require('../Funcoes/funcoes');

module.exports = {

    /**
     * Insere sugestão de NFS-e feita com IA na base de dados
     */
    async cria(request, response) {

        const {
            id_usuario,
            id_empresa,
            regime_empresa,
            uf_prestador,
            municipio_prestador,
            uf_tomador,
            municipio_tomador,
            descricao_servico,
            valor_servico,
            tomador_orgao_publico,
            tomador_exterior,
            retorno_completo
        } = request.body;


        var ano = new Date().getFullYear();

        var idSugestao = await connection('sugestao_nfse')
            .insert({
                id_usuario,
                id_empresa,
                regime_empresa,
                uf_prestador,
                municipio_prestador,
                uf_tomador,
                municipio_tomador,
                descricao_servico,
                valor_servico: funcoes.parseValor(valor_servico),
                tomador_orgao_publico,
                tomador_exterior,
                retorno_completo: JSON.stringify(retorno_completo),
                ano
            })
            .returning(['id_sugestao_nfse']);

        return response.json({ id: idSugestao[0].id_sugestao_nfse });
    },

    /**
     * Busca uma sugestão pelo dados de entrada
     */
    async mostraPorEntrada(request, response) {
        const { regime_empresa, uf_prestador, municipio_prestador, uf_tomador, municipio_tomador, descricao_servico, valor_servico, tomador_orgao_publico, tomador_exterior } = request.body;

        const sugestao = await connection('sugestao_nfse')
            .select('retorno_completo')
            .where({
                regime_empresa,
                uf_prestador,
                municipio_prestador,
                uf_tomador,
                municipio_tomador,
                valor_servico: funcoes.parseValor(valor_servico),
                tomador_orgao_publico,
                tomador_exterior
            })
            .whereILike('descricao_servico', `%${descricao_servico}%`)
            .first();

        if (sugestao && sugestao.retorno_completo) {
            let retorno = sugestao.retorno_completo;
            try {
                retorno = typeof retorno === 'string' ? JSON.parse(retorno) : retorno;
            } catch { }
            return response.json(retorno);
        } else {
            return response.json({});
        }
    },

    /**
     * Traz todas as sugestões feitas por um usuário
     */
    async mostraUsuario(request, response) {

        const id_usuario = request.auth.id_usuario;

        var sugestoes = await connection('sugestao_nfse')
            .select('*')
            .where('id_usuario', id_usuario)
            .orderBy('id_sugestao_nfse', 'desc');

        return response.json(sugestoes);
    },

    /**
     * Traz sugestão compartilhada (por id)
     */
    async compartilhar(request, response) {
        const id_sugestao_nfse = request.auth.id_usuario;

        var sugestao = await connection('sugestao_nfse')
            .select('retorno_completo')
            .where('id_sugestao_nfse', id_sugestao_nfse)
            .first();

        return response.json(sugestao.retorno_completo);
    },

};
