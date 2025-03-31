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
     * @param {number} [param0.ownerId] - ID владельца транзакции.
     * @param {string} [param0.transactionType='internal'] - Тип транзакции (internal/external).
     * @param {string} [param0.externalId] - Внешний ID транзакции (для входящих переводов).
     * @returns {Promise<Object>} Объект транзакции с присвоенным id.
     */
    static create({ fromAccount, toAccount, amount, currency, status = 'pending', ownerId, transactionType = 'internal', externalId = ''}) {
        return new Promise((resolve, reject) => {
            console.log('Создание транзакции:', { fromAccount, toAccount, amount, currency, status, ownerId, transactionType, externalId });

            let query;
            let params;

            // Формируем SQL-запрос в зависимости от наличия полей
            if (ownerId && externalId) {
                query = `
                    INSERT INTO transactions (fromAccount, toAccount, amount, currency, status, ownerId, transactionType, externalId)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                params = [fromAccount, toAccount, amount, currency, status, ownerId, transactionType, externalId];
            } else if (ownerId) {
                query = `
                    INSERT INTO transactions (fromAccount, toAccount, amount, currency, status, ownerId, transactionType)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                params = [fromAccount, toAccount, amount, currency, status, ownerId, transactionType];
            } else {
                query = `
                    INSERT INTO transactions (fromAccount, toAccount, amount, currency, status, transactionType)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                params = [fromAccount, toAccount, amount, currency, status, transactionType];
            }

            // Выполняем запрос на вставку
            db.query(query, params, (err, results) => {
                if (err) {
                    console.error('Ошибка при создании транзакции:', err);
                    return reject(err);
                }

                // Формируем объект для возврата
                const transactionObj = {
                    id: results.insertId,
                    fromAccount,
                    toAccount,
                    amount,
                    currency,
                    status,
                    transactionType
                };

                // Добавляем дополнительные поля, если они были предоставлены
                if (ownerId) {
                    transactionObj.ownerId = ownerId;
                }

                if (externalId) {
                    transactionObj.externalId = externalId;
                }

                console.log('Транзакция успешно создана:', transactionObj);
                resolve(transactionObj);
            });
        });
    }

    /**
     * Обновление статуса транзакции.
     * @param {number} id - ID транзакции.
     * @param {string} status - Новый статус (pending, inProgress, completed, failed).
     * @returns {Promise<Object>} Результат операции.
     */
    static updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE transactions SET status = ? WHERE id = ?';
            db.query(query, [status, id], (err, results) => {
                if (err) {
                    console.error('Ошибка при обновлении статуса транзакции:', err);
                    return reject(err);
                }
                resolve({ id, status, updated: results.affectedRows > 0 });
            });
        });
    }

    /**
     * Получение всех транзакций.
     * @returns {Promise<Array>} Массив транзакций.
     */
    static findAll() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM transactions ORDER BY createdAt DESC';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Получение транзакций пользователя по его ID.
     * @param {number} userId - ID пользователя.
     * @returns {Promise<Array>} Массив транзакций пользователя.
     */
    static findByOwner(userId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM transactions WHERE ownerId = ? ORDER BY createdAt DESC';
            db.query(query, [userId], (err, results) => {
                if (err) {
                    // Если ошибка связана с отсутствием колонки ownerId
                    if (err.code === 'ER_BAD_FIELD_ERROR') {
                        console.warn('Колонка ownerId отсутствует в таблице transactions. Возвращаем все транзакции.');
                        return this.findAll()
                            .then(results => resolve(results))
                            .catch(error => reject(error));
                    }
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    /**
     * Получение транзакции по ID.
     * @param {number} id - ID транзакции.
     * @returns {Promise<Object>} Транзакция.
     */
    static findById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM transactions WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null);
                resolve(results[0]);
            });
        });
    }

    /**
     * Получение транзакции по внешнему ID.
     * @param {string} externalId - Внешний ID транзакции.
     * @returns {Promise<Object>} Транзакция.
     */
    static findByExternalId(externalId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM transactions WHERE externalId = ?';
            db.query(query, [externalId], (err, results) => {
                if (err) {
                    // Если ошибка связана с отсутствием колонки externalId
                    if (err.code === 'ER_BAD_FIELD_ERROR') {
                        console.warn('Колонка externalId отсутствует в таблице transactions.');
                        return resolve(null);
                    }
                    return reject(err);
                }
                if (results.length === 0) return resolve(null);
                resolve(results[0]);
            });
        });
    }
}

module.exports = Transaction;