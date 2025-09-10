const db = require("../db");
const fipeService = require("./fipeService");

//Insere matches na tabela do banco de dados
exports.salvarMatch = async ({
  leadId,
  matchedLeadId,
  desired,
  available,
  source,
}) => {
  const client = await db.connect();

  try {
    const desiredInfo = {
      tipo: desired.desiredType,
      marca: desired.desiredBrand,
      modelo: desired.desiredModel,
      ano: desired.desiredYear,
      cor: desired.desiredColor,
      carroceria: desired.desiredCarroceria,
    };

    let availableInfo;

    // Handle different match sources
    if (source === "historico") {
      // For historical sales data
      availableInfo = {
        tipo: available.tipo_veiculo || "carro",
        marca: available.marca,
        modelo: available.modelo,
        ano: available.ano_fabricacao || available.ano_modelo,
        cor: "Não informado", // Historical data might not have color
        carroceria: "Não informado", // Historical data might not have body type
        preco: available.venda_com_desconto,
        fonte: "Histórico de Vendas KKA",
        vendedor: available.vendedor,
        placa: available.placa,
        match_type: available.match_type,
      };
    } else if (source === "estoque") {
      // For inventory data
      availableInfo = {
        tipo: available.tipo || "carro",
        marca: available.marca,
        modelo: available.modelo_nome || available.modelo,
        ano: available.anofabricacao || available.anomodelo,
        cor: available.cor,
        carroceria: available.carroceria,
        preco: available.preco,
        fonte: "Estoque KKA",
        placa: available.placa_completa,
        match_type: available.match_type,
        combustivel: available.combustivel,
        cambio: available.cambio,
      };
    } else {
      // For trade matches (original logic)
      availableInfo = {
        tipo: available.tipo || "carro",
        marca: available.marca,
        modelo: available.modelo,
        ano: available.ano,
        cor: available.cor,
        carroceria: available.carroceria,
        fonte: "Troca entre Leads",
      };
    }

    const desiredFormatado = await fipeService.formatarCarro(desiredInfo);
    const availableFormatado =
      source === "historico" || source === "estoque"
        ? availableInfo // Don't format historical/inventory data through FIPE
        : await fipeService.formatarCarro(availableInfo);

    const query = `
      INSERT INTO matches (lead_id, matched_lead_id, desired_info, available_info, source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [
      leadId,
      matchedLeadId, // Will be null for historical/inventory matches
      JSON.stringify(desiredFormatado),
      JSON.stringify(availableFormatado),
      source || "troca",
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
};

// Lista matches que aconteceram
exports.listarTodos = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT m.id, m.match_date, m.source,
             l.nome_do_lead, l.email_do_lead, l.telefone_do_lead,
             m.desired_info, m.available_info
      FROM matches m
      JOIN leads l ON m.lead_id = l.id
      ORDER BY m.match_date DESC
    `);

    return result.rows.map((row) => ({
      id: row.id,
      leadName: row.nome_do_lead,
      leadEmail: row.email_do_lead,
      leadPhone: row.telefone_do_lead,
      desiredVehicle: row.desired_info,
      availableVehicle: row.available_info,
      matchDate: row.match_date,
      source: row.source,
      status: row.status,
    }));
  } finally {
    client.release();
  }
};
