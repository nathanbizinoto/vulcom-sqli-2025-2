// CTF - SQL Injection no Login
// Tecnologias: Node.js, Express, SQLite

// EXPLORAÇÃO DA VULNERABILIDADE SQL INJECTION:
// 
// 1. BYPASS BÁSICO - Username: admin'-- (Password: qualquer_coisa)
//    O '--' comenta o resto da query, ignorando verificação de senha
//
// 2. OR 1=1 - Username: admin' OR 1=1-- (Password: qualquer_coisa)  
//    '1=1' é sempre verdadeiro, retorna todos usuários
//
// 3. BYPASS NO PASSWORD - Username: admin (Password: ' OR '1'='1)
//    Torna a condição sempre verdadeira no campo senha

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Criar tabela e inserir dados vulneráveis
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
    db.run("INSERT INTO users (username, password) VALUES ('user', 'user123')");
    db.run("CREATE TABLE flags (id INTEGER PRIMARY KEY, flag TEXT)");
    db.run("INSERT INTO flags (flag) VALUES ('VULCOM{SQLi_Exploit_Success}')");
});

// Rota de login com SQL Injection
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // CONSULTA SQL VULNERÁVEL 🚨
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.send('Erro no servidor');
        }
        if (rows.length > 0) {
            console.log('CONSULTA: ', query);
            console.log('RESULTADO:', rows);
            return res.send(`Bem-vindo, ${username}! <br> Flag: VULCOM{SQLi_Exploit_Success}`);
        } else {
            return res.send('Login falhou!');
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
