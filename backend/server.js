// backend/index.js
const express = require('express');
const cors = require('cors');
const fipeRoutes = require('./routes/fipeRoutes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/fipe', fipeRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
