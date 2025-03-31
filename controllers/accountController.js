const Account = require('../models/Account');

/**
 * Генерирует уникальный номер счета с использованием префикса из переменной окружения.
 * @returns {string} Уникальный номер счета.
 */
function generateAccountNumber() {
    const prefix = process.env.BANK_PREFIX || 'BANK';
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomDigits}`;
}

/**
 * Контроллер для создания нового счета.
 * Ожидается, что middleware-аутентификации установит req.user.userId.
 *
 * @param {object} req - Запрос Express.
 * @param {object} res - Ответ Express.
 */
exports.createAccount = async (req, res) => {
    try {
        const { currency } = req.body;
        if (!currency) {
            return res.status(400).json({ error: 'Поле currency обязательно' });
        }

        const ownerId = req.user.userId;
        const accountNumber = generateAccountNumber();

        // Создаем новый счет в базе данных
        const newAccount = await Account.create({ ownerId, currency, accountNumber });
        return res.status(201).json(newAccount);
    } catch (error) {
        console.error('Ошибка создания счета:', error);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
};

/**
 * Контроллер для получения счетов пользователя.
 * Ожидается, что req.user.userId установлен (middleware-аутентификации).
 *
 * @param {object} req - Запрос Express.
 * @param {object} res - Ответ Express.
 */
exports.getAccounts = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const accounts = await Account.findByOwner(ownerId);
        return res.status(200).json(accounts);
    } catch (error) {
        console.error('Ошибка получения счетов:', error);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
};

/**
 * Контроллер для пополнения счета.
 * Ожидается, что req.user.userId установлен middleware-аутентификации.
 *
 * @param {object} req - Запрос Express.
 * @param {object} res - Ответ Express.
 */
exports.depositMoney = async (req, res) => {
    try {
        const { accountNumber, amount } = req.body;
        const ownerId = req.user.userId;

        // Преобразуем amount в число и проверяем, что оно положительное
        const depositAmount = Number(amount);
        if (!accountNumber || isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ error: 'Нужны корректные accountNumber и положительная сумма (amount)' });
        }

        // Получаем все счета пользователя по его ownerId
        const accounts = await Account.findByOwner(ownerId);
        // Ищем счет с указанным accountNumber
        const account = accounts.find(acc => acc.accountNumber === accountNumber);

        if (!account) {
            return res.status(404).json({ error: 'Счет не найден' });
        }

        // Вычисляем новый баланс
        const newBalance = account.balance + depositAmount;

        // Обновляем баланс счета в базе данных
        await Account.updateBalance(accountNumber, newBalance);

        return res.status(200).json({ message: 'Счет успешно пополнен', newBalance });
    } catch (error) {
        console.error('Ошибка пополнения счета:', error);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
};
