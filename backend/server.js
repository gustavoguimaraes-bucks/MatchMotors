const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Importa a conexão com o banco
require('dotenv').config();
const leadsRoutes = require('./routes/leadsRoutes');
const fipeRoutes = require('./routes/fipeRoutes')


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/leads', leadsRoutes);
app.use('/api/fipe', fipeRoutes);

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Conexão bem-sucedida!', hora: result.rows[0].now });
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
    res.status(500).json({ error: 'Erro ao conectar no banco de dados' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
