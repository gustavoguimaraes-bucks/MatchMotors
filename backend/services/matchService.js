const db = require("../db");

// Função para buscar nome da marca diretamente no banco
const getMarcaNomeFromDB = async (codigoFipe, client) => {
  try {
    // Primeiro, tenta buscar pela marca_id
    const queryById = `
      SELECT DISTINCT marca 
      FROM estoque_kka 
      WHERE marca_id = $1 
      LIMIT 1
    `;

    const resultById = await client.query(queryById, [codigoFipe]);
    if (resultById.rows.length > 0) {
      return resultById.rows[0].marca;
    }

    // Se não encontrar, busca todas as marcas disponíveis para debug
    const queryAll = `
      SELECT DISTINCT marca, marca_id 
      FROM estoque_kka 
      ORDER BY marca
    `;

    const resultAll = await client.query(queryAll);
    console.log("Marcas disponíveis no banco:", resultAll.rows);

    return null;
  } catch (error) {
    console.error("Erro ao buscar marca no banco:", error);
    return null;
  }
};

// Função para buscar dados do modelo via API FIPE
// Função para buscar dados do modelo via API FIPE (VERSÃO FINAL CORRIGIDA)
const getModeloDataFromFipe = async (
  tipoVeiculo,
  marcaCode,
  modeloCode,
  anoCode
) => {
  try {
    // A API v2 parece ser a que está respondendo, então mantemos a estrutura dela
    const tipoAPI = tipoVeiculo === "carro" ? "cars" : "motorcycles";
    const url = `https://fipe.parallelum.com.br/api/v2/${tipoAPI}/brands/${marcaCode}/models/${modeloCode}/years/${anoCode}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log(`[FIPE] Erro ao buscar dados. Status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    const marcaNome = data.brand ?? data.Marca;
    const modeloNome = data.model ?? data.Modelo;

    // Verificamos se os nomes foram extraídos com sucesso
    if (marcaNome && modeloNome) {
      return {
        marcaNome: marcaNome,
        modeloNome: modeloNome,
      };
    } else {
      console.log(
        "[FIPE] Resposta da API não contém os campos esperados (brand/model). Resposta recebida:",
        JSON.stringify(data)
      );
      return null;
    }
  } catch (error) {
    console.error("[FIPE] Erro crítico ao buscar dados na FIPE:", error);
    return null;
  }
};

// Função para converter ano FIPE
const converterAnoFipe = (anoFipe) => {
  if (typeof anoFipe === "string") {
    // Remove tudo após o hífen se existir
    return anoFipe.split("-")[0];
  }
  return String(anoFipe);
};

exports.buscarMatchSimples = async (desired) => {
  console.log("Iniciando busca de match simples...");
  const client = await db.connect();

  try {
    const query = `
      SELECT ct.*, l.nome_do_lead, l.email_do_lead, l.telefone_do_lead
      FROM carros_troca ct
      JOIN leads l ON ct.lead_id = l.id
      WHERE ct.marca = $1
        AND ct.modelo = $2
        AND ct.ano = $3
      LIMIT 1
    `;

    const values = [
      desired.desiredBrand,
      desired.desiredModel,
      desired.desiredYear,
    ];
    const result = await client.query(query, values);

    if (result.rows.length === 0) return null;

    const carro = result.rows[0];
    const lead = {
      nome: carro.nome_do_lead,
      email: carro.email_do_lead,
      telefone: carro.telefone_do_lead,
    };

    delete carro.nome_do_lead;
    delete carro.email_do_lead;
    delete carro.telefone_do_lead;

    return { carro, lead, tipo: "troca" };
  } finally {
    client.release();
  }
};

