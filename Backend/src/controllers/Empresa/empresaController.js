require('dotenv').config();

const connection = require('../../Database/connection');

module.exports = {

    /**
     * Cadastra Empresa
     */
    async create(request, response) {

        const { id_usuario, cnpj, razao_social, uf, regime_tributario, empresa_padrao } = request.body;

        const checaEmpresa = await connection('empresas')
            .where('id_usuario', id_usuario)
            .where('cnpj', cnpj)
            .where('uf', uf)
            .where('status', true)
            .first();

        if (!checaEmpresa) {

            await connection('empresas').insert({
                id_usuario,
                cnpj,
                razao_social,
                uf,
                regime_tributario,
                empresa_padrao
            })

            return response.json({ status: true });

        } else {

            return response.json({ status: false });

        }

    },

    /**
     * Traz empresas pelo ID do Usuário
     */
    async read(request, response) {

        const id_usuario = request.auth.id_usuario;

        var dados = await connection('empresas')
            .select('*')
            .where('id_usuario', id_usuario)
            .where('status', 1)
            .orderBy('razao_social');

        return response.json(dados);

    },

    /**
     * Altera dados da empresa
     */
    async update(request, response) {

        var { id_empresa, razao_social, uf, regime_tributario } = request.body;

        await connection('empresas')
            .update({
                razao_social,
                uf,
                regime_tributario,
            })
            .where('id_empresa', id_empresa)
            .where('cnpj', cnpj)
            .then(() => {
                return response.json({ status: true });
            }).catch(() => {
                return response.json({ status: false });
            })

    },

    /**
     * Inativa uma empresa
     */
    async inactive(request, response) {

        var { id_empresa } = request.body;

        await connection('empresas')
            .update('status', false)
            .where('id_empresa', id_empresa)
            .then(() => {
                return response.json({ status: true });
            }).catch(() => {
                return response.json({ status: false });
            })

    },

    /**
     * Define empresa como padrão
     */
    async padrao(request, response) {
        const { id_usuario, id_empresa } = request.body;

        if (!id_usuario || !id_empresa)
            return response.status(400).json({ erro: "Usuário e empresa obrigatórios." });

        // 1. Zera todos para o usuário
        await connection('empresas')
            .where('id_usuario', id_usuario)
            .update('empresa_padrao', false);

        // 2. Marca apenas a escolhida
        await connection('empresas')
            .where('id_usuario', id_usuario)
            .andWhere('id_empresa', id_empresa)
            .update('empresa_padrao', true);

        return response.json({ status: true });
    }
};