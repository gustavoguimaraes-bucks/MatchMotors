const service = require("../services/historyTaNaMaoService");

exports.listar = async (req, res) => {
  try {
    const { limit = 50, offset = 0, q } = req.query;
    const data = await service.listar({
      limit: Number(limit),
      offset: Number(offset),
      q,
    });
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao listar Tá na Mão:", err);
    res.status(500).json({ error: "Erro ao buscar histórico Tá na Mão" });
  }
};
