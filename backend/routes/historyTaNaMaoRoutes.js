const express = require("express");
const router = express.Router();
const TaNaMaoController = require("../controllers/historyTaNaMaoController");

router.get("/", TaNaMaoController.listar);
router.delete("/:id", TaNaMaoController.remover);

module.exports = router;
