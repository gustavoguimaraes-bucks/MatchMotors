const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();
const leadsRoutes = require("./routes/leadsRoutes");
const fipeRoutes = require("./routes/fipeRoutes");
const matchRoutes = require("./routes/matchRoutes");
const matchHistoryRoutes = require("./routes/matchHistoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// CORS configurado para aceitar requisições de qualquer origem
app.use(
  cors({
    origin: ["https://matchmotors.site", "http://localhost:8080"],
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
