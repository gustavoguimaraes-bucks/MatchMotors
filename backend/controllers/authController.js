const pool = require('../db'); // ou '../index.js' dependendo da sua estrutura
const bcrypt = require('bcrypt'); // Para criptografia de senhas

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    // Busca o usuário no banco de dados
    const userQuery = 'SELECT * FROM usuarios WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    // Verifica se o usuário existe
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const user = userResult.rows[0];

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.senha);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Login bem-sucedido
    res.status(200).json({ 
      message: "Login autorizado.",
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// Função para registrar novos usuários
exports.register = async (req, res) => {
  const { nome, email, password } = req.body;

  // Validação básica
  if (!nome || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  try {
    // Verifica se o usuário já existe
    const existingUserQuery = 'SELECT * FROM usuarios WHERE email = $1';
    const existingUserResult = await pool.query(existingUserQuery, [email]);

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: "Usuário já existe." });
    }

    // Criptografa a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insere o novo usuário
    const insertUserQuery = `
      INSERT INTO usuarios (nome, email, senha, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING id, nome, email, created_at
    `;
    
    const newUserResult = await pool.query(insertUserQuery, [nome, email, hashedPassword]);
    const newUser = newUserResult.rows[0];

    res.status(201).json({ 
      message: "Usuário registrado com sucesso.",
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};