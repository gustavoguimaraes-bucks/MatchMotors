const db = require("../db");
const fipeService = require("./fipeService");

// Extrai apenas o ano numérico de rótulos FIPE como "2013 Gasolina"
const onlyYear = (label) => {
  const m = String(label ?? "").match(/\d{4}/);
  return m ? m[0] : label ?? "-";
};

async function normalizeDesired(row) {
  // Se faltar algo essencial, devolve o original "amigável"
  if (!row.marca || !row.modelo || !row.ano) {
    return {
      marca: row.marca || "-",
      modelo: row.modelo || "-",
      anoInicio: row.ano ? onlyYear(row.ano) : "-",
      anoFim: row.ano ? onlyYear(row.ano) : "-",
      cor: row.cor || "-",
      versao: row.versao || "-",
      combustivel: row.combustivel || "-",
    };
  }

  try {
    // IMPORTANTE: enviamos o código do ano completo (ex.: "2012-1")
    const normalized = await fipeService.formatarCarro({
      tipo: row.tipo || "cars", // se não tiver, cai pra "carro"
      marca: String(row.marca),
      modelo: String(row.modelo),
      ano: String(row.ano), // <— sem split!
    });

    return {
      marca: normalized.marca || row.marca || "-",
      modelo: normalized.modelo || row.modelo || "-",
      // UI mostra faixa; como temos 1 ano, repetimos o ano numérico
      anoInicio: onlyYear(normalized.ano || row.ano),
      anoFim: onlyYear(normalized.ano || row.ano),
      cor: row.cor || "-",
      versao: row.versao || "-",
      combustivel: row.combustivel || "-",
    };
  } catch (err) {
    console.error("Erro na normalização FIPE (procura-se):", err);
    return {
      marca: row.marca || "-",
      modelo: row.modelo || "-",
      anoInicio: row.ano ? onlyYear(row.ano) : "-",
      anoFim: row.ano ? onlyYear(row.ano) : "-",
      cor: row.cor || "-",
      versao: row.versao || "-",
      combustivel: row.combustivel || "-",
    };
  }
}

async function rowToUi(row) {
  return {
    id: row.id,
    lead: {
      nome: row.nome_do_lead,
      email: row.email_do_lead,
      telefone: row.telefone_do_lead,
    },
    veiculoDesejado: await normalizeDesired(row),
    dataConsulta: row.created_at,
    status: "Ativo",
    vendedor: row.vendedor || null,
  };
}

exports.listar = async ({ limit = 50, offset = 0, q }) => {
  const client = await db.connect();
  try {
    const params = [];
    const where = [];

    if (q) {
      params.push(`%${q}%`);
      where.push(`
        (unaccent(l.nome_do_lead) ilike unaccent($${params.length})
         OR l.email_do_lead ilike $${params.length}
         OR l.telefone_do_lead ilike $${params.length})
      `);
    }

    params.push(limit, offset);

    const sql = `
      SELECT 
        cd.id,
        cd.created_at,
        cd.marca,
        cd.modelo, 
        cd.ano,
        cd.cor,
        cd.vendedor,
        l.nome_do_lead,
        l.email_do_lead,
        l.telefone_do_lead
      FROM carros_desejados cd
      JOIN leads l ON cd.lead_id = l.id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY cd.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await client.query(sql, params);
    return await Promise.all(rows.map(rowToUi));
  } finally {
    client.release();
  }
};
