// jwksClient.js
const jwksClient = require('jwks-rsa');

// Клиент для динамического получения JWKS по URL, который вы указали в .env
const client = jwksClient({
    jwksUri: process.env.BAR_PANK_JWKS_URL, // Например: "https://henno.cfd/henno-pank/.well-known/jwks.json"
    cache: true,                // Включаем кэширование
    cacheMaxEntries: 5,         // Максимальное количество ключей в кэше
    cacheMaxAge: 600000         // Время хранения ключей в кэше (в миллисекундах, тут 10 минут)
});

function getKey(header, callback) {
    // По header.kid ищем соответствующий ключ
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }
        // Получаем публичный ключ (RSA) из полученного объекта
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

module.exports = getKey;
