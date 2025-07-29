const db = require('../db');

// Serviço que insere o lead e os carros no banco
exports.inserirLeadCompleto = async (data) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN'); // Inicia transação

    // 1. Inserir lead
    const insertLead = `
      INSERT INTO leads (nome, email, telefone)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const leadResult = await client.query(insertLead, [
      data.nome,
      data.email,
      data.telefone,
    ]);
    const leadId = leadResult.rows[0].id;

    // 2. Inserir carro desejado
    const insertDesejado = `
      INSERT INTO carros_desejados (lead_id, marca, modelo, ano, cor, carroceria)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(insertDesejado, [
      leadId,
      data.desejado.marca,
      data.desejado.modelo,
      data.desejado.ano,
      data.desejado.cor,
      data.desejado.carroceria,
    ]);

    // 3. Inserir carro na troca (se enviado)
    if (data.troca) {
      const insertTroca = `
        INSERT INTO carros_troca (lead_id, marca, modelo, ano, cor, carroceria)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(insertTroca, [
        leadId,
        data.troca.marca,
        data.troca.modelo,
        data.troca.ano,
        data.troca.cor,
        data.troca.carroceria,
      ]);
    }

    await client.query('COMMIT'); // Confirma transação
    return { status: 'ok', leadId };

  } catch (error) {
    await client.query('ROLLBACK'); // Reverte em caso de erro
    throw error;
  } finally {
    client.release(); // Libera conexão
  }
};
