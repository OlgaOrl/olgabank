const db = require('../utils/db');

class UserRole {
    /**
     * Назначить роль пользователю
     */
    static assignRole(userId, roleName, assignedBy = null) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO user_roles (user_id, role_name, assigned_by) 
                          VALUES (?, ?, ?) 
                          ON DUPLICATE KEY UPDATE is_active = TRUE, assigned_by = ?`;
            db.query(query, [userId, roleName, assignedBy, assignedBy], (err, results) => {
                if (err) return reject(err);
                resolve({ userId, roleName, assigned: true });
            });
        });
    }

    /**
     * Получить роли пользователя
     */
    static getUserRoles(userId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT role_name FROM user_roles 
                          WHERE user_id = ? AND is_active = TRUE`;
            db.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results.map(row => row.role_name));
            });
        });
    }

    /**
     * Проверить наличие роли у пользователя
     */
    static hasRole(userId, roleName) {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) as count FROM user_roles 
                          WHERE user_id = ? AND role_name = ? AND is_active = TRUE`;
            db.query(query, [userId, roleName], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count > 0);
            });
        });
    }

    /**
     * Получить всех пользователей с ролями
     */
    static getAllUsersWithRoles() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    u.id,
                    u.username,
                    u.created_at,
                    GROUP_CONCAT(ur.role_name) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
                GROUP BY u.id
                ORDER BY u.username
            `;
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = UserRole;