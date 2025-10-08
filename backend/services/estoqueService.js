const db = require("../db");

// Ajuste aqui se o nome da tabela tiver espaço:
const TABLE_NAME = `estoque_kka`; // ou `"estoque kka"` se for com espaço

exports.listar = async ({ limit = 100, offset = 0, q }) => {
  const client = await db.connect();
  try {
    const params = [];
    const where = [];

    if (q) {
      params.push(`%${q}%`);
      where.push(`(
        unaccent(marca) ILIKE unaccent($${params.length})
        OR unaccent(modelo_nome) ILIKE unaccent($${params.length})
        OR placa_completa ILIKE $${params.length}
      )`);
    }

    params.push(limit);
    params.push(offset);

    const sql = `
      SELECT 
        id,
        placa_completa,
        carroceria, carroceria_id,
        combustivel,
        cor,
        tipo, tipo_id,
        marca, marca_id,
        modelo_id, modelo_nome,
        cambio,
        anofabricacao, anomodelo,
        preco
      FROM ${TABLE_NAME}
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY anomodelo DESC, marca ASC, modelo_nome ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await client.query(sql, params);

    // Mapeia para o shape que o front espera
    return rows.map((r) => ({
      id: r.id,
      placa: r.placa_completa,
      marca: r.marca,
      modelo: r.modelo_nome,
      carroceria: r.carroceria,
      combustivel: r.combustivel,
      cor: r.cor,
      tipo: r.tipo,
      cambio: r.cambio,
      anoFabricacao: r.anofabricacao,
      anoModelo: r.anomodelo,
      preco: r.preco, // envia número; o front formata em BRL
    }));
  } finally {
    client.release();
  }
};
