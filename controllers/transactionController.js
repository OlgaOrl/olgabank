const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

async function internalTransfer(req, res) {
    try {
        const { fromAccount, toAccount, amount, currency } = req.body;

        // Проверка наличия всех обязательных полей
        if (!fromAccount || !toAccount || !amount || !currency) {
            return res.status(400).json({ message: 'Все поля (fromAccount, toAccount, amount, currency) обязательны' });
        }

        // Отладочная информация об авторизованном пользователе
        console.log('User object:', req.user);
        console.log('User ID:', req.user?.userId);

        // Проверка наличия userId
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Пользователь не авторизован или отсутствует ID пользователя' });
        }

        // Преобразуем amount в число и проверяем, что оно положительное
        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ message: 'Сумма перевода должна быть положительным числом' });
        }

        // Получаем счета текущего пользователя по его ID (устанавливается middleware-аутентификации)
        const accounts = await Account.findByOwner(req.user.userId);
        const sender = accounts.find(acc => acc.accountNumber === fromAccount);
        const receiver = accounts.find(acc => acc.accountNumber === toAccount);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Один или оба счета не найдены' });
        }

        // Проверяем, достаточно ли средств у отправителя
        if (sender.balance < transferAmount) {
            return res.status(400).json({ message: 'Недостаточно средств на счете отправителя' });
        }

        // Вычисляем новые балансы
        const newSenderBalance = sender.balance - transferAmount;
        const newReceiverBalance = receiver.balance + transferAmount;

        // Обновляем балансы счетов в базе данных
        await Account.updateBalance(fromAccount, newSenderBalance);
        await Account.updateBalance(toAccount, newReceiverBalance);

        // Убедимся, что userId - это число или можно преобразовать к числу
        const ownerId = Number(req.user.userId);
        console.log('Owner ID для транзакции:', ownerId);

        if (isNaN(ownerId)) {
            console.error('Ошибка: ID пользователя не является числом');
        }

        // Создаем запись транзакции, включая ownerId для связи транзакции с пользователем
        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount: transferAmount,
            currency,
            status: 'completed',
            ownerId: ownerId // Используем числовой ID
        });

        console.log('Созданная транзакция:', transaction);

        return res.status(200).json({ message: 'Перевод выполнен успешно', transaction });
    } catch (error) {
        console.error('Ошибка внутреннего перевода:', error);
        return res.status(500).json({ message: 'Ошибка сервера', error });
    }
}

// Получение истории транзакций пользователя
async function getTransactionHistory(req, res) {
    try {
        console.log('User ID для истории транзакций:', req.user?.userId);

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Пользователь не авторизован или отсутствует ID пользователя' });
        }

        // Получаем транзакции пользователя
        const transactions = await Transaction.findByOwner(req.user.userId);

        return res.status(200).json({ transactions });
    } catch (error) {
        console.error('Ошибка получения истории транзакций:', error);
        return res.status(500).json({ message: 'Ошибка сервера', error });
    }
}

// Заглушка для внешнего перевода (пока не реализована)
async function externalTransfer(req, res) {
    return res.status(200).json({ message: 'Внешний перевод пока не реализован' });
}

module.exports = { internalTransfer, externalTransfer, getTransactionHistory };