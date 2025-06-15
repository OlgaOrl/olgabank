const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require('../models/User');

// Читаем приватный ключ для подписи токенов (путь берётся из .env)
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');

// Add a blacklist for invalidated tokens
const tokenBlacklist = new Set();

/**
 * Регистрация нового пользователя.
 * При успешной регистрации сохраняется пользователь в базе и возвращается его ID.
 */
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username ja parool on kohustuslikud' });
        }

        // Проверяем, существует ли пользователь с таким именем
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Kasutaja juba eksisteerib' });
        }

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User(username, hashedPassword);

        // Сохраняем пользователя в базе данных
        const savedUser = await User.save(user);
        return res.status(201).json({ message: 'Registreerimine õnnestus', userId: savedUser.id });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Логин пользователя.
 * При успешном логине генерируется JWT-токен, подписанный с использованием RS256 и приватного ключа.
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Поиск пользователя по username
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Vale kasutajanimi või parool' });
        }

        // Сравнение переданного пароля с хэшированным
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Vale kasutajanimi või parool' });
        }

        // Генерация JWT-токена с использованием RS256
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            privateKey,
            { algorithm: 'RS256', expiresIn: '1h' }
        );

        return res.json({ message: 'Sisselogimine õnnestus', token });
    } catch (error) {
        console.error('Ошибка логина:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Логаут пользователя.
 * Поскольку сервер не хранит состояние токенов, для логаута достаточно вернуть сообщение.
 */
exports.logout = async (req, res) => {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        // Add the token to the blacklist
        tokenBlacklist.add(token);
    }
    
    return res.json({ message: 'Väljalogimine õnnestus' });
};

// Export the blacklist for use in the JWT middleware
exports.getTokenBlacklist = () => tokenBlacklist;
