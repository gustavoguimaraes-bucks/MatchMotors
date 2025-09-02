// backend/services/matchService.js - Versão Corrigida

const db = require('../db');

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
    console.log('Marcas disponíveis no banco:', resultAll.rows);
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar marca no banco:', error);
    return null;
  }
};

// Função para converter ano FIPE
const converterAnoFipe = (anoFipe) => {
  if (typeof anoFipe === 'string') {
    // Remove tudo após o hífen se existir
    return anoFipe.split('-')[0];
  }
  return String(anoFipe);
};

// Busca match em carros de troca (mantém funcionalidade existente)
exports.buscarMatchSimples = async (desired) => {
  console.log('Iniciando busca de match simples...');
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

    const values = [desired.desiredBrand, desired.desiredModel, desired.desiredYear];
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

    return { carro, lead, tipo: 'troca' };
  } finally {
    client.release();
  }
};

// Busca no estoque KKA - Versão melhorada
exports.buscarMatchEstoque = async (desired) => {
  console.log('=== INICIANDO BUSCA NO ESTOQUE KKA ===');
  console.log('Parâmetros recebidos:', JSON.stringify(desired, null, 2));
  
  const client = await db.connect();

  try {
    // 1. Primeiro, busca o nome da marca no banco
    const marcaNome = await getMarcaNomeFromDB(desired.desiredBrand, client);
    
    if (!marcaNome) {
      console.log(`❌ Marca não encontrada para código: ${desired.desiredBrand}`);
      
      // Query de debug para ver quais códigos de marca existem
      const debugQuery = `
        SELECT DISTINCT marca_id, marca, COUNT(*) as total
        FROM estoque_kka 
        GROUP BY marca_id, marca 
        ORDER BY total DESC
      `;
      
      const debugResult = await client.query(debugQuery);
      console.log('📋 Marcas e códigos disponíveis:');
      debugResult.rows.forEach(row => {
        console.log(`  Código ${row.marca_id}: ${row.marca} (${row.total} veículos)`);
      });
      
      return null;
    }

    console.log(`✅ Marca encontrada: ${marcaNome} (código ${desired.desiredBrand})`);

    // 2. Converte e processa o ano
    const anoDesejado = converterAnoFipe(desired.desiredYear);
    console.log(`📅 Ano processado: ${anoDesejado}`);

    // 3. Query principal - busca exata
    const query = `
      SELECT 
        id, placa_completa, carroceria, combustivel, cor, tipo,
        marca, marca_id, modelo_id, modelo_nome, cambio,
        anofabricacao, anomodelo, preco
      FROM estoque_kka
      WHERE marca = $1
        AND (anofabricacao = $2 OR anomodelo = $2)
        AND tipo_id = 1
      ORDER BY 
        CASE 
          WHEN anofabricacao = $2 THEN 1 
          WHEN anomodelo = $2 THEN 2 
          ELSE 3 
        END,
        preco ASC
      LIMIT 5
    `;

    console.log('🔍 Executando query exata...');
    const result = await client.query(query, [marcaNome, anoDesejado]);
    
    if (result.rows.length > 0) {
      console.log(`🎯 MATCH EXATO ENCONTRADO! ${result.rows.length} veículos`);
      const carro = result.rows[0];
      
      return { 
        carro: {
          ...carro,
          fonte: 'estoque_kka',
          match_type: 'exact'
        }, 
        tipo: 'estoque' 
      };
    }

    // 4. Se não encontrou match exato, tenta busca flexível
    console.log('🔄 Tentando busca flexível (±2 anos)...');
    
    const anoNum = parseInt(anoDesejado);
    const queryFlex = `
      SELECT 
        id, placa_completa, carroceria, combustivel, cor, tipo,
        marca, marca_id, modelo_id, modelo_nome, cambio,
        anofabricacao, anomodelo, preco,
        ABS(CAST(anofabricacao AS INTEGER) - $4) as diff_fab,
        ABS(CAST(anomodelo AS INTEGER) - $4) as diff_modelo
      FROM estoque_kka
      WHERE marca = $1
        AND (
          CAST(anofabricacao AS INTEGER) BETWEEN $2 AND $3 
          OR CAST(anomodelo AS INTEGER) BETWEEN $2 AND $3
        )
        AND tipo_id = 1
      ORDER BY 
        LEAST(
          ABS(CAST(anofabricacao AS INTEGER) - $4),
          ABS(CAST(anomodelo AS INTEGER) - $4)
        ) ASC,
        preco ASC
      LIMIT 5
    `;

    const resultFlex = await client.query(queryFlex, [
      marcaNome, 
      anoNum - 2, 
      anoNum + 2, 
      anoNum
    ]);
    
    if (resultFlex.rows.length > 0) {
      console.log(`🎯 MATCH FLEXÍVEL ENCONTRADO! ${resultFlex.rows.length} veículos`);
      const carro = resultFlex.rows[0];
      
      return { 
        carro: {
          ...carro,
          fonte: 'estoque_kka',
          match_type: 'flexible'
        }, 
        tipo: 'estoque' 
      };
    }

    console.log('❌ Nenhum veículo encontrado');
    return null;

  } catch (error) {
    console.error('💥 ERRO na busca do estoque:', error);
    console.error('Stack completo:', error.stack);
    return null;
  } finally {
    client.release();
  }
};

// Busca match completo - mantém a lógica existente
exports.buscarMatchCompleto = async (desired) => {
  console.log('=== INICIANDO BUSCA DE MATCH COMPLETO ===');
  
  try {
    // FASE 1: Busca no estoque KKA
    console.log('--- FASE 1: Estoque KKA ---');
    const matchEstoque = await exports.buscarMatchEstoque(desired);
    
    if (matchEstoque) {
      console.log('✅ MATCH ENCONTRADO NO ESTOQUE!');
      return {
        found: true,
        source: 'estoque',
        ...matchEstoque
      };
    }

    // FASE 2: Busca em carros de troca
    console.log('--- FASE 2: Carros de troca ---');
    const matchTroca = await exports.buscarMatchSimples(desired);
    
    if (matchTroca) {
      console.log('✅ MATCH ENCONTRADO EM TROCA!');
      return {
        found: true,
        source: 'troca',
        ...matchTroca
      };
    }

    console.log('❌ NENHUM MATCH ENCONTRADO');
    return { found: false };

  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error);
    throw error;
  }
};