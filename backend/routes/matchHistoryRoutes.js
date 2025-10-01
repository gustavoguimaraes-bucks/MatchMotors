const express = require("express");
const router = express.Router();
const matchHistoryController = require("../controllers/matchHistoryController");

router.get("/", matchHistoryController.listarMatches);
router.post("/", matchHistoryController.inserirMatchNoHistorico);
router.delete("/:id", matchHistoryController.remover);

module.exports = router;
