// backend/services/fipeService.js
const axios = require('axios');
const baseURL = 'https://fipe.parallelum.com.br/api/v2';

exports.fetchFromFipe = async (path) => {
  try {
    const response = await axios.get(`${baseURL}/${path}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados da FIPE:', error.message);
    return { error: 'Erro ao buscar dados da FIPE' };
  }
};

exports.formatarCarro = async ({ tipo, marca, modelo, ano }) => {
  const tipoAPI = tipo === 'carro' ? 'cars' : 'motorcycles';

  try {
    const marcas = await exports.fetchFromFipe(`${tipoAPI}/brands`);
    const nomeMarca = marcas.find((m) => m.code === marca)?.name || marca;

    const anos = await exports.fetchFromFipe(`${tipoAPI}/brands/${marca}/years`);
    const nomeAno = anos.find((a) => a.code === ano)?.name || ano;

    const modelos = await exports.fetchFromFipe(`${tipoAPI}/brands/${marca}/years/${ano}/models`);
    const nomeModelo = modelos.find((m) => m.code === modelo)?.name || modelo;

    return {
      tipo,
      marca: nomeMarca,
      modelo: nomeModelo,
      ano: nomeAno,
    };
  } catch (err) {
    console.error('Erro ao formatar carro FIPE:', err.message);
    return { tipo, marca, modelo, ano };
  }
};