// Busca no estoque KKA - Versão melhorada
exports.buscarMatchEstoque = async (desired) => {
  console.log("=== INICIANDO BUSCA NO ESTOQUE KKA ===");
  console.log("Parâmetros recebidos:", JSON.stringify(desired, null, 2));

  const client = await db.connect();

  try {
    // 1. Primeiro, busca o nome da marca no banco
    const marcaNome = await getMarcaNomeFromDB(desired.desiredBrand, client);

    if (!marcaNome) {
      console.log(
        `❌ Marca não encontrada para código: ${desired.desiredBrand}`
      );

      // Query de debug para ver quais códigos de marca existem
      const debugQuery = `
        SELECT DISTINCT marca_id, marca, COUNT(*) as total
        FROM estoque_kka 
        GROUP BY marca_id, marca 
        ORDER BY total DESC
      `;

      const debugResult = await client.query(debugQuery);
      console.log("📋 Marcas e códigos disponíveis:");
      debugResult.rows.forEach((row) => {
        console.log(
          `  Código ${row.marca_id}: ${row.marca} (${row.total} veículos)`
        );
      });

      return null;
    }

    console.log(
      `✅ Marca encontrada: ${marcaNome} (código ${desired.desiredBrand})`
    );

    // 2. Busca dados do modelo via FIPE para obter o nome do modelo
    const tipoVeiculo = desired.desiredType || "carro";
    const fipeData = await getModeloDataFromFipe(
      tipoVeiculo,
      desired.desiredBrand,
      desired.desiredModel,
      desired.desiredYear
    );

    let modeloNome = null;
    if (fipeData) {
      modeloNome = fipeData.modeloNome;
      console.log(`✅ Nome do modelo obtido via FIPE: ${modeloNome}`);
    } else {
      console.log("⚠️ Não foi possível obter nome do modelo via FIPE");
    }

    // 3. Converte e processa o ano
    const anoDesejado = converterAnoFipe(desired.desiredYear);
    console.log(`📅 Ano processado: ${anoDesejado}`);

    // 4. Query principal - busca exata (marca + modelo + ano)
    let query = `
      SELECT 
        id, placa_completa, carroceria, combustivel, cor, tipo,
        marca, marca_id, modelo_id, modelo_nome, cambio,
        anofabricacao, anomodelo, preco
      FROM estoque_kka
      WHERE marca = $1
        AND (anofabricacao = $2 OR anomodelo = $2)
        AND tipo_id = 1
    `;

    let queryParams = [marcaNome, anoDesejado];

    // Adiciona condição do modelo se disponível
    if (modeloNome) {
      query += ` AND (modelo_id = $3 OR UPPER(TRIM(modelo_nome)) = UPPER(TRIM($4)))`;
      queryParams.push(desired.desiredModel, modeloNome);
    } else {
      // Se não conseguiu o nome via FIPE, tenta match apenas pelo ID
      query += ` AND modelo_id = $3`;
      queryParams.push(desired.desiredModel);
    }

    query += `
      ORDER BY 
        CASE 
          WHEN anofabricacao = $2 THEN 1 
          WHEN anomodelo = $2 THEN 2 
          ELSE 3 
        END,
        preco ASC
      LIMIT 5
    `;

    console.log("🔍 Executando query exata com modelo...");
    console.log("Query:", query);
    console.log("Parâmetros:", queryParams);

    const result = await client.query(query, queryParams);

    if (result.rows.length > 0) {
      console.log(`🎯 MATCH EXATO ENCONTRADO! ${result.rows.length} veículos`);
      const carro = result.rows[0];
      console.log(
        `Veículo encontrado: ${carro.marca} ${carro.modelo_nome} ${carro.anofabricacao}`
      );

      return {
        carro: {
          ...carro,
          fonte: "estoque_kka",
          match_type: "exact",
        },
        tipo: "estoque",
      };
    }

    // 5. Se não encontrou match exato, tenta busca flexível por ano (±2 anos) mantendo marca e modelo
    console.log("🔄 Tentando busca flexível (±2 anos) com marca e modelo...");

    const anoNum = parseInt(anoDesejado);
    let queryFlex = `
      SELECT 
        id, placa_completa, carroceria, combustivel, cor, tipo,
        marca, marca_id, modelo_id, modelo_nome, cambio,
        anofabricacao, anomodelo, preco,
        ABS(CAST(anofabricacao AS INTEGER) - $5) as diff_fab,
        ABS(CAST(anomodelo AS INTEGER) - $5) as diff_modelo
      FROM estoque_kka
      WHERE marca = $1
        AND (
          CAST(anofabricacao AS INTEGER) BETWEEN $2 AND $3 
          OR CAST(anomodelo AS INTEGER) BETWEEN $2 AND $3
        )
        AND tipo_id = 1
    `;

    let queryFlexParams = [marcaNome, anoNum - 2, anoNum + 2, anoNum, anoNum];

    // Adiciona condição do modelo para busca flexível
    if (modeloNome) {
      queryFlex += ` AND (modelo_id = $6 OR UPPER(TRIM(modelo_nome)) = UPPER(TRIM($7)))`;
      queryFlexParams.push(desired.desiredModel, modeloNome);
    } else {
      queryFlex += ` AND modelo_id = $6`;
      queryFlexParams.push(desired.desiredModel);
    }

    queryFlex += `
      ORDER BY 
        LEAST(
          ABS(CAST(anofabricacao AS INTEGER) - $5),
          ABS(CAST(anomodelo AS INTEGER) - $5)
        ) ASC,
        preco ASC
      LIMIT 5
    `;

    console.log("🔍 Executando query flexível com modelo...");
    const resultFlex = await client.query(queryFlex, queryFlexParams);

    if (resultFlex.rows.length > 0) {
      console.log(
        `🎯 MATCH FLEXÍVEL ENCONTRADO! ${resultFlex.rows.length} veículos`
      );
      const carro = resultFlex.rows[0];
      console.log(
        `Veículo encontrado: ${carro.marca} ${carro.modelo_nome} ${
          carro.anofabricacao
        } (diferença de ${Math.min(carro.diff_fab, carro.diff_modelo)} anos)`
      );

      return {
        carro: {
          ...carro,
          fonte: "estoque_kka",
          match_type: "flexible",
        },
        tipo: "estoque",
      };
    }

    console.log("❌ Nenhum veículo encontrado");
    return null;
  } catch (error) {
    console.error("💥 ERRO na busca do estoque:", error);
    console.error("Stack completo:", error.stack);
    return null;
  } finally {
    client.release();
  }
};

