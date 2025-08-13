const db = require("../db");
const fipeService = require("./fipeService");

//Insere matches na tabela do banco de dados
exports.salvarMatch = async ({ leadId, matchedLeadId, desired, available }) => {
  const client = await db.connect();

  try {
    // Define os campos específicos para salvar (ajuste conforme sua estrutura do Form)
    const desiredInfo = {
      tipo: desired.desiredType,
      marca: desired.desiredBrand,
      modelo: desired.desiredModel,
      ano: desired.desiredYear,
      cor: desired.desiredColor,
      carroceria: desired.desiredCarroceria,
    };

    const availableInfo = {
      tipo: available.tipo || "carro", // ou "moto" — adicione isso no back se necessário
      marca: available.marca,
      modelo: available.modelo,
      ano: available.ano,
      cor: available.cor,
      carroceria: available.carroceria,
    };

    const desiredFormatado = await fipeService.formatarCarro(desiredInfo);
    const availableFormatado = await fipeService.formatarCarro(availableInfo);

    const query = `
      INSERT INTO matches (lead_id, matched_lead_id, desired_info, available_info)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const values = [
      leadId,
      matchedLeadId,
      JSON.stringify(desiredFormatado),
      JSON.stringify(availableFormatado),
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
      SELECT m.id, m.match_date,
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
      status: row.status,
    }));
  } finally {
    client.release();
  }
};
