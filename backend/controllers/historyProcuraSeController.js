const service = require("../services/historyProcuraSeService");

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
    console.error("Erro ao listar Procura-se:", err);
    res.status(500).json({ error: "Erro ao buscar histórico Procura-se" });
  }
};

exports.remover = async (req, res) => {
  try {
    const ok = await service.remover(req.params.id);
    if (!ok) return res.status(404).json({ error: "Registro não encontrado" });
    return res.status(204).end();
  } catch (err) {
    console.error("Erro ao deletar Procura-se:", err);
    res.status(500).json({ error: "Erro ao deletar registro" });
  }
};
