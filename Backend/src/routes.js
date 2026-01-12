const express = require('express');
const auth = require("./middlewares/auth");

// Chamadas aos Controllers da aplicação
const usuario = require('./controllers/Acesso/usuarioController');
const empresa = require('./controllers/Empresa/empresaController');
const llms = require('./controllers/LLMs/fiscaiController');
const bigDataNFe = require('./controllers/BigData/nfeController');
const bigDataNFSe = require('./controllers/BigData/nfseController');

const cnpj = require('./controllers/Funcoes/cnpj');

const routes = express.Router();

//Rotas do Usuário
routes.post('/usuario/create', usuario.create);
routes.post('/usuario/login', usuario.login);
routes.get('/usuario/read', auth, usuario.read);
routes.put('/usuario/update', auth, usuario.update);

// Rota para pegar dados pelo CNPJ
routes.post('/consulta/cnpj', cnpj.consultaCNPJ);

//Rotas da Empresa
routes.post('/empresa/create', auth, empresa.create);
routes.get('/empresa/read', auth, empresa.read);
routes.put('/empresa/update', auth, empresa.update);
routes.delete('/empresa/inactive', auth, empresa.inactive);
routes.post('/empresa/padrao', auth, empresa.padrao);

//Rotas do LLMs
routes.post('/llms/nfe', llms.sugereNFe);
routes.post('/llms/nfse', llms.sugereNFSe);

//Rotas do armazenamento das sugestões da NF-e
routes.post('/bigdata/nfe/cria', auth, bigDataNFe.cria);
routes.post('/bigdata/nfe/mostra/entrada', auth, bigDataNFe.mostraPorEntrada);
routes.get('/bigdata/nfe/mostra/usuario', auth, bigDataNFe.mostraUsuario);
routes.get('/bigdata/nfe/compartilhar', auth, bigDataNFe.compartilhar);

//Rotas do armazenamento das sugestões da NFS-e
routes.post('/bigdata/nfse/cria', auth, bigDataNFSe.cria);
routes.post('/bigdata/nfse/mostra/entrada', auth, bigDataNFSe.mostraPorEntrada);
routes.get('/bigdata/nfse/mostra/usuario', auth, bigDataNFSe.mostraUsuario);
routes.get('/bigdata/nfse/compartilhar', auth, bigDataNFSe.compartilhar);

module.exports = routes;