// backend/services/webhookService.js
const axios = require("axios");

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_URL_MATCH = process.env.WEBHOOK_URL_MATCH;

function hasMeaningful(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}
function hasDesiredData(desired) {
  if (!desired) return false;
  const { desiredBrand, desiredModel, desiredYear } = desired;
  return [desiredBrand, desiredModel, desiredYear].every(hasMeaningful);
}
function hasCurrentData(current) {
  if (!current) return false;
  const { currentBrand, currentModel, currentYear } = current;
  return [currentBrand, currentModel, currentYear].every(hasMeaningful);
}

exports.sendLead = async ({ leadId, lead, desired, current }) => {
  if (!WEBHOOK_URL) {
    console.warn("WEBHOOK não configurado. Pulando envio ao n8n.");
    return;
  }

  exports.sendMatch = async (payload) => {
    if (!WEBHOOK_URL_MATCH) {
      console.warn("WEBHOOK não configurado. Pulando envio do match ao n8n.");
      return;
    }
    try {
      await axios.post(WEBHOOK_URL_MATCH, payload, {
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      });
      console.log("Webhook n8n (match) enviado com sucesso.");
    } catch (err) {
      console.error(
        "Falha ao enviar webhook n8n (match):",
        err?.response?.status || err?.message
      );
    }
  };

  const payload = {
    lead: {
      id: leadId,
      nome: lead?.leadName ?? null,
      email: lead?.leadEmail ?? null,
      telefone: lead?.leadPhone ?? null,
    },
    desired: hasDesiredData(desired)
      ? {
          tipo: desired.desiredType ?? null,
          marca: desired.desiredBrand ?? null,
          modelo: desired.desiredModel ?? null,
          ano: desired.desiredYear ?? null,
          cor: desired.desiredColor ?? null,
          carroceria: desired.desiredCarroceria ?? null,
          condicao: desired.desiredCondition ?? null,
          blindagem: desired.desiredBlindagem ?? null,
          km_min: desired.desiredKmMin ?? null,
          km_max: desired.desiredKmMax ?? null,
          preco_min: desired.desiredPriceMin ?? null,
          preco_max: desired.desiredPriceMax ?? null,
          observacoes: desired.desiredObservations ?? null,
          vendedor_responsavel: desired.vendedor_responsavel ?? null,
        }
      : null,
    current: hasCurrentData(current)
      ? {
          tipo: current.currentType ?? null,
          marca: current.currentBrand ?? null,
          modelo: current.currentModel ?? null,
          ano: current.currentYear ?? null,
          cor: current.currentColor ?? null,
          carroceria: current.currentCarroceria ?? null,
          condicao: current.currentCondition ?? null,
          blindagem: current.currentBlindagem ?? null,
          km: current.currentKm ?? null,
          preco: current.currentPrice ?? null,
          observacoes: current.currentObservations ?? null,
          vendedor_responsavel: current.vendedor_responsavel ?? null,
        }
      : null,
    meta: {
      source: "site",
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await axios.post(WEBHOOK_URL, payload, {
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    console.log("Webhook n8n enviado com sucesso.");
  } catch (err) {
    // Não derruba o fluxo principal; apenas loga
    console.error(
      "Falha ao enviar webhook n8n:",
      err?.response?.status || err?.message
    );
  }
};
