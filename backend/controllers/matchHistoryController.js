const matchHistoryService = require("../services/matchHistoryService");

exports.listarMatches = async (req, res) => {
  try {
    const matches = await matchHistoryService.listarTodos();
    res.status(200).json(matches);
  } catch (err) {
    console.error("Erro ao listar histórico de matches:", err);
    res.status(500).json({ error: "Erro ao buscar histórico de matches" });
  }
};

  exports.inserirMatchNoHistorico = async (req, res) => {
    try {
      const { leadId, matchedLeadId, desired, available } = req.body;

      if (!leadId || !matchedLeadId || !desired || !available) {
        return res
          .status(400)
          .json({ error: "Dados incompletos para salvar match." });
      }

      const result = await matchHistoryService.salvarMatch({
        leadId,
        matchedLeadId,
        desired,
        available,
      });

      res
        .status(201)
        .json({ message: "Match salvo com sucesso!", id: result.id });
    } catch (error) {
      console.error("Erro ao salvar match no histórico:", error);
      res.status(500).json({ error: "Erro interno ao salvar match." });
    }
  };
