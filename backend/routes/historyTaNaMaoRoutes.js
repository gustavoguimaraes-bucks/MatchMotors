const express = require("express");
const router = express.Router();
const TaNaMaoController = require("../controllers/historyTaNaMaoController");

router.get("/", TaNaMaoController.listar);

module.exports = router;
