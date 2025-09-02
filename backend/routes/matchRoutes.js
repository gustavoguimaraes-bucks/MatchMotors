const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// Rota principal - busca completa (estoque + troca)
router.post('/', matchController.buscarMatch);

// Rota específica para buscar apenas no estoque
router.post('/estoque', matchController.buscarMatchEstoque);

// Rota para busca avançada/flexível
router.post('/avancado', matchController.buscarMatchAvancado);

module.exports = router;