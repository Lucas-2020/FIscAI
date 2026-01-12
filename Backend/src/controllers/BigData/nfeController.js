require('dotenv').config();

const connection = require('../../Database/connection');

module.exports = {

    /**
     * Insere sugestão de NF-e feita com IA na base de dados
     */
    async cria(request, response) {

        const {
            id_usuario,
            id_empresa,
            regime_empresa,
            uf_emitente,
            uf_destinatario,
            tipo_operacao,
            natureza_operacao,
            finalidade,
            produto,
            regime_produto,
            industrializado,
            retorno_completo
        } = request.body;


        var ano = new Date().getFullYear();

        var idSugestao = await connection('sugestao_nfe')
            .insert({
                id_usuario,
                id_empresa,
                regime_empresa,
                uf_emitente,
                uf_destinatario,
                tipo_operacao,
                natureza_operacao,
                finalidade,
                produto,
                regime_produto,
                industrializado,
                retorno_completo: JSON.stringify(retorno_completo),
                ano
            })
            .returning(['id_sugestao_nfe']);

        return response.json({ id: idSugestao[0].id_sugestao_nfe });
    },

    /**
     * Busca uma sugestão pelo dados de entrada
     */
    async mostraPorEntrada(request, response) {
        const { regime_empresa, uf_emitente, uf_destinatario, tipo_operacao, natureza_operacao, finalidade, produto, regime_produto, industrializado } = request.body;

        const sugestao = await connection('sugestao_nfe')
            .select('retorno_completo')
            .where({
                regime_empresa,
                uf_emitente,
                uf_destinatario,
                tipo_operacao,
                natureza_operacao,
                finalidade,
                regime_produto,
                industrializado
            })
            .whereILike('produto', `%${produto}%`)
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

        var sugestoes = await connection('sugestao_nfe')
            .select('*')
            .where('id_usuario', id_usuario)
            .orderBy('id_sugestao_nfe', 'desc');

        return response.json(sugestoes);
    },

    /**
     * Traz sugestão compartilhada (por id)
     */
    async compartilhar(request, response) {
        const id_sugestao_nfe = request.auth.id_usuario;

        var sugestao = await connection('sugestao_nfe')
            .select('retorno_completo')
            .where('id_sugestao_nfe', id_sugestao_nfe)
            .first();

        return response.json(sugestao.retorno_completo);
    },

};
