const AuditLog = require('../models/AuditLog');
const UserRole = require('../models/UserRole');

/**
 * Получить записи аудита текущего пользователя
 */
exports.getMyAuditLogs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 50 } = req.query;

        const logs = await AuditLog.getUserAuditLogs(userId, parseInt(limit));
        res.json(logs);
    } catch (error) {
        console.error('Error getting user audit logs:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Получить все записи аудита (только для админов)
 */
exports.getAllAuditLogs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 100 } = req.query;

        // Проверяем права администратора
        const isAdmin = await UserRole.hasRole(userId, 'admin');
        if (!isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        const logs = await AuditLog.getAllAuditLogs(parseInt(limit));
        res.json(logs);
    } catch (error) {
        console.error('Error getting all audit logs:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Статистика по действиям (только для админов)
 */
exports.getAuditStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { days = 7 } = req.query;

        // Проверяем права администратора
        const isAdmin = await UserRole.hasRole(userId, 'admin');
        if (!isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        const stats = await AuditLog.getActionStats(parseInt(days));
        res.json(stats);
    } catch (error) {
        console.error('Error getting audit stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
};