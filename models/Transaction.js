/**
 * @type {import('mysql').Connection}
 */
const db = require('../utils/db');

class Transaction {
    /**
     * Создание новой транзакции.
     * @param {Object} param0
     * @param {string} param0.fromAccount - Номер счета отправителя.
     * @param {string} param0.toAccount - Номер счета получателя.
     * @param {number} param0.amount - Сумма перевода.
     * @param {string} param0.currency - Валюта перевода.
     * @param {string} [param0.status='pending'] - Статус транзакции.
     * @returns {Promise<Object>} Объект транзакции с присвоенным id.
     */
    static create({ fromAccount, toAccount, amount, currency, status = 'pending' }) {
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO transactions (fromAccount, toAccount, amount, currency, status)
        VALUES (?, ?, ?, ?, ?)
      `;
            db.query(query, [fromAccount, toAccount, amount, currency, status], (err, results) => {
                if (err) return reject(err);
                resolve({
                    id: results.insertId,
                    fromAccount,
                    toAccount,
                    amount,
                    currency,
                    status
                });
            });
        });
    }

    /**
     * Получение всех транзакций.
     * @returns {Promise<Array>} Массив транзакций.
     */
    static findAll() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM transactions';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = Transaction;
