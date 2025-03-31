// utils/db.js
require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,       // '127.0.0.1' или 'localhost'
    user: process.env.DB_USER,       // 'root'
    password: process.env.DB_PASSWORD, // например, 'root' или другой пароль
    database: process.env.DB_NAME,   // например, 'bankDB'
    debug: true  // Включаем отладку для просмотра всех SQL-запросов
});

connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключено к базе данных с ID ' + connection.threadId);
});

// Оборачиваем метод query для добавления логирования
const originalQuery = connection.query;
connection.query = function(...args) {
    console.log('Выполнение SQL-запроса:', args[0]);
    if (args[1] && Array.isArray(args[1])) {
        console.log('Параметры запроса:', args[1]);
    }
    return originalQuery.apply(connection, args);
};

module.exports = connection;