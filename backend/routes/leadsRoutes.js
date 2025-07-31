const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leadsController');

// Rota para inserir um novo lead
router.post('/', leadsController.createLead);

module.exports = router;