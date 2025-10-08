const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();
const leadsRoutes = require("./routes/leadsRoutes");
const fipeRoutes = require("./routes/fipeRoutes");
const matchRoutes = require("./routes/matchRoutes");
const matchHistoryRoutes = require("./routes/matchHistoryRoutes");
const authRoutes = require("./routes/authRoutes");
const procuraSeRoutes = require("./routes/historyProcuraSeRoutes");
const taNaMaoRoutes = require("./routes/historyTaNaMaoRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");

const app = express();

// CORS configurado para aceitar requisições de qualquer origem
app.use(
  cors({
    origin: [
      "https://matchmotors.site",
      "http://localhost:8080",
      "https://formulario.kikoautos.com.br",
      "http://formulario.kikoautos.com.br/",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Rotas da API
app.use("/api/leads", leadsRoutes);
app.use("/api/fipe", fipeRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/matches", matchHistoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history/procura-se", procuraSeRoutes);
app.use("/api/history/ta-na-mao", taNaMaoRoutes);
app.use("/estoque", estoqueRoutes);

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Conexão bem-sucedida!", hora: result.rows[0].now });
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
    res.status(500).json({ error: "Erro ao conectar no banco de dados" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
