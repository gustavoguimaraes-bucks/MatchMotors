const leadsService = require('../services/leadsService');

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

    res.status(201).json({ message: "Lead inserido com sucesso!", idLead: result.leadId });
  } catch (error) {
    console.error("Erro ao inserir lead:", error);
    res.status(500).json({ error: "Erro ao inserir dados no banco" });
  }
};

