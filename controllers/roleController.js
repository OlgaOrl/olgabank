const UserRole = require('../models/UserRole');
const AuditLog = require('../models/AuditLog');

/**
 * Получить роли текущего пользователя
 */
exports.getMyRoles = async (req, res) => {
    try {
        const userId = req.user.userId;
        const roles = await UserRole.getUserRoles(userId);
        res.json({ userId, roles });
    } catch (error) {
        console.error('Error getting user roles:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Получить всех пользователей с ролями (только для админов)
 */
exports.getAllUsersWithRoles = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Проверяем права администратора
        const isAdmin = await UserRole.hasRole(userId, 'admin');
        if (!isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        const users = await UserRole.getAllUsersWithRoles();
        res.json(users);
    } catch (error) {
        console.error('Error getting users with roles:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Назначить роль пользователю (только для админов)
 */
exports.assignRole = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { userId, roleName } = req.body;

        // Проверяем права администратора
        const isAdmin = await UserRole.hasRole(adminId, 'admin');
        if (!isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        // Валидация данных
        if (!userId || !roleName) {
            return res.status(400).json({ error: 'userId and roleName are required' });
        }

        const validRoles = ['client', 'admin', 'operator'];
        if (!validRoles.includes(roleName)) {
            return res.status(400).json({ error: 'Invalid role name' });
        }

        // Назначаем роль
        const result = await UserRole.assignRole(userId, roleName, adminId);

        // Логируем действие
        await AuditLog.createLog(
            adminId,
            'role_assign',
            'user_roles',
            null,
            null,
            { targetUser: userId, role: roleName },
            req.ip
        );

        res.json(result);
    } catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: 'Server error' });
    }
};