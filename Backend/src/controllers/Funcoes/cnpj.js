const axios = require('axios');
const NodeCache = require('node-cache');
const cnpjCache = new NodeCache({ stdTTL: 60 * 60 }); // 1 hora de cache

module.exports = {

    /**
     * Consulta dados de um CNPJ via ReceitaWS, com cache em memória.
     */
    async consultaCNPJ(request, response) {
        const { cnpj } = request.body;

        if (!cnpj)
            return response.status(400).json({ erro: "CNPJ obrigatório." });

        const cnpjLimpo = String(cnpj).replace(/\D/g, '');

        // Tenta pegar do cache
        const cached = cnpjCache.get(cnpjLimpo);
        if (cached) {
            return response.json({ ...cached, _fromCache: true });
        }

        try {
            const { data } = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
            cnpjCache.set(cnpjLimpo, data);
            return response.json(data);
        } catch (error) {
            if (error.response && error.response.status === 429) {
                return response.status(429).json({ erro: 'Limite de consultas atingido na ReceitaWS.' });
            }
            return response.status(500).json({ erro: 'Erro ao consultar ReceitaWS.' });
        }
    }

};