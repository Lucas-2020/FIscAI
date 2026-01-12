require('dotenv').config();

const connection = require('../../Database/connection');
const jwt = require("jsonwebtoken");

const funcoes = require('../Funcoes/funcoes');

function signAccess(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}
function signRefresh(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

module.exports = {

    /**
     * Cadastra Usuário
     */
    async create(request, response) {
        const { nome, email, cpf_cnpj, senha } = request.body;
        const senha_encrypt = funcoes.encrypt(senha);

        // Checa se o usuário já existe
        const checaConta = await connection('usuarios')
            .where('email', email)
            .first();

        if (!checaConta) {
            // Cria usuário
            const [novoUsuario] = await connection('usuarios')
                .insert({
                    nome,
                    email,
                    cpf_cnpj,
                    senha: senha_encrypt,
                })
                .returning(['id_usuario', 'nome', 'email']);

            return response.json({
                status: true,
                id_usuario: novoUsuario.id_usuario,
                nome: novoUsuario.nome,
                email: novoUsuario.email
            });

        } else {
            return response.json({ status: false, error: 'Usuário já existe.' });
        }
    },

    /**
     * Faz o Login
     */
    async login(request, response) {
        const { email, senha } = request.body;

        if (!email || !senha) {
            return response.status(400).json({ status: false, message: "missing_credentials" });
        }

        const senha_encrypt = funcoes.encrypt(senha);

        const user = await connection("usuarios")
            .select("id_usuario", "nome", "cpf_cnpj", "email")
            .where({ email, senha: senha_encrypt })
            .first();

        if (!user) {

            const existeEmail = await connection("usuarios").where({ email }).first();
            return response.json({
                status: false,
                message: existeEmail ? "negativo_senha" : "negativo_email",
            });
        }

        const payload = { id_usuario: user.id_usuario };

        const refreshToken = signRefresh(payload);
        response.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return response.json({
            status: true,
            user,
            accessToken: signAccess(payload),
        });
    },

    /**
     * Traz todos os dados do Usuário pelo ID
     */
    async read(request, response) {

        const id_usuario = Number(request.auth.id_usuario);

        const id_usuario_int = Number(id_usuario);

        var dados = await connection('usuarios')
            .select('*')
            .where('id_usuario', id_usuario_int)
            .first();

        return response.json(dados);

    },

    /**
     * Altera dados do usuário
     */
    async update(request, response) {

        var { id_usuario, nome, cpf_cnpj, senha } = request.body;

        if (senha == null || senha == undefined || senha == '') {
            await connection('usuarios')
                .update({
                    nome,
                    cpf_cnpj
                })
                .where('id_usuario', id_usuario)
                .then(() => {
                    return response.json({ status: true });
                }).catch(() => {
                    return response.json({ status: false });
                })
        } else {

            const senha_encrypt = funcoes.encrypt(senha);

            await connection('usuarios')
                .update({
                    nome,
                    cpf_cnpj,
                    senha: senha_encrypt
                })
                .where('id_usuario', id_usuario)
                .then(() => {
                    return response.json({ status: true });
                }).catch(() => {
                    return response.json({ status: false });
                })

        }



    }

};