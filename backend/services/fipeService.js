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