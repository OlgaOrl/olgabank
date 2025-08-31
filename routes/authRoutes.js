const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateJWT = require('../middleware/authenticateJWT');

// Fix: Use /users endpoint for user creation (REST convention)
router.post('/users', authController.register);
router.post('/register', authController.register); // Keep both for compatibility
router.post('/login', authController.login);
router.post('/logout', authenticateJWT, authController.logout);

module.exports = router;
