const express = require("express");
const router = express.Router();
const ProcuraSeController = require("../controllers/historyProcuraSeController");

router.get("/", ProcuraSeController.listar);
router.delete("/:id", ProcuraSeController.remover);

module.exports = router;
