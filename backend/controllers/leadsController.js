const leadsService = require("../services/leadsService");
const matchService = require("../services/matchService");
const matchHistoryService = require("../services/matchHistoryService");
const webhookService = require("../services/webhookService");

exports.createLead = async (req, res) => {
  try {
    const { lead, desired, current } = req.body;

    const result = await leadsService.inserirLeadCompleto({
      nome: lead.leadName,
      email: lead.leadEmail,
      telefone: lead.leadPhone,
      desired: desired,
      current: current,
    });

    try {
      await webhookService.sendLead({
        leadId: result.leadId,
        lead,
        desired,
        current,
      });
    } catch (whErr) {
      // Segurança: não quebra a resposta ao cliente
      console.error("Erro ao enviar webhook n8n:", whErr);
    }

    let reverseMatch = null;
    // Se um carro "Tá na Mão" (current) foi cadastrado, procure por um match reverso.
    if (current && current.currentBrand) {
      reverseMatch = await matchService.buscarMatchParaTaNaMao(current);

      // Se encontrou um match reverso, salva na tabela matches
      if (reverseMatch && reverseMatch.found) {
        try {
          console.log("=== PROCESSANDO MATCH REVERSO ===");
          console.log("Lead desejado encontrado:", reverseMatch.lead);

          // Normaliza os dados do veículo atual para o formato esperado
          const normalizedCurrent = {
            tipo: current.currentType || "carro",
            marca: current.currentBrand,
            modelo: current.currentModel,
            ano: current.currentYear,
            cor: current.currentColor,
            carroceria: current.currentCarroceria,
            preco: current.currentPrice,
            km: current.currentKm,
            observacoes: current.currentObservations,
          };

          const leadDesejado = reverseMatch.lead;
          const db = require("../db");
          const client = await db.connect();

          try {
            // Buscar o ID do lead que estava procurando
            const queryLeadId = `
              SELECT id FROM leads 
              WHERE nome_do_lead = $1 AND email_do_lead = $2 AND telefone_do_lead = $3
              LIMIT 1
            `;

            const leadResult = await client.query(queryLeadId, [
              leadDesejado.nome,
              leadDesejado.email,
              leadDesejado.telefone,
            ]);

            if (leadResult.rows.length === 0) {
              console.log(
                "❌ Lead desejado não encontrado para salvar match reverso"
              );
              return; // Sai apenas deste bloco try/catch interno
            }

            const matchedLeadId = leadResult.rows[0].id;
            console.log("✅ Lead ID encontrado:", matchedLeadId);

            // Buscar os dados específicos do veículo desejado
            const queryDesiredData = `
              SELECT marca, modelo, ano, cor, carroceria, preco_min, preco_max
              FROM carros_desejados 
              WHERE lead_id = $1
              LIMIT 1
            `;

            const desiredResult = await client.query(queryDesiredData, [
              matchedLeadId,
            ]);

            if (desiredResult.rows.length === 0) {
              console.log(
                "❌ Dados do veículo desejado não encontrados para o lead:",
                matchedLeadId
              );
              return; // Sai apenas deste bloco try/catch interno
            }

            const desiredData = desiredResult.rows[0];
            console.log(
              "✅ Dados do veículo desejado encontrados:",
              desiredData
            );

            // Normaliza os dados do veículo desejado
            const normalizedDesired = {
              desiredType: desiredData.tipo || current.currentType || "carro",
              desiredBrand: desiredData.marca,
              desiredModel: desiredData.modelo,
              desiredYear: desiredData.ano,
              desiredColor: desiredData.cor,
              desiredCarroceria: desiredData.carroceria,
            };

            console.log("📋 Dados para salvar:");
            console.log("- Lead que procura (leadId):", matchedLeadId);
            console.log("- Lead que tem (matchedLeadId):", result.leadId);
            console.log("- Veículo desejado:", normalizedDesired);
            console.log("- Veículo disponível:", normalizedCurrent);

            // Salva o match reverso
            const savedMatch = await matchHistoryService.salvarMatch({
              leadId: matchedLeadId, // Lead que estava procurando
              matchedLeadId: result.leadId, // Lead que acabou de cadastrar o "tá na mão"
              desired: normalizedDesired,
              available: normalizedCurrent,
              source: "reverse_match",
            });

            console.log(
              "✅ Match reverso salvo com sucesso! ID:",
              savedMatch.id
            );
          } finally {
            client.release();
          }
        } catch (matchSaveError) {
          console.error("❌ Erro ao salvar match reverso:", matchSaveError);
          console.error("Stack trace:", matchSaveError.stack);
          // Não falha a operação principal, apenas loga o erro
        }
      }
    }

    res.status(201).json({
      message: "Lead inserido com sucesso!",
      idLead: result.leadId,
      ...result,
      reverseMatch,
    });
  } catch (error) {
    console.error("Erro ao inserir lead:", error);
    res.status(500).json({ error: "Erro ao inserir dados no banco" });
  }
};
