/**
 * @type {import('mysql').Connection}
 */
const db = require('../utils/db');

class User {
    constructor(username, hashedPassword) {
        // id не задаём вручную — будет присвоен базой данных
        this.username = username;
        this.password = hashedPassword;
        // Можно добавить дополнительные поля, если необходимо
    }

    /**
     * Сохраняет пользователя в базе данных.
     * @param {User} user - Объект пользователя (с username и password).
     * @returns {Promise<User>} Промис, который резолвится сохранённым пользователем с присвоенным id.
     */
    static save(user) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(query, [user.username, user.password], (err) => {
                if (err) return reject(err);
                this.id = undefined;
                resolve(user);
            });
        });
    }

    /**
     * Ищет пользователя по имени.
     * @param {string} username - Имя пользователя для поиска.
     * @returns {Promise<Object|null>} Промис, который резолвится объектом пользователя или null, если пользователь не найден.
     */
    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
            db.query(query, [username], (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Ищет пользователя по ID.
     * @param {number} id - ID пользователя.
     * @returns {Promise<Object|null>} Промис, который резолвится объектом пользователя или null, если пользователь не найден.
     */
    static findById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
            db.query(query, [id], (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
            });
        });
    }
}

module.exports = User;
