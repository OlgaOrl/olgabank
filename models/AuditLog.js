const db = require('../utils/db');

class AuditLog {
    /**
     * Создать запись аудита
     */
    static createLog(userId, actionType, tableName = null, recordId = null, oldValues = null, newValues = null, ipAddress = null) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO audit_logs 
                          (user_id, action_type, table_name, record_id, old_values, new_values, ip_address)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                userId,
                actionType,
                tableName,
                recordId,
                oldValues ? JSON.stringify(oldValues) : null,
                newValues ? JSON.stringify(newValues) : null,
                ipAddress
            ];

            db.query(query, params, (err, results) => {
                if (err) return reject(err);
                resolve({ id: results.insertId, userId, actionType });
            });
        });
    }

    /**
     * Получить записи аудита пользователя
     */
    static getUserAuditLogs(userId, limit = 50) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM audit_logs 
                          WHERE user_id = ? 
                          ORDER BY created_at DESC 
                          LIMIT ?`;
            db.query(query, [userId, limit], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Получить все записи аудита (для администраторов)
     */
    static getAllAuditLogs(limit = 100) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    al.*,
                    u.username
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC 
                LIMIT ?
            `;
            db.query(query, [limit], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    /**
     * Статистика по действиям
     */
    static getActionStats(days = 7) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    action_type,
                    COUNT(*) as count,
                    COUNT(DISTINCT user_id) as unique_users
                FROM audit_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY action_type
                ORDER BY count DESC
            `;
            db.query(query, [days], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = AuditLog;