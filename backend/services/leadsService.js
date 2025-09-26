const db = require("../db");

// Serviço que insere o lead e os carros no banco
exports.inserirLeadCompleto = async (data) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN"); // Inicia transação

    // 1. Inserir lead
    const insertLead = `
      INSERT INTO leads (nome_do_lead, email_do_lead, telefone_do_lead)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const leadResult = await client.query(insertLead, [
      data.nome,
      data.email,
      data.telefone,
    ]);
    const leadId = leadResult.rows[0].id;

    // Guards mínimos (evita linha "em branco")
    const hasDesired =
      data.desired &&
      data.desired.desiredBrand &&
      data.desired.desiredModel &&
      data.desired.desiredYear;
    const hasCurrent =
      data.current &&
      data.current.currentBrand &&
      data.current.currentModel &&
      data.current.currentYear;

    // 2) Inserir carro desejado (se houver)
    if (hasDesired) {
      const insertDesejado = `
        INSERT INTO carros_desejados
          (lead_id, marca, modelo, ano, cor, carroceria, vendedor)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(insertDesejado, [
        leadId,
        data.desired.desiredBrand,
        data.desired.desiredModel,
        data.desired.desiredYear, // manter código FIPE completo "2012-1"
        data.desired.desiredColor || null,
        data.desired.desiredCarroceria || null,
        data.desired.vendedor_responsavel || null, // <- PEGA DO BLOCO
      ]);
    }

    // 3. Inserir carro na troca (se enviado)
    if (hasCurrent) {
      const insertTroca = `
        INSERT INTO carros_troca (lead_id, marca, modelo, ano, cor, carroceria, vendedor)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(insertTroca, [
        leadId,
        data.current.currentBrand,
        data.current.currentModel,
        data.current.currentYear,
        data.current.currentColor,
        data.current.currentCarroceria,
        data.current.vendedor_responsavel || null,
      ]);
    }

    await client.query("COMMIT"); // Confirma transação
    return { status: "ok", leadId };
  } catch (error) {
    await client.query("ROLLBACK"); // Reverte em caso de erro
    throw error;
  } finally {
    client.release(); // Libera conexão
  }
};
