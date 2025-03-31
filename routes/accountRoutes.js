const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authenticateJWT = require('../middleware/authenticateJWT');

// Получение всех счетов пользователя (GET /accounts)
router.get('/', authenticateJWT, accountController.getAccounts);

// Создание нового счета (POST /accounts)
router.post('/', authenticateJWT, accountController.createAccount);

// Пополнение счета (POST /accounts/deposit)
router.post('/deposit', authenticateJWT, accountController.depositMoney);

module.exports = router;
