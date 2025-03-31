const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateJWT = require('../middleware/authenticateJWT');

// Эндпоинт для внутреннего перевода (POST /transactions/internal)
router.post('/internal', authenticateJWT, transactionController.internalTransfer);

// Эндпоинт для внешнего перевода (POST /transactions/external)
// Если функционал внешнего перевода пока не реализован, можно оставить заглушку.
router.post('/external', authenticateJWT, transactionController.externalTransfer);

// Эндпоинт для получения истории транзакций (GET /transactions)
router.get('/', authenticateJWT, transactionController.getTransactionHistory);

module.exports = router;
