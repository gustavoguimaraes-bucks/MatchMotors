exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Credenciais fixas para uso interno
  const VALID_EMAIL = "tech@buckssolutions.com.br";
  const VALID_PASSWORD = "Motors@123";

  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    return res.status(200).json({ message: "Login autorizado." });
  }

  res.status(401).json({ error: "Credenciais inválidas." });
};