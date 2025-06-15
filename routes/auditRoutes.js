const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authenticateJWT');

// Получить свои записи аудита
router.get('/my-logs', authMiddleware, auditController.getMyAuditLogs);

// Получить все записи аудита (только для админов)
router.get('/all-logs', authMiddleware, auditController.getAllAuditLogs);

// Статистика по действиям (только для админов)
router.get('/stats', authMiddleware, auditController.getAuditStats);

module.exports = router;