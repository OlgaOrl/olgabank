/**
 * @type {import('mysql').Connection}
 */
const db = require('../utils/db');

/**
 * Класс Account представляет модель банковского счета.
 */
class Account {
    /**
     * Создает новый банковский счет в базе данных.
     *
     * @param {Object} params - Параметры для создания счета.
     * @param {number} params.ownerId - ID владельца счета.
     * @param {string} params.currency - Валюта счета (например, "USD" или "EUR").
     * @param {string} params.accountNumber - Уникальный номер счета.
     * @param {number} [params.balance=0] - Начальный баланс счета (по умолчанию 0).
     * @returns {Promise<Object>} - Промис, который резолвится объектом созданного счета с присвоенным id.
     */
    static create({ ownerId, currency, accountNumber, balance = 0 }) {
        return new Promise((resolve, reject) => {
            // SQL-запрос для вставки новой записи в таблицу accounts
            const query = 'INSERT INTO accounts (ownerId, currency, accountNumber, balance) VALUES (?, ?, ?, ?)';
            // Выполняем запрос с использованием подготовленных выражений (placeholders)
            db.query(query, [ownerId, currency, accountNumber, balance], (err, results) => {
                if (err) return reject(err);
                // Возвращаем объект нового счета, включая ID, сгенерированный базой данных
                resolve({ id: results.insertId, ownerId, currency, accountNumber, balance });
            });
        });
    }

    /**
     * Находит все счета, принадлежащие определенному пользователю.
     *
     * @param {number} ownerId - ID владельца счета.
     * @returns {Promise<Array>} - Промис, который резолвится массивом счетов.
     */
    static findByOwner(ownerId) {
        return new Promise((resolve, reject) => {
            // SQL-запрос для выборки всех счетов пользователя по ownerId
            const query = 'SELECT * FROM accounts WHERE ownerId = ?';
            db.query(query, [ownerId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Обновляет баланс конкретного счета по его accountNumber.
     *
     * @param {string} accountNumber - Уникальный номер счета, чей баланс обновляется.
     * @param {number} newBalance - Новое значение баланса.
     * @returns {Promise<Object>} - Промис, который резолвится результатом выполнения SQL-запроса.
     */
    static updateBalance(accountNumber, newBalance) {
        return new Promise((resolve, reject) => {
            // SQL-запрос для обновления баланса счета
            const query = 'UPDATE accounts SET balance = ? WHERE accountNumber = ?';
            db.query(query, [newBalance, accountNumber], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Находит счет по его номеру.
     *
     * @param {string} accountNumber - Уникальный номер счета.
     * @returns {Promise<Object|null>} - Промис, который резолвится найденным счетом или null, если счет не найден.
     */
    static findByAccountNumber(accountNumber) {
        return new Promise((resolve, reject) => {
            // SQL-запрос для поиска счета по его номеру
            const query = 'SELECT * FROM accounts WHERE accountNumber = ?';
            db.query(query, [accountNumber], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null);
                resolve(results[0]);
            });
        });
    }

    /**
     * Получает все счета из базы данных.
     *
     * @returns {Promise<Array>} - Промис, который резолвится массивом всех счетов.
     */
    static findAll() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM accounts';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Удаляет счет по его ID.
     *
     * @param {number} id - ID счета для удаления.
     * @returns {Promise<Object>} - Промис, который резолвится результатом выполнения SQL-запроса.
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM accounts WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Создает номер счета с префиксом банка.
     *
     * @param {string} bankPrefix - Префикс банка.
     * @returns {string} - Уникальный номер счета.
     */
    static generateAccountNumber(bankPrefix) {
        // Генерируем случайное 6-значное число
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        // Форматируем номер счета как BANK-123456
        return `${bankPrefix}-${randomPart}`;
    }
}

module.exports = Account;