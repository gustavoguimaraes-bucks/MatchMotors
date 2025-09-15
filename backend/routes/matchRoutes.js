const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

// Rota principal - busca completa (estoque + troca)
router.post("/", matchController.buscarMatch);

module.exports = router;
