// utils/db.js
require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,       // '127.0.0.1' или 'localhost'
    user: process.env.DB_USER,       // 'root'
    password: process.env.DB_PASSWORD, // например, 'root' или другой пароль
    database: process.env.DB_NAME    // например, 'bankDB'
});

connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключено к базе данных с ID ' + connection.threadId);
});

module.exports = connection;