// NOVA FUNÇÃO: Busca no histórico de vendas KKA
exports.buscarMatchHistorico = async (desired) => {
  console.log("=== INICIANDO BUSCA NO HISTÓRICO DE VENDAS KKA ===");
  console.log("Parâmetros recebidos:", JSON.stringify(desired, null, 2));
  console.log("Dados enviados para a FIPE:", {
    desiredType: desired.desiredType,
    desiredBrand: desired.desiredBrand,
    desiredModel: desired.desiredModel,
    desiredYear: desired.desiredYear,
  });

  const client = await db.connect();

  try {
    // 1. Buscar dados do modelo via FIPE
    const tipoVeiculo = desired.desiredType || "carro"; // Assumindo 'carro' como padrão
    const fipeData = await getModeloDataFromFipe(
      tipoVeiculo,
      desired.desiredBrand,
      desired.desiredModel, // <-- Ordem correta
      desired.desiredYear // <-- Ordem correta
    );

    if (!fipeData) {
      console.log("❌ Não foi possível obter dados da FIPE");
      return null;
    }

    console.log(
      `✅ Dados FIPE obtidos - Marca: ${fipeData.marcaNome}, Modelo: ${fipeData.modeloNome}`
    );

    // 2. Converte e processa o ano
    const anoDesejado = converterAnoFipe(desired.desiredYear);
    const anoNum = parseInt(anoDesejado);
    console.log(`📅 Ano processado: ${anoDesejado}`);

    // 3. Query principal - busca exata no histórico
    const queryExata = `
      SELECT 
        id, placa, tipo_veiculo,
        marca, modelo,
        ano_fabricacao, ano_modelo, venda_com_desconto, vendedor
      FROM vendas_historicas_kka
      WHERE UPPER(TRIM(marca)) = UPPER(TRIM($1))
        AND UPPER(TRIM(modelo)) = UPPER(TRIM($2))
        AND (ano_fabricacao = $3 OR ano_modelo = $3)
      ORDER BY 
        CASE 
          WHEN ano_fabricacao = $3 THEN 1 
          WHEN ano_modelo = $3 THEN 2 
          ELSE 3 
        END,
        venda_com_desconto ASC
      LIMIT 5
    `;

    console.log("🔍 Executando busca exata no histórico...");
    const resultExato = await client.query(queryExata, [
      fipeData.marcaNome,
      fipeData.modeloNome,
      anoNum,
    ]);

    if (resultExato.rows.length > 0) {
      console.log(
        `🎯 MATCH EXATO NO HISTÓRICO! ${resultExato.rows.length} vendas encontradas`
      );
      const venda = resultExato.rows[0];

      return {
        carro: {
          ...venda,
          fonte: "vendas_historicas_kka",
          match_type: "exact",
        },
        tipo: "historico",
      };
    }

    // 4. Se não encontrou match exato, tenta busca flexível (±2 anos)
    console.log("🔄 Tentando busca flexível no histórico (±2 anos)...");

    const queryFlex = `
      SELECT 
        id, placa, tipo_veiculo,
        marca, modelo,
        ano_fabricacao, ano_modelo, venda_com_desconto, vendedor,
        ABS(CAST(ano_fabricacao AS INTEGER) - $4) as diff_fab,
        ABS(CAST(ano_modelo AS INTEGER) - $4) as diff_modelo
      FROM vendas_historicas_kka
      WHERE UPPER(TRIM(marca)) = UPPER(TRIM($1))
        AND UPPER(TRIM(modelo)) = UPPER(TRIM($2))
        AND (
          CAST(ano_fabricacao AS INTEGER) BETWEEN $3 AND $5
          OR CAST(ano_modelo AS INTEGER) BETWEEN $3 AND $5
        )
      ORDER BY 
        LEAST(
          ABS(CAST(ano_fabricacao AS INTEGER) - $4),
          ABS(CAST(ano_modelo AS INTEGER) - $4)
        ) ASC,
        venda_com_desconto ASC
      LIMIT 5
    `;

    const resultFlex = await client.query(queryFlex, [
      fipeData.marcaNome,
      fipeData.modeloNome,
      anoNum - 2, // ano mínimo
      anoNum, // ano desejado (para cálculo da diferença)
      anoNum + 2, // ano máximo
    ]);

    if (resultFlex.rows.length > 0) {
      console.log(
        `🎯 MATCH FLEXÍVEL NO HISTÓRICO! ${resultFlex.rows.length} vendas encontradas`
      );
      const venda = resultFlex.rows[0];

      return {
        carro: {
          ...venda,
          fonte: "vendas_historicas_kka",
          match_type: "flexible",
          diferenca_anos: Math.min(venda.diff_fab, venda.diff_modelo),
        },
        tipo: "historico",
      };
    }

    console.log("❌ Nenhuma venda encontrada no histórico");
    return null;
  } catch (error) {
    console.error("💥 ERRO na busca do histórico:", error);
    console.error("Stack completo:", error.stack);
    return null;
  } finally {
    client.release();
  }
};

