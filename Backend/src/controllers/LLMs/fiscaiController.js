require('dotenv').config();

const { OpenAI } = require('openai');

const axios = require('axios');

const funcoes = require('../Funcoes/funcoes');

module.exports = {

  /**
   * Código para gerar as sugestões da NF-e com IA
   */
  async sugereNFe(request, response) {

    var { uf_emitente, regime_empresa, uf_destinatario, tipo_operacao, natureza_operacao, finalidade, produto, regime_produto, industrializado } = request.body;

    let ano = new Date().getFullYear();

    /*** API OpenAI */
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Chave da API para autenticar
      timeout: 15000 // 15s de timeout para resposta
    });

    //----------------------------------------------------------------------------------------------------------//

    /*** FUNÇÕES PARA VALIDAÇÃO SE REGIME DO PRODUTO SELECIONADO ESTÁ CORRETO */

    // Quando o usuário selecionar o produto como "ST", essa função vai verificar com a IA se realmente é sujeito a ST.
    async function isRegimeProdutoCorreto({ regime_empresa, uf_emitente, uf_destinatario, tipo_operacao, natureza_operacao, finalidade, produto, regime_produto }) {
      const prompt = `Analise exclusivamente se o regime tributário do produto informado abaixo (${regime_produto}) realmente condiz com a legislação brasileira e do estado do emitente:
      - Regime tributário da empresa: ${regime_empresa}
      - UF do emitente: ${uf_emitente}
      - UF do destinatário: ${uf_destinatario}
      - Tipo de operação: ${tipo_operacao}
      - Natureza da Operação: ${natureza_operacao}
      - Finalidade: ${finalidade}
      - Descrição detalhada do produto: ${produto}
      - Regime tributário do produto: ${regime_produto}

      Responda exclusivamente em JSON com este formato:
      {
      "valido": true ou false,
      "justificativa": "Explique RESUMIDAMENTE o motivo, citando legislação ou prática comum, e oriente o usuário a corrigir o regime do produto caso esteja errado."
      }`;
      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em tributação, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    //----------------------------------------------------------------------------------------------------------//

    /*** FUNÇÕES PARA VALIDAÇÃO E SUGESTÃO PARA PRODUTOS INDUSTRIALIZADOS */

    // Quando o usuário selecionar o produto como "Industrializado", essa função vai verificar com a IA se realmente é industrializado.
    async function isIndustrializado({ regime_empresa, uf_emitente, uf_destinatario, finalidade, tipo_operacao, produto, regime_produto }) {
      const prompt = `Analise exclusivamente se o produto informado abaixo realmente é considerado industrializado segundo a legislação brasileira e do estado informado:
    
      - Regime tributário do emitente: ${regime_empresa}
      - UF do emitente: ${uf_emitente}
      - UF do destinatário: ${uf_destinatario}
      - Tipo de operação: ${tipo_operacao}
      - Natureza da Operação: ${natureza_operacao}
      - Finalidade: ${finalidade}
      - Descrição detalhada do produto: ${produto}
      - Regime tributário do produto: ${regime_produto}
      
      Responda exclusivamente em JSON com este formato:
      {
        "is_industrializado": true ou false,
        "justificativa": "Explique de forma RESUMIDA a base legal ou motivo, citando a legislação relevante se possível. E depois diga ao usuário para desmarcar a "Produto Industrializado" e realizar a consulta novamente."
      }`;
      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em tributação, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    // Aqui gera os dados tributários para industrializado
    async function geraCamposFiscaisIndustrializado({ regime_empresa, uf_emitente, uf_destinatario, finalidade, tipo_operacao, produto, regime_produto }) {
      const prompt = `Receba os seguintes dados de uma operação para emissão de NF-e:
        - Regime tributário do emitente: ${regime_empresa}
        - UF do emitente: ${uf_emitente}
        - UF do destinatario: ${uf_destinatario}
        - Tipo de operação: ${tipo_operacao}
        - Natureza da Operação: ${natureza_operacao}
        - Finalidade: ${finalidade}
        - Descrição detalhada do produto: ${produto}
        - Regime tributário do produto: ${regime_produto}

        1. Primeiro, com base na descrição do produto, sugira o NCM mais adequado.  
          Se houver dúvida relevante ou mais de um NCM possível segundo a legislação, retorne todos os NCMs válidos, explicando em qual cenário usar cada um.

        2. Depois, utilizando o NCM sugerido e todas as informações de entrada, defina **todas as opções possíveis** para cada campo fiscal abaixo, considerando a legislação vigente e práticas fiscais atuais.  
          Quando houver mais de uma alternativa válida para algum campo (ex: CFOP, CST, alíquotas, IPI), **retorne todas as opções possíveis como uma lista de objetos**, e para cada opção adicione um campo "justificativa" com explicação objetiva sobre quando e por que usá-la.

        Estruture o retorno em JSON, assim:

        {
          "ncm": [ { "valor": "", "justificativa": "" } ],
          "cfop": [ { "valor": "", "justificativa": "" } ],
          "cst_icms": [ { "valor": "", "justificativa": "" } ],
          "aliquota_icms": [ { "valor": "", "justificativa": "" } ],
          "cst_ipi": [ { "valor": "", "justificativa": "" } ],
          "aliquota_ipi": [ { "valor": "", "justificativa": "" } ],
          "cst_pis": [ { "valor": "", "justificativa": "" } ],
          "cst_cofins": [ { "valor": "", "justificativa": "" } ],
          "aliquota_pis": [ { "valor": "", "justificativa": "" } ],
          "aliquota_cofins": [ { "valor": "", "justificativa": "" } ],
          "observacoes_legais": [""]
        }

        Exemplo de campo:
        "cst_ipi": [
            { "valor": "50", "justificativa": "Saída tributada de produto industrializado." },
            { "valor": "99", "justificativa": "Outras operações com produto industrializado, conforme legislação específica." }
        ]

        Quando retornar campos de alíquota (ICMS, IPI, PIS, COFINS), o campo "valor" deve conter APENAS a porcentagem, incluindo o símbolo "%", mantendo todas as casas decimais.  
        Exemplo:
        "aliquota_icms": [
          { "valor": "8%", "justificativa": "Alíquota padrão para este produto em SP." },
          { "valor": "7.05%", "justificativa": "Redução concedida para determinado setor." }
        ]
        Não inclua o valor decimal, apenas a porcentagem.

        Inclua as situações tributárias (CST) e alíquotas mais prováveis para ICMS, IPI, PIS, COFINS, utilizando o NCM sugerido e todos os outros dados de entrada, e detalhando a justificativa de uso.
        Adicione justificativas técnicas em "observacoes_legais", com base em normas oficiais e exemplos reais, especialmente sobre IPI.`;

      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em tributação, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    //----------------------------------------------------------------------------------------------------------//

    /*** FUNÇÕES PARA SUGESTÃO PADRÃO (SEM IPI) */

    // Gera campos fiscais padrão
    async function geraCamposFiscaisPadrao({ regime_empresa, uf_emitente, uf_destinatario, finalidade, tipo_operacao, produto, regime_produto }) {
      const prompt = `Receba os seguintes dados de uma operação para emissão de NF-e:
        - Regime tributário do emitente: ${regime_empresa}
        - UF do emitente: ${uf_emitente}
        - UF do destinatario: ${uf_destinatario}
        - Tipo de operação: ${tipo_operacao}
        - Natureza da Operação: ${natureza_operacao}
        - Finalidade: ${finalidade}
        - Descrição detalhada do produto: ${produto}
        - Regime tributário do produto: ${regime_produto}

        1. Primeiro, com base na descrição do produto, sugira o NCM mais adequado.  
          Se houver dúvida relevante ou mais de um NCM possível segundo a legislação, retorne todos os NCMs válidos, explicando em qual cenário usar cada um.

        2. Depois, utilize o NCM sugerido e as outras informações de entrada para definir todas as opções possíveis para cada campo abaixo, **considerando a legislação vigente e práticas fiscais atuais**.  
          Quando houver mais de uma alternativa válida para algum campo (ex: CFOP, CST, alíquotas), **retorne todas as opções possíveis como uma lista de objetos**, e para cada opção adicione um campo "justificativa" com uma explicação objetiva sobre quando e por que usá-la.

        Estruture o retorno em JSON, assim:

        {
          "ncm": [ { "valor": "", "justificativa": "" } ],
          "cfop": [ { "valor": "", "justificativa": "" } ],
          "cst_icms": [ { "valor": "", "justificativa": "" } ],
          "aliquota_icms": [ { "valor": "", "justificativa": "" } ],
          "cst_pis": [ { "valor": "", "justificativa": "" } ],
          "cst_cofins": [ { "valor": "", "justificativa": "" } ],
          "aliquota_pis": [ { "valor": "", "justificativa": "" } ],
          "aliquota_cofins": [ { "valor": "", "justificativa": "" } ],
          "observacoes_legais": [""]
        }

        Exemplo de cada campo (se só houver uma opção, retorne a lista com um objeto):
        "cfop": [
            { "valor": "5101", "justificativa": "Venda de produção do estabelecimento para contribuinte no mesmo estado." },
            { "valor": "5102", "justificativa": "Venda de mercadoria adquirida de terceiros para contribuinte no mesmo estado." }
        ]

        Quando retornar campos de alíquota (ICMS, PIS, COFINS), o campo "valor" deve conter APENAS a porcentagem, incluindo o símbolo "%", mantendo todas as casas decimais.  
        Exemplo:
        "aliquota_icms": [
          { "valor": "8%", "justificativa": "Alíquota padrão para este produto em SP." },
          { "valor": "7.05%", "justificativa": "Redução concedida para determinado setor." }
        ]
        Não inclua o valor decimal, apenas a porcentagem.

        Inclua as situações tributárias (CST) e alíquotas mais prováveis, utilizando o NCM sugerido e detalhando a justificativa de uso.
        Adicione justificativas técnicas em "observacoes_legais", baseando-se na legislação vigente.Não retorne campos ou informações de IPI.`;

      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em tributação, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });

      return JSON.parse(resAI.choices[0].message.content);
    }

    //----------------------------------------------------------------------------------------------------------//

    // Validação ÚNICA do regime do produto selecionado
    const validacaoRegime = await isRegimeProdutoCorreto({
      regime_empresa,
      uf_emitente,
      uf_destinatario,
      tipo_operacao,
      natureza_operacao,
      finalidade,
      produto,
      regime_produto
    });
    if (!validacaoRegime.valido) {
      return response.json({
        erro_orientacao: validacaoRegime.justificativa
      });
    }

    // Validação se o produto é INDUSTRIALIZADO
    if (industrializado === true || industrializado === "true") {

      const resultInd = await isIndustrializado({
        regime_empresa,
        uf_emitente,
        uf_destinatario,
        finalidade,
        tipo_operacao,
        produto,
        regime_produto
      });

      if (!resultInd.is_industrializado) {
        return response.json({
          erro_orientacao: resultInd.justificativa
        });
      }
      const dadosFiscaisIPI = await geraCamposFiscaisIndustrializado({
        regime_empresa,
        uf_emitente,
        uf_destinatario,
        finalidade,
        tipo_operacao,
        produto,
        regime_produto
      });
      return response.json(dadosFiscaisIPI);

    } else {

      // Se realmente não for industrializado, gera normalmente os campos fiscais padrão
      const dadosFiscais = await geraCamposFiscaisPadrao({
        regime_empresa,
        uf_emitente,
        uf_destinatario,
        tipo_operacao,
        natureza_operacao,
        finalidade,
        produto,
        regime_produto
      });

      return response.json(dadosFiscais);

    }

  },

  /**
   * Código para gerar as sugestões da NFS-e com IA
   */
  async sugereNFSe(request, response) {

    const {
      regime_empresa,
      uf_prestador,
      municipio_prestador,
      uf_tomador,
      municipio_tomador,
      descricao_servico,
      valor_servico,
      tomador_orgao_publico,
      tomador_exterior
    } = request.body;

    var ano = new Date().getFullYear();

    /*** API OpenAI */
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15000
    });

    // Função para validação de tomador órgão público
    async function isValidoOrgaoPublico(params) {
      const prompt = `Analise exclusivamente se o serviço descrito abaixo e a operação configurada realmente podem ser enquadrados como prestação para órgão público, de acordo com as regras federais (LC 116/2003) e do município informado.
  
        - UF do prestador: ${params.uf_prestador}
        - Município do prestador: ${params.municipio_prestador}
        - UF do tomador: ${params.uf_tomador}
        - Município do tomador (órgão público): ${params.municipio_tomador}
        - Descrição detalhada do serviço: ${params.descricao_servico}
        - Regime tributário do prestador: ${params.regime_empresa}
        - Valor do serviço: R$${params.valor_servico}
  
        Responda exclusivamente em JSON com este formato:
        {
          "valido": true ou false,
          "justificativa": "Explique de forma RESUMIDA o motivo, citando a legislação relevante se possível. E, se inválido, oriente o usuário a desmarcar 'Tomador órgão público' ou corrigir outros dados e realizar a consulta novamente."
        }`;
      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em tributação municipal e federal, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    // Função para validação de tomador exterior
    async function isValidoExterior(params) {
      const prompt = `Analise exclusivamente se o serviço descrito abaixo realmente pode ser enquadrado como prestação para tomador no exterior, considerando incidência de ISS, retenção de tributos federais e legislação vigente.
  
        - UF do prestador: ${params.uf_prestador}
        - Município do prestador: ${params.municipio_prestador}
        - Descrição detalhada do serviço: ${params.descricao_servico}
        - Regime tributário do prestador: ${params.regime_empresa}
        - Valor do serviço: R$${params.valor_servico}
  
        Responda exclusivamente em JSON com este formato:
        {
          "valido": true ou false,
          "justificativa": "Explique de forma RESUMIDA o motivo, citando a legislação relevante se possível. Se inválido, oriente o usuário a desmarcar 'Tomador Exterior' ou corrigir outros dados e realizar a consulta novamente."
        }`;

      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em ISS e tributação de exportação de serviços, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });

      return JSON.parse(resAI.choices[0].message.content);
    }

    // Função para validação geral (demais cenários)
    async function isValidoGeral(params) {
      const prompt = `Avalie se os dados abaixo realmente correspondem a uma operação válida para emissão de NFS-e, considerando possíveis restrições municipais, LC 116/03, e regras do Simples Nacional/MEI.
  
        - UF do prestador: ${params.uf_prestador}
        - Município do prestador: ${params.municipio_prestador}
        - UF do tomador: ${params.uf_tomador}
        - Município do tomador (órgão público): ${params.municipio_tomador}
        - Descrição detalhada do serviço: ${params.descricao_servico}
        - Regime tributário do prestador: ${params.regime_empresa}
        - Valor do serviço: R$${params.valor_servico}
  
        Responda exclusivamente em JSON com este formato:
        {
          "valido": true ou false,
          "justificativa": "Explique de forma RESUMIDA a base legal ou motivo, citando a legislação relevante se possível. E, se inválido, oriente o usuário a corrigir o campo identificado e realizar nova consulta."
        }`;

      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em ISS, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });

      return JSON.parse(resAI.choices[0].message.content);
    }

    // Função para sugestão tributária para órgão público
    async function geraCamposFiscaisOrgaoPublico(params) {
      const prompt = `Receba os seguintes dados para emissão de NFS-e para órgão público:

        - UF do prestador: ${params.uf_prestador}
        - Município do prestador: ${params.municipio_prestador}
        - UF do tomador: ${params.uf_tomador}
        - Município do tomador (órgão público): ${params.municipio_tomador}
        - Descrição detalhada do serviço: ${params.descricao_servico}
        - Regime tributário do prestador: ${params.regime_empresa}
        - Valor do serviço: R$${params.valor_servico}
        - Tomador é órgão público: sim

        Para cada campo tributário abaixo, retorne todas as opções plausíveis em formato de array de objetos, cada um contendo "valor" e "justificativa", EXPLICANDO em cada justificativa em quais situações cada valor deve ser usado.

        Exemplo de resposta para campo com múltiplas opções:
        "codigo_servico_lc116": [
          { "valor": "17.10", "justificativa": "Usar para consultoria em gestão. Adequado quando..." },
          { "valor": "17.11", "justificativa": "Usar para consultoria tributária. Adequado quando..." }
        ]

        Estrutura de resposta:
        {
          "codigo_servico_lc116": [ { "valor": "", "justificativa": "" } ],
          "descricao_classificada": [ { "valor": "", "justificativa": "" } ],
          "cnae_sugerido": [ { "valor": "", "justificativa": "" } ],
          "aliquota_iss": [ { "valor": "", "justificativa": "" } ],
          "iss_retido": [ { "valor": "", "justificativa": "" } ],
          "municipio_incidente": [ { "valor": "", "justificativa": "" } ],
          "retencoes": [ { "valor": "", "justificativa": "" } ],
          "regime_empresa": [ { "valor": "", "justificativa": "" } ],
          "observacoes_legais": [""]
        }

        Quando retornar campos de alíquota (ISS), o campo "valor" deve conter APENAS a porcentagem, incluindo o símbolo "%", mantendo todas as casas decimais.
        Exemplo:
        "aliquota_iss": [
          { "valor": "2%", "justificativa": "Alíquota mínima do ISS conforme legislação federal." },
          { "valor": "5%", "justificativa": "Alíquota padrão para serviços de informática em alguns municípios." }
        ]
        Não inclua o valor decimal, apenas a porcentagem.

        Para "valor" do "iss_retido", quando for retido retorne "Sim" ao invés de "true", e quando não for retido retorne "Não" ao invés de "false".
        Exemplo:
        "iss_retido": [
          { "valor": "Não", "justificativa": "Como o tomador não é um órgão público e não há menção de retenção contratual, o ISS não deve ser retido na fonte." }
        ]
        "iss_retido": [
          { "valor": "Sim", "justificativa": "Como o tomador é um órgão público, o ISS deve ser retido na fonte." }
        ]

        Inclua orientações sobre retenção, incidência do ISS e obrigações do órgão público. Considere o regime tributário e as regras específicas para prestação a entes públicos.`;

      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em ISS, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    // Função para sugestão tributária para exterior
    async function geraCamposFiscaisExterior(params) {
      const prompt = `Receba os seguintes dados para emissão de NFS-e para tomador no exterior:
  
        - UF do prestador: ${params.uf_prestador}
        - Município do prestador: ${params.municipio_prestador}
        - Descrição detalhada do serviço: ${params.descricao_servico}
        - Regime tributário do prestador: ${params.regime_empresa}
        - Valor do serviço: R$${params.valor_servico}
        - Tomador é do exterior: sim
  
        Para cada campo tributário abaixo, retorne todas as opções plausíveis em formato de array de objetos, cada um contendo "valor" e "justificativa", EXPLICANDO em cada justificativa em quais situações cada valor deve ser usado.
  
        Estrutura de resposta:
        {
          "codigo_servico_lc116": [ { "valor": "", "justificativa": "" } ],
          "descricao_classificada": [ { "valor": "", "justificativa": "" } ],
          "cnae_sugerido": [ { "valor": "", "justificativa": "" } ],
          "aliquota_iss": [ { "valor": "", "justificativa": "" } ],
          "iss_retido": [ { "valor": "", "justificativa": "" } ],
          "municipio_incidente": [ { "valor": "", "justificativa": "" } ],
          "retencoes": [ { "valor": "", "justificativa": "" } ],
          "regime_empresa": [ { "valor": "", "justificativa": "" } ],
          "observacoes_legais": [""]
        }

        Quando retornar campos de alíquota (ISS), o campo "valor" deve conter APENAS a porcentagem, incluindo o símbolo "%", mantendo todas as casas decimais.
        Exemplo:
        "aliquota_iss": [
          { "valor": "2%", "justificativa": "Alíquota mínima do ISS conforme legislação federal." },
          { "valor": "5%", "justificativa": "Alíquota padrão para serviços de informática em alguns municípios." }
        ]
        Não inclua o valor decimal, apenas a porcentagem.

        Para "valor" do "iss_retido", quando for retido retorne "Sim" ao invés de "true", e quando não for retido retorne "Não" ao invés de "false".
        Exemplo:
        "iss_retido": [
          { "valor": "Não", "justificativa": "Como o tomador não é um órgão público e não há menção de retenção contratual, o ISS não deve ser retido na fonte." }
        ]
        "iss_retido": [
          { "valor": "Sim", "justificativa": "Como o tomador é um órgão público, o ISS deve ser retido na fonte." }
        ]
  
        Inclua informações sobre incidência ou não de ISS, retenção federal, benefícios fiscais para exportação e base legal.`;
      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em ISS e exportação de serviços, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    // Função para sugestão tributária padrão (demais cenários)
    async function geraCamposFiscaisPadrao(params) {
      const prompt = `Receba os seguintes dados para emissão de NFS-e:
  
        - UF do prestador: ${params.uf_prestador}
        - Município do prestador: ${params.municipio_prestador}
        - UF do tomador: ${params.uf_tomador}
        - Município do tomador (órgão público): ${params.municipio_tomador}
        - Descrição detalhada do serviço: ${params.descricao_servico}
        - Regime tributário do prestador: ${params.regime_empresa}
        - Valor do serviço: R$${params.valor_servico}
        - Tomador é órgão público: não
        - Tomador é do exterior: não
  
        Para cada campo tributário abaixo, retorne todas as opções plausíveis em formato de array de objetos, cada um contendo "valor" e "justificativa", EXPLICANDO em cada justificativa em quais situações cada valor deve ser usado.
  
        Estrutura de resposta:
        {
          "codigo_servico_lc116": [ { "valor": "", "justificativa": "" } ],
          "descricao_classificada": [ { "valor": "", "justificativa": "" } ],
          "cnae_sugerido": [ { "valor": "", "justificativa": "" } ],
          "aliquota_iss": [ { "valor": "", "justificativa": "" } ],
          "iss_retido": [ { "valor": "", "justificativa": "" } ],
          "municipio_incidente": [ { "valor": "", "justificativa": "" } ],
          "retencoes": [ { "valor": "", "justificativa": "" } ],
          "regime_empresa": [ { "valor": "", "justificativa": "" } ],
          "observacoes_legais": [""]
        }

        Quando retornar campos de alíquota (ISS), o campo "valor" deve conter APENAS a porcentagem, incluindo o símbolo "%", mantendo todas as casas decimais.
        Exemplo:
        "aliquota_iss": [
          { "valor": "2%", "justificativa": "Alíquota mínima do ISS conforme legislação federal." },
          { "valor": "5%", "justificativa": "Alíquota padrão para serviços de informática em alguns municípios." }
        ]
        Não inclua o valor decimal, apenas a porcentagem.

        Para "valor" do "iss_retido", quando for retido retorne "Sim" ao invés de "true", e quando não for retido retorne "Não" ao invés de "false".
        Exemplo:
        "iss_retido": [
          { "valor": "Não", "justificativa": "Como o tomador não é um órgão público e não há menção de retenção contratual, o ISS não deve ser retido na fonte." }
        ]
        "iss_retido": [
          { "valor": "Sim", "justificativa": "Como o tomador é um órgão público, o ISS deve ser retido na fonte." }
        ]
  
        Inclua justificativas técnicas, orientações sobre regime tributário, municipalidade do ISS, retenção e embasamento legal.`;
      const resAI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Você é um especialista brasileiro em ISS, atualizado com as últimas regras fiscais de ${ano}, que sugere dados tributários em formato JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.01,
        response_format: { "type": "json_object" },
      });
      return JSON.parse(resAI.choices[0].message.content);
    }

    // ----------- Lógica de decisão -----------

    if (tomador_orgao_publico === true) {
      // Checagem se operação realmente é órgão público
      const validacao = await isValidoOrgaoPublico({
        uf_prestador,
        municipio_prestador,
        uf_tomador,
        municipio_tomador,
        descricao_servico,
        regime_empresa,
        valor_servico
      });

      if (!validacao.valido) {
        return response.json({ erro_orientacao: validacao.justificativa });
      }

      const dadosFiscais = await geraCamposFiscaisOrgaoPublico({
        uf_prestador,
        municipio_prestador,
        uf_tomador,
        municipio_tomador,
        descricao_servico,
        regime_empresa,
        valor_servico
      });
      return response.json(dadosFiscais);

    } else if (tomador_exterior === true) {
      // Checagem se operação realmente é exportação de serviço
      const validacao = await isValidoExterior({
        uf_prestador,
        municipio_prestador,
        descricao_servico,
        regime_empresa,
        valor_servico
      });

      if (!validacao.valido) {
        return response.json({ erro_orientacao: validacao.justificativa });
      }

      const dadosFiscais = await geraCamposFiscaisExterior({
        uf_prestador,
        municipio_prestador,
        descricao_servico,
        regime_empresa,
        valor_servico
      });
      return response.json(dadosFiscais);

    } else {

      // Checagem geral para outros erros de entrada
      const validacao = await isValidoGeral({
        uf_prestador,
        municipio_prestador,
        uf_tomador,
        municipio_tomador,
        descricao_servico,
        regime_empresa,
        valor_servico
      });

      if (!validacao.valido) {
        return response.json({ erro_orientacao: validacao.justificativa });
      }

      const dadosFiscais = await geraCamposFiscaisPadrao({
        uf_prestador,
        municipio_prestador,
        uf_tomador,
        municipio_tomador,
        descricao_servico,
        regime_empresa,
        valor_servico
      });

      return response.json(dadosFiscais);
    }
  }

};