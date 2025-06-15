const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authenticateJWT');

// Получить роли текущего пользователя
router.get('/my-roles', authMiddleware, roleController.getMyRoles);

// Получить всех пользователей с ролями (только для админов)
router.get('/users', authMiddleware, roleController.getAllUsersWithRoles);

// Назначить роль пользователю (только для админов)
router.post('/assign', authMiddleware, roleController.assignRole);

module.exports = router;