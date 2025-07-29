const leadsService = require('../services/leadsService');

// Controlador que recebe a requisição e chama o serviço
exports.criarLead = async (req, res) => {
  try {
    const resultado = await leadsService.inserirLeadCompleto(req.body);
    res.status(201).json(resultado); // Retorna o que foi inserido
  } catch (error) {
    console.error('Erro ao criar lead:', error.message);
    res.status(500).json({ erro: 'Erro ao criar lead' });
  }
};
