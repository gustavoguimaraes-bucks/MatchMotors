// backend/controllers/fipeController.js
const fipeService = require('../services/fipeService');

exports.getMarcas = async (req, res) => {
  const { tipo } = req.params;
  const data = await fipeService.fetchFromFipe(`${tipo}/brands`);
  res.json(data);
};

exports.getAnos = async (req, res) => {
  const { tipo, codigoMarca } = req.params;
  const data = await fipeService.fetchFromFipe(`${tipo}/brands/${codigoMarca}/years`);
  res.json(data);
};

exports.getModelos = async (req, res) => {
  const { tipo, codigoMarca, codigoAno } = req.params;
  const data = await fipeService.fetchFromFipe(`${tipo}/brands/${codigoMarca}/years/${codigoAno}/models`);
  res.json(data);
};