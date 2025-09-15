const leadsService = require("../services/leadsService");
const matchService = require("../services/matchService");

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

    let reverseMatch = null;
    // Se um carro "Tá na Mão" (current) foi cadastrado, procure por um match reverso.
    if (current && current.currentBrand) {
      reverseMatch = await matchService.buscarMatchParaTaNaMao(current);
    }

    res.status(201).json({
      message: "Lead inserido com sucesso!",
      idLead: result.leadId.reverseMatch,
      ...result,
      reverseMatch,
    });
  } catch (error) {
    console.error("Erro ao inserir lead:", error);
    res.status(500).json({ error: "Erro ao inserir dados no banco" });
  }
};
