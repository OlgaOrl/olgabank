const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

async function internalTransfer(req, res) {
    try {
        const { fromAccount, toAccount, amount, currency } = req.body;

        // Проверка наличия всех обязательных полей
        if (!fromAccount || !toAccount || !amount || !currency) {
            return res.status(400).json({ message: 'Все поля (fromAccount, toAccount, amount, currency) обязательны' });
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

        // Создаем запись транзакции, включая ownerId для связи транзакции с пользователем
        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount: transferAmount,
            currency,
            status: 'completed',
            ownerId: req.user.userId
        });

        return res.status(200).json({ message: 'Перевод выполнен успешно', transaction });
    } catch (error) {
        console.error('Ошибка внутреннего перевода:', error);
        return res.status(500).json({ message: 'Ошибка сервера', error });
    }
}

// Заглушка для внешнего перевода (пока не реализована)
async function externalTransfer(req, res) {
    return res.status(200).json({ message: 'Внешний перевод пока не реализован' });
}

// Заглушка для получения истории транзакций
async function getTransactionHistory(req, res) {
    // Пока возвращаем пустой массив; реализацию можно добавить позже
    return res.status(200).json({ transactions: [] });
}

module.exports = { internalTransfer, externalTransfer, getTransactionHistory };