// Busca match completo - Versão atualizada com histórico
exports.buscarMatchCompleto = async (desired) => {
  console.log("=== INICIANDO BUSCA DE MATCH COMPLETO ===");

  try {
    // FASE 1: Busca no estoque KKA
    console.log("--- FASE 1: Estoque KKA ---");
    const matchEstoque = await exports.buscarMatchEstoque(desired);

    if (matchEstoque) {
      console.log("✅ MATCH ENCONTRADO NO ESTOQUE!");
      return {
        found: true,
        source: "estoque",
        ...matchEstoque,
      };
    }

    // FASE 2: Busca no histórico de vendas
    console.log("--- FASE 2: Histórico de vendas KKA ---");
    const matchHistorico = await exports.buscarMatchHistorico(desired);

    if (matchHistorico) {
      console.log("✅ MATCH ENCONTRADO NO HISTÓRICO!");
      return {
        found: true,
        source: "historico",
        ...matchHistorico,
      };
    }

    // FASE 3: Busca em carros de troca
    console.log("--- FASE 3: Carros de troca ---");
    const matchTroca = await exports.buscarMatchSimples(desired);

    if (matchTroca) {
      console.log("✅ MATCH ENCONTRADO EM TROCA!");
      return {
        found: true,
        source: "troca",
        ...matchTroca,
      };
    }

    console.log("❌ NENHUM MATCH ENCONTRADO");
    return { found: false };
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
    throw error;
  }
};
