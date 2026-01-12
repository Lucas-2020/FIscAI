const moment = require('moment');
const crypto = require('crypto');

module.exports = {

    /**
     * Convert um valor moeda em valor decimal para o banco de dados
     */
    parseValor: function (valor) {
        if (typeof valor === "number") return valor;
        if (!valor) return 0;
        // Remove pontos dos milhares, troca vírgula por ponto
        return parseFloat(
            valor.replace(/\./g, '').replace(',', '.')
        );
    },

    /**
     * Remove todos os acentos de uma string.
     */
    removerAcentos: function (str) {
        return str
            .normalize('NFD') // Decompõe caracteres acentuados em partes base + acento
            .replace(/[\u0300-\u036f]/g, '') // Remove marcas de acento
            .replace(/ç/gi, 'c'); // Substitui Ç/ç por c
    },

    //----------------------------------------------------------------------------------------------------------//

    /**
     * Remove todos os caracteres especiais de uma string.
     */
    removeCaracteres: function (str) {
        return str.replace(/\D/g, "");
    },

    //----------------------------------------------------------------------------------------------------------//

    // Função auxiliar para verificar se o retorno é JSON válido
    parseJsonSafe: function (str) {
        try {
            return { json: JSON.parse(str), error: null };
        } catch (e) {
            return { json: null, error: e };
        }
    },

    //----------------------------------------------------------------------------------------------------------//

    /**
     * Converte data BR para Americana
     */
    dtConvertEUA: function (dt) {

        const dataBR = moment(dt, 'DD/MM/YYYY');
        const dataEUA = dataBR.format('YYYY-MM-DD');

        return dataEUA;

    },

    //----------------------------------------------------------------------------------------------------------//

    /**
     * Converte data Americana para BR
     */
    dtConvertBR: function (dt) {

        const dataEUA = moment(dt, 'YYYY-MM-DD');
        const dataBR = dataEUA.format('DD/MM/YY');

        return dataBR;

    },

    //---------------------------------------------------------------------------------------------------------//

    /**
     * Criptografa Senha
     */
    encrypt: function (val) {

        const random = process.env.RANDOM_KEY;
        const iv = process.env.IV_KEY;

        let cipher = crypto.createCipheriv('aes-256-cbc', random, iv);
        let encrypted = cipher.update(val, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    },

    /**
     * Descriptografa Senha
     */
    decrypt: function (val) {

        const random = process.env.RANDOM_KEY;
        const iv = process.env.IV_KEY;

        let decipher = crypto.createDecipheriv('aes-256-cbc', random, iv);
        let decrypted = decipher.update(val, 'base64', 'utf8');
        return (decrypted + decipher.final('utf8'));
    },

    //---------------------------------------------------------------------------------------------------------//

    /**
     * Pega a primeira letra de cada palavra da string e converte em maiúscula
     */

    firstWord: function (str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }


};