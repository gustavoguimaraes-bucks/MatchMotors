const express = require("express");
const router = express.Router();
const ProcuraSeController = require("../controllers/historyProcuraSeController");

router.get("/", ProcuraSeController.listar);

module.exports = router;
