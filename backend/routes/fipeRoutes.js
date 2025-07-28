// backend/routes/fipeRoutes.js
const express = require('express');
const router = express.Router();
const fipeController = require('../controllers/fipeController');

router.get('/:tipo/brands', fipeController.getMarcas);
router.get('/:tipo/brands/:codigoMarca/years', fipeController.getAnos);
router.get('/:tipo/brands/:codigoMarca/years/:codigoAno/models', fipeController.getModelos);


module.exports = router;