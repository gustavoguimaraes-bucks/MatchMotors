const estoqueService = require("../services/estoqueService");

exports.listar = async (req, res) => {
  try {
    const { q, limit, offset } = req.query;
    const data = await estoqueService.listar({
      q,
      limit: Number(limit) || 100,
      offset: Number(offset) || 0,
    });
    res.json(data);
  } catch (err) {
    console.error("Erro ao listar estoque:", err);
    res.status(500).json({ error: "Falha ao listar estoque" });
  }
};
