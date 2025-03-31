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

        console.log('Расшифрованный токен:', JSON.stringify(decoded, null, 2));

        // Проверяем наличие userId в токене
        if (!decoded.userId && decoded.id) {
            console.log('Поле userId не найдено, но найдено поле id. Используем id как userId.');
            decoded.userId = decoded.id;
        } else if (!decoded.userId && decoded.sub) {
            console.log('Поле userId не найдено, но найдено поле sub. Используем sub как userId.');
            decoded.userId = decoded.sub;
        }

        // Убедимся, что userId это число
        if (decoded.userId) {
            const numericUserId = Number(decoded.userId);
            if (!isNaN(numericUserId)) {
                decoded.userId = numericUserId;
                console.log('UserId преобразован в число:', numericUserId);
            }
        }

        // Устанавливаем расшифрованные данные в req.user
        req.user = decoded;
        next();
    });
}

module.exports = authenticateJWT;