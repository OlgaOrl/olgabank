const jwt = require('jsonwebtoken');
const getKey = require('./jwksClient'); // Импортируем функцию getKey

// Пример функции для проверки JWT-токена
function verifyToken(token) {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            console.error('Ошибка верификации токена:', err);
        } else {
            console.log('Токен валиден, payload:', decoded);
        }
    });
}

// Пример использования
const exampleToken = 'ваш_полученный_JWT_токен';
verifyToken(exampleToken);
