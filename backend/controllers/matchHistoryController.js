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
    const {
      leadId,
      matchedLeadId,
      desired,
      available,
      source,
      vendedor_responsavel,
    } = req.body;

    if (!leadId || !desired || !available) {
      return res
        .status(400)
        .json({ error: "Dados incompletos para salvar match." });
    }

    // For historical and inventory matches, matchedLeadId can be null
    // For trade matches, matchedLeadId is required
    if (source === "troca" && !matchedLeadId) {
      return res
        .status(400)
        .json({ error: "matchedLeadId é obrigatório para matches de troca." });
    }

    const result = await matchHistoryService.salvarMatch({
      leadId,
      matchedLeadId: matchedLeadId || null, // Allow null for non-trade matches
      desired,
      available,
      source: source || "troca",
      vendedor_responsavel,
    });

    res
      .status(201)
      .json({ message: "Match salvo com sucesso!", id: result.id });
  } catch (error) {
    console.error("Erro ao salvar match no histórico:", error);
    res.status(500).json({ error: "Erro interno ao salvar match." });
  }
};

exports.remover = async (req, res) => {
  try {
    const ok = await matchHistoryService.remover(req.params.id);
    if (!ok) return res.status(404).json({ error: "Match não encontrado" });
    return res.status(204).end();
  } catch (err) {
    console.error("Erro ao deletar match:", err);
    res.status(500).json({ error: "Erro ao deletar match" });
  }
};
