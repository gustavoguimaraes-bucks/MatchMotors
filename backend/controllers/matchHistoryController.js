const matchHistoryService = require('../services/matchHistoryService');

exports.listarMatches = async (req, res) => {
  try {
    const matches = await matchHistoryService.listarTodos();
    res.status(200).json(matches);
  } catch (err) {
    console.error("Erro ao listar histórico de matches:", err);
    res.status(500).json({ error: "Erro ao buscar histórico de matches" });
  }
};
