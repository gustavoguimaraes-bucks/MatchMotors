// backend/controllers/matchController.js
const matchService = require('../services/matchService');

exports.buscarMatch = async (req, res) => {
  try {
    const { desired } = req.body;

    if (!desired || !desired.desiredBrand || !desired.desiredModel || !desired.desiredYear) {
      return res.status(400).json({ error: 'Parâmetros de busca incompletos.' });
    }

    // Usa a nova função de match completo
    const match = await matchService.buscarMatchCompleto(desired);

    if (match.found) {
      res.status(200).json({
        found: true,
        source: match.source, // 'estoque' ou 'troca'
        carro: match.carro,
        lead: match.lead || null, // Lead só existe para matches de troca
        tipo: match.tipo
      });
    } else {
      res.status(200).json({ found: false });
    }
  } catch (error) {
    console.error("Erro ao buscar match:", error);
    res.status(500).json({ error: "Erro interno ao buscar match." });
  }
};

// Endpoint específico para buscar apenas no estoque
exports.buscarMatchEstoque = async (req, res) => {
  try {
    const { desired } = req.body;

    if (!desired || !desired.desiredBrand || !desired.desiredModel || !desired.desiredYear) {
      return res.status(400).json({ error: 'Parâmetros de busca incompletos.' });
    }

    const match = await matchService.buscarMatchEstoque(desired);

    if (match) {
      res.status(200).json({
        found: true,
        source: 'estoque',
        carro: match.carro,
        tipo: match.tipo
      });
    } else {
      res.status(200).json({ found: false });
    }
  } catch (error) {
    console.error("Erro ao buscar match no estoque:", error);
    res.status(500).json({ error: "Erro interno ao buscar match no estoque." });
  }
};

// Endpoint para busca com critérios avançados
exports.buscarMatchAvancado = async (req, res) => {
  try {
    const { desired } = req.body;

    if (!desired || !desired.desiredBrand || !desired.desiredModel || !desired.desiredYear) {
      return res.status(400).json({ error: 'Parâmetros de busca incompletos.' });
    }

    const match = await matchService.buscarMatchAvancado(desired);

    if (match.found) {
      res.status(200).json({
        found: true,
        source: match.source,
        carro: match.carro,
        lead: match.lead || null,
        tipo: match.tipo,
        matchType: 'avançado' // Identifica que foi um match flexível
      });
    } else {
      res.status(200).json({ found: false });
    }
  } catch (error) {
    console.error("Erro ao buscar match avançado:", error);
    res.status(500).json({ error: "Erro interno ao buscar match avançado." });
  }
};