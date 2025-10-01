const db = require("../db");

// Serviço que insere o lead e os carros no banco
exports.inserirLeadCompleto = async (data) => {
  const client = await db.connect();

  const toNumberOrNull = (s) => {
    if (!s && s !== 0) return null;
    const n = Number(
      String(s)
        .replace(/[^\d,.-]/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".")
    );
    return Number.isFinite(n) ? n : null;
  };
  const composeKmRange = (min, max) => {
    const a = (min ?? "").toString().trim();
    const b = (max ?? "").toString().trim();
    if (!a && !b) return null;
    return a && b ? `${a} - ${b}` : a || b;
  };

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
          (lead_id, marca, modelo, ano, cor, km, preco_min, preco_max, carroceria, vendedor)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      await client.query(insertDesejado, [
        leadId,
        data.desired.desiredBrand,
        data.desired.desiredModel,
        data.desired.desiredYear,
        data.desired.desiredColor || null,
        data.desired.desiredKmMax,
        toNumberOrNull(data.desired.desiredPriceMin),
        toNumberOrNull(data.desired.desiredPriceMax),
        data.desired.desiredCarroceria || null,
        data.desired.vendedor_responsavel || null,
      ]);
    }

    // 3. Inserir carro na troca (se enviado)
    if (hasCurrent) {
      const insertTroca = `
        INSERT INTO carros_troca (lead_id, marca, modelo, ano, cor, km, preco_estimado, carroceria, vendedor)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )
      `;
      await client.query(insertTroca, [
        leadId,
        data.current.currentBrand,
        data.current.currentModel,
        data.current.currentYear,
        data.current.currentColor,
        toNumberOrNull(data.current.currentKm),
        toNumberOrNull(data.current.currentPrice),
        data.current.currentCarroceria || null,
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
