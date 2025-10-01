const db = require("../db");
const fipeService = require("./fipeService");

const onlyYear = (label) => {
  const m = String(label ?? "").match(/\d{4}/);
  return m ? m[0] : label ?? "-";
};

async function normalizeCurrent(row) {
  // Se faltar algo essencial, devolve os códigos com fallback
  if (!row.marca || !row.modelo || !row.ano) {
    return {
      marca: row.marca || "-",
      modelo: row.modelo || "-",
      ano: row.ano ? onlyYear(row.ano) : "-",
      cor: row.cor || "-",
      versao: row.versao || "-",
      combustivel: row.combustivel || "-",
      km: row.km || "-",
      preco: row.preco || "-",
    };
  }

  try {
    const normalized = await fipeService.formatarCarro({
      tipo: row.tipo || "cars",
      marca: String(row.marca),
      modelo: String(row.modelo),
      ano: String(row.ano), // usa o código completo "2012-1"
    });

    return {
      marca: normalized.marca || row.marca || "-",
      modelo: normalized.modelo || row.modelo || "-",
      ano: onlyYear(normalized.ano || row.ano),
      cor: row.cor || "-",
      versao: row.versao || "-",
      combustivel: row.combustivel || "-",
      km: row.km || "-",
      preco: row.preco || "-",
    };
  } catch (err) {
    console.error("Erro na normalização FIPE (tá-na-mão):", err);
    return {
      marca: row.marca || "-",
      modelo: row.modelo || "-",
      ano: row.ano ? onlyYear(row.ano) : "-",
      cor: row.cor || "-",
      versao: row.versao || "-",
      combustivel: row.combustivel || "-",
      km: row.km || "-",
      preco: row.preco || "-",
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
    veiculoOfertado: await normalizeCurrent(row),
    dataConsulta: row.created_at,
    status: "Disponível",
    vendedor: row.vendedor,
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
        ct.id,
        ct.created_at,
        ct.marca,
        ct.modelo,
        ct.ano,
        ct.cor,
        ct.vendedor,
        l.nome_do_lead,
        l.email_do_lead,
        l.telefone_do_lead
      FROM carros_troca ct
      JOIN leads l ON ct.lead_id = l.id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY ct.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await client.query(sql, params);
    return await Promise.all(rows.map(rowToUi));
  } finally {
    client.release();
  }
};

exports.remover = async (id) => {
  const client = await db.connect();
  try {
    const { rowCount } = await client.query(
      "DELETE FROM carros_troca WHERE id = $1",
      [id]
    );
    return rowCount > 0;
  } finally {
    client.release();
  }
};
