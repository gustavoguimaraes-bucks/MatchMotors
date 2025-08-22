const bcrypt = require('bcrypt');

// Gera a hash para a senha Motors@123
bcrypt.hash('Motors@123', 10).then(hash => {
    console.log('Hash da senha Motors@123:');
    console.log(hash);
    console.log('\nUse essa hash no comando SQL:');
    console.log(`INSERT INTO usuarios (nome, email, senha) VALUES ('Administrador', 'tech@buckssolutions.com.br', '${hash}');`);
}).catch(error => {
    console.error('Erro ao gerar hash:', error);
});