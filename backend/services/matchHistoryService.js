const db = require('../db');

exports.salvarMatch = async ({ leadId, matchedLeadId, desired, available }) => {
  const client = await db.connect();

  try {
    const query = `
      INSERT INTO matches (lead_id, matched_lead_id, desired_info, available_info)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const values = [
      leadId,
      matchedLeadId,
      JSON.stringify(desired),
      JSON.stringify(available),
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
};

exports.listarTodos = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT m.id, m.status, m.match_date,
             l.nome_do_lead, l.email_do_lead, l.telefone_do_lead,
             m.desired_info, m.available_info
      FROM matches m
      JOIN leads l ON m.lead_id = l.id
      ORDER BY m.match_date DESC
    `);

    return result.rows.map(row => ({
      id: row.id,
      leadName: row.nome_do_lead,
      leadEmail: row.email_do_lead,
      leadPhone: row.telefone_do_lead,
      desiredVehicle: row.desired_info,
      availableVehicle: row.available_info,
      matchDate: row.match_date,
      status: row.status
    }));
  } finally {
    client.release();
  }
};
