// backend/services/matchService.js
const db = require('../db');

exports.buscarMatchSimples = async (desired) => {
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

    // Remover dados pessoais do objeto do carro
    delete carro.nome_do_lead;
    delete carro.email_do_lead;
    delete carro.telefone_do_lead;

    return { carro, lead };
  } finally {
    client.release();
  }
};
