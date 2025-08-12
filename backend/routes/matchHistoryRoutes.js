const express = require('express');
const router = express.Router();
const matchHistoryController = require('../controllers/matchHistoryController');

router.get('/', matchHistoryController.listarMatches);

module.exports = router;