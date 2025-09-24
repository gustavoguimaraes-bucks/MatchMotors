// backend/services/fipeService.js
const axios = require("axios");

const baseURL = "https://fipe.parallelum.com.br/api/v2";

// --- helpers ---
const toArray = (resp, altKeys = []) => {
  // resp pode ser: array | { models: [...] } | { modelos: [...] } | { data: [...] } | { ... } | null
  if (Array.isArray(resp)) return resp;
  if (resp && typeof resp === "object") {
    for (const k of [
      "models",
      "modelos",
      "brands",
      "marcas",
      "years",
      "anos",
      "data",
      ...altKeys,
    ]) {
      if (Array.isArray(resp[k])) return resp[k];
    }
  }
  return []; // fallback seguro
};

const sameCode = (a, b) => String(a) === String(b);

const pickNameByCode = (list, code, nameKey = "name", codeKey = "code") => {
  const found = list.find((x) => sameCode(x?.[codeKey], code));
  return found?.[nameKey] ?? code;
};

// Alguns anos vêm "2013-1" (gasolina) / "2013-2" (álcool) etc. Se quiser só o rótulo da FIPE:
const getYearLabel = (list, code) => {
  const found = list.find((x) => sameCode(x?.code, code));
  // A FIPE normalmente devolve algo como { code: "2013-1", name: "2013 Gasolina" }
  return found?.name ?? code;
};

// GET com normalização e fallback
const getFipe = async (path, altKeys = []) => {
  try {
    const { data } = await axios.get(`${baseURL}/${path}`, { timeout: 12000 });
    return toArray(data, altKeys);
  } catch (error) {
    // Loga com contexto do path para depuração
    console.error(
      `FIPE GET FAIL [${path}]:`,
      error?.response?.status || error?.code || error?.message
    );
    return []; // devolve array vazio para não quebrar .find/.map
  }
};

// --- API pública ---
exports.fetchFromFipe = async (path) => {
  // Mantém compatibilidade com seu código existente, mas já normaliza para array ou objeto “cru” caso seja útil.
  try {
    const { data } = await axios.get(`${baseURL}/${path}`, { timeout: 12000 });
    return data;
  } catch (error) {
    console.error(
      "Erro ao buscar dados da FIPE:",
      error?.response?.status || error?.message
    );
    // Importante: não retorne { error } aqui, pois isso quebra quem espera array
    return null; // deixa o caller decidir o fallback
  }
};

exports.formatarCarro = async ({ tipo, marca, modelo, ano }) => {
  // Guarda de parâmetros para evitar 400 na FIPE
  if (!tipo || !marca || !ano || !modelo) {
    console.warn("formatarCarro: parâmetros incompletos", {
      tipo,
      marca,
      ano,
      modelo,
    });
    return { tipo, marca, modelo, ano }; // devolve “cru”, sem chamar a FIPE
  }

  // A FIPE usa 'cars' e 'motorcycles'
  const tipoAPI =
    tipo === "moto" || tipo === "motorcycle" ? "motorcycles" : "cars";

  try {
    // 1) Marcas
    // Obs: getFipe já volta array (ou []) mesmo em erro
    const brandsRaw = await getFipe(`${tipoAPI}/brands`, ["brands", "marcas"]);
    const nomeMarca = pickNameByCode(brandsRaw, marca, "name", "code");

    // 2) Anos (para uma marca)
    const yearsRaw = await getFipe(`${tipoAPI}/brands/${marca}/years`, [
      "years",
      "anos",
    ]);
    const nomeAno = getYearLabel(yearsRaw, ano);

    // 3) Modelos (para marca + ano)
    const modelsRaw = await getFipe(
      `${tipoAPI}/brands/${marca}/years/${ano}/models`,
      ["models", "modelos"]
    );
    const nomeModelo = pickNameByCode(modelsRaw, modelo, "name", "code");

    return {
      tipo: tipo === "moto" ? "moto" : "carro",
      marca: nomeMarca,
      modelo: nomeModelo,
      ano: nomeAno,
    };
  } catch (err) {
    console.error("Erro ao formatar carro FIPE:", err?.message || err);
    // Fallback seguro (nunca lança para não derrubar o fluxo do match)
    return { tipo, marca, modelo, ano };
  }
};
