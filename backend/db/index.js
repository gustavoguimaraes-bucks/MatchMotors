require('dotenv').config(); // carrega o .env

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  ssl: false
});

module.exports = pool;