const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Регистрация нового пользователя (POST /auth/register)
router.post('/register', authController.register);

// Логин пользователя (POST /auth/login)
router.post('/login', authController.login);

// Выход (POST /auth/logout)
router.post('/logout', authController.logout);

module.exports = router;
