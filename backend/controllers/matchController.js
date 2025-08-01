// backend/controllers/matchController.js
const matchService = require('../services/matchService');

exports.buscarMatch = async (req, res) => {
  try {
    const { desired } = req.body;

    if (!desired || !desired.desiredBrand || !desired.desiredModel || !desired.desiredYear) {
      return res.status(400).json({ error: 'Parâmetros de busca incompletos.' });
    }

    const match = await matchService.buscarMatchSimples(desired);

    if (match) {
      res.status(200).json({
        found: true,
        carro: match.carro,
        lead: match.lead,
      });
    } else {
      res.status(200).json({ found: false });
    }
  } catch (error) {
    console.error("Erro ao buscar match:", error);
    res.status(500).json({ error: "Erro interno ao buscar match." });
  }
};