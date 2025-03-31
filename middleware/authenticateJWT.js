const jwt = require('jsonwebtoken');
const fs = require('fs');

// Читаем публичный ключ для проверки токенов, путь берется из переменной окружения
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    // Проверяем наличие заголовка авторизации
    if (!authHeader) {
        return res.status(401).json({ message: 'Нет токена авторизации' });
    }

    // Ожидается формат "Bearer <токен>"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Нет токена авторизации' });
    }

    // Верификация токена с использованием публичного ключа и алгоритма RS256
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            console.error('Ошибка верификации токена:', err);
            return res.status(403).json({ message: 'Ошибка верификации токена' });
        }
        // Устанавливаем расшифрованные данные в req.user
        req.user = decoded;
        next();
    });
}

module.exports = authenticateJWT;
