const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/internal', transactionController.internalTransfer);
router.post('/external', transactionController.externalTransfer);
router.get('/', transactionController.getTransactionHistory);

module.exports = router;
