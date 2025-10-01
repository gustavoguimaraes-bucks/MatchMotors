const db = require("../db");
const fipeService = require("./fipeService");
const webhookService = require("./webhookService");

//Insere matches na tabela do banco de dados
exports.salvarMatch = async ({
  leadId,
  matchedLeadId,
  desired,
  available,
  source,
  vendedor_responsavel,
}) => {
  const client = await db.connect();

  try {
    console.log("=== SALVANDO MATCH ===");
    console.log("Source:", source);
    console.log("Lead ID:", leadId);
    console.log("Matched Lead ID:", matchedLeadId);
    console.log("Vendedor Responsável:", vendedor_responsavel);
    console.log("Desired data:", JSON.stringify(desired, null, 2));
    console.log("Available data:", JSON.stringify(available, null, 2));

    const desiredInfo = {
      tipo: desired.desiredType,
      marca: desired.desiredBrand,
      modelo: desired.desiredModel,
      ano: desired.desiredYear,
      cor: desired.desiredColor,
      carroceria: desired.desiredCarroceria,
    };

    console.log(
      "Desired info formatted:",
      JSON.stringify(desiredInfo, null, 2)
    );

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
    } else if (source === "reverse_match") {
      // For reverse matches (when a "tá na mão" matches an existing "procura-se")
      availableInfo = {
        tipo: available.tipo || "carro",
        marca: available.marca,
        modelo: available.modelo,
        ano: available.ano,
        cor: available.cor,
        carroceria: available.carroceria,
        preco: available.preco,
        fonte: "Match Reverso (Tá na Mão -> Procura-se)",
        km: available.km,
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
      INSERT INTO matches (lead_id, matched_lead_id, desired_info, available_info, source, vendedor_responsavel)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const values = [
      leadId,
      matchedLeadId, // Will be null for historical/inventory matches
      JSON.stringify(desiredFormatado),
      JSON.stringify(availableFormatado),
      source || "troca",
      vendedor_responsavel,
    ];

    const result = await client.query(query, values);
    const matchRow = result.rows[0];

    // --- Buscar infos dos leads para o webhook ---
    const leadQry = `SELECT id, nome_do_lead, email_do_lead, telefone_do_lead FROM leads WHERE id = $1`;
    const leadA = await client.query(leadQry, [leadId]);
    const leadDesejaRaw = leadA.rows[0] || null;

    let leadTemRaw = null;
    if (matchedLeadId) {
      const leadB = await client.query(leadQry, [matchedLeadId]);
      leadTemRaw = leadB.rows[0] || null;
    }

    const isTroca = !source || source === "troca";
    const isReverse = source === "reverse_match";
    const isEstoque = source === "estoque";
    const isHistorico = source === "historico";

    const leadQueDeseja = isReverse ? leadTemRaw : leadDesejaRaw;
    const leadQueTem = isReverse ? leadDesejaRaw : leadTemRaw; // pode ser null p/ estoque/histórico

    // Flags pedidas
    const flags = {
      origem: source || "troca",
      is_carros_troca: isTroca || isReverse, // veio de carros_troca
      is_estoque: isEstoque, // veio do estoque
      is_vendas_historicas: isHistorico, // veio de vendas históricas
    };

    // Payload para o n8n
    const payload = {
      tipo: "match",
      match: {
        id: matchRow.id,
        date: new Date().toISOString(),
        source: flags.origem,
        vendedor_responsavel,
      },
      // Quem deseja o carro (sempre inclui o veículo desejado formatado)
      lead_deseja: leadQueDeseja
        ? {
            id: leadQueDeseja.id,
            nome: leadQueDeseja.nome_do_lead,
            email: leadQueDeseja.email_do_lead,
            telefone: leadQueDeseja.telefone_do_lead,
          }
        : null,
      veiculo_desejado: desiredFormatado, // já foi normalizado por FIPE quando aplicável

      // Quem tem o carro: se for troca/reverse_match e existir matchedLeadId, manda a pessoa;
      // se for estoque/histórico, manda apenas a "fonte" e o veículo disponível.
      lead_tem: leadQueTem
        ? {
            id: leadQueTem.id,
            nome: leadQueTem.nome_do_lead,
            email: leadQueTem.email_do_lead,
            telefone: leadQueTem.telefone_do_lead,
          }
        : isEstoque || isHistorico
        ? {
            fonte:
              availableFormatado?.fonte ||
              (isEstoque ? "Estoque" : "Histórico de Vendas"),
          }
        : null,
      veiculo_disponivel: availableFormatado,

      flags,
    };

    // Disparar webhook (não bloqueia a resposta do endpoint que chamou o service)
    webhookService
      .sendMatch(payload)
      .catch((e) =>
        console.error("Erro ao enviar webhook de match:", e?.message)
      );

    return matchRow;
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
             m.vendedor_responsavel,
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
      vendedorResponsavel: row.vendedor_responsavel,
      status: row.status,
    }));
  } finally {
    client.release();
  }
};

exports.remover = async (id) => {
  const client = await db.connect();
  try {
    const { rowCount } = await client.query(
      "DELETE FROM matches WHERE id = $1",
      [id]
    );
    return rowCount > 0;
  } finally {
    client.release();
  }
};
