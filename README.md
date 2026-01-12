📄 SaaS – Geração Automatizada de Documentos com IA (Portfólio)

📌 Sobre o Projeto

Este projeto é um SaaS desenvolvido para fins de portfólio, com o objetivo de demonstrar habilidades técnicas em Backend (Node.js), Frontend (React.js + MUI Material), APIs REST, autenticação, criptografia, integração com IA (OpenAI) e boas práticas de arquitetura.

A aplicação atua como um assistente fiscal, auxiliando na sugestão de dados fiscais para emissões de NFe e NFCe, como:

• Natureza da operação

• CFOP

• CST / CSOSN

• Informações complementares

• Enquadramentos fiscais sugeridos


Essas sugestões são geradas com apoio de Inteligência Artificial, a partir de dados informados pelo usuário, criando assim uma base de sugestões que podem ser utilizadas em novas pesquisas que já tenham sido feitas por qualquer usuário dentro da plataforma, evitando chamadas repetitivas ao LLM's.

⚠️ Aviso Importante

Este projeto não possui finalidade comercial, contábil ou legal.
As informações geradas pela IA não são garantidas como corretas, válidas ou atualizadas, não substituem um contador e não devem ser utilizadas em produção real.
O objetivo é exclusivamente técnico e demonstrativo.

-------------------------------------------//-------------------------------------------

🎯 Objetivo do Projeto

• Demonstrar domínio em Node.js + React.js

• Aplicar integração prática com OpenAI API

• Implementar autenticação segura com JWT

• Trabalhar com criptografia de dados sensíveis

• Criar uma base sólida de SaaS moderno

• Servir como projeto de portfólio para testes técnicos


🧠 Funcionalidades Principais

• Cadastro e autenticação de usuários

• Login com controle de sessão (JWT)

• Sugestão inteligente de dados fiscais para NFe/NFCe

• Integração com IA (OpenAI)

• Interface moderna, responsiva e intuitiva

• Separação clara entre frontend e backend

• Comunicação via API REST

-------------------------------------------//-------------------------------------------

🧱 Tecnologias Utilizadas

🔧 Backend

• Node.js

• Express

• PostgreSQL

• JWT (Access Token e Refresh Token)

• Criptografia simétrica (AES)

• Integração com OpenAI API

• Arquitetura REST

• Variáveis de ambiente (.env)

• Yarn


🎨 Frontend

• React.js

• Material UI (MUI)

• React Router

• Context API (AuthContext)

• Consumo de API REST

• Yarn

-------------------------------------------//-------------------------------------------

🗂️ Arquitetura Geral

Frontend (React + MUI)
   ↓
API REST
   ↓
Backend (Node.js + Express)
   ↓
PostgreSQL
   ↓
OpenAI API


⚙️ Variáveis de Ambiente

📦 Backend (.env) 👇

DB_HOST=localhost

DB_PORT=5432

DB_USER=postgres

DB_PASS=postgre

DB_TABLE=fiscai

RANDOM_KEY={TOKEN_UNICO}

IV_KEY={TOKEN_UNICO}

OPENAI_API_KEY={CHAVE_API_OPENAI}

FRONTEND_URL=http://localhost:3000

JWT_ACCESS_SECRET={TOKEN_UNICO}

JWT_REFRESH_SECRET={TOKEN_UNICO}

NODE_ENV=development


🔹 Observações importantes

• RANDOM_KEY e IV_KEY são usadas para criptografia

• OPENAI_API_KEY é obrigatória para a IA funcionar

• Tokens devem ser strings seguras

• FRONTEND_URL controla CORS


🎨 Frontend (.env) 👇

REACT_APP_API_URL=http://localhost:3333

REACT_APP_KEY_CRYPTO={RANDOM_KEY_PRESENTE_NO_BACKEND}

🔹 Observações importantes

• REACT_APP_KEY_CRYPTO deve ser a mesma RANDOM_KEY do backend

• Toda variável do React precisa do prefixo REACT_APP_

-------------------------------------------//-------------------------------------------

▶️ Como Rodar o Projeto Localmente

📦 Pré-requisitos

• Node.js (>= 18)

• Yarn

• PostgreSQL

• Chave válida da OpenAI

-------------------------------------------//-------------------------------------------

🗄️ Criação do Banco de Dados e Migrations

Antes de rodar o backend, é necessário criar o banco de dados no PostgreSQL.  
As migrations não criam o banco, elas apenas criam as tabelas dentro de um banco já existente.

1️⃣ Criar o banco `fiscai`

Acesse o PostgreSQL (psql, PgAdmin ou outro cliente) e execute o comando abaixo:

SQL 👇

`CREATE DATABASE fiscai`;

Garanta que o nome do banco seja o mesmo configurado no arquivo .env do backend:

DB_TABLE=fiscai

-------------------------------------------

2️⃣ Rodar as migrations

Com o banco criado, execute as migrations para criar todas as tabelas da aplicação: 👇

cd backend

npx knex migrate:latest

Esse comando irá:

• criar todas as tabelas necessárias (usuarios, empresas, sugestao_nfe, sugestao_nfse)

• criar índices, chaves estrangeiras e constraints

• preparar o banco para uso do sistema

-------------------------------------------//-------------------------------------------

🔧 Backend

cd backend
yarn install
yarn dev

📍 Backend disponível em:

http://localhost:3333


🎨 Frontend

cd frontend
yarn install
yarn start

📍 Frontend disponível em:

http://localhost:3000

-------------------------------------------//-------------------------------------------

🔐 Autenticação e Segurança

• Autenticação baseada em JWT

• Access Token + Refresh Token

• Criptografia de dados sensíveis

• Fluxo de login e controle de sessão

• Separação clara de responsabilidades