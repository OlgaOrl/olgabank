const Account = require('../models/Account');

/**
 * Generates a unique account number using the prefix from environment variables.
 * @returns {string} Unique account number.
 */
function generateAccountNumber() {
    const prefix = process.env.BANK_PREFIX || 'BANK';
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomDigits}`;
}

/**
 * Controller for creating a new account.
 * It is expected that authentication middleware sets req.user.userId.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response.
 */
exports.createAccount = async (req, res) => {
    try {
        const { currency } = req.body;
        if (!currency) {
            return res.status(400).json({ error: 'Currency field is required' });
        }

        const ownerId = req.user.userId;
        const accountNumber = generateAccountNumber();

        // Create a new account in the database
        const newAccount = await Account.create({ ownerId, currency, accountNumber });
        return res.status(201).json(newAccount);
    } catch (error) {
        console.error('Error creating account:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Controller for retrieving user accounts.
 * It is expected that req.user.userId is set (authentication middleware).
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response.
 */
exports.getAccounts = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const accounts = await Account.findByOwner(ownerId);
        return res.status(200).json(accounts);
    } catch (error) {
        console.error('Error retrieving accounts:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Controller for depositing money into an account.
 * It is expected that req.user.userId is set by authentication middleware.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response.
 */
exports.depositMoney = async (req, res) => {
    try {
        const { accountNumber, amount } = req.body;
        const ownerId = req.user.userId;

        // Convert amount to a number and check that it's positive
        const depositAmount = Number(amount);
        if (!accountNumber || isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ error: 'Valid accountNumber and positive amount are required' });
        }

        // Get all user accounts by ownerId
        const accounts = await Account.findByOwner(ownerId);
        // Find the account with the specified accountNumber
        const account = accounts.find(acc => acc.accountNumber === accountNumber);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Calculate the new balance
        const newBalance = account.balance + depositAmount;

        // Update the account balance in the database
        await Account.updateBalance(accountNumber, newBalance);

        return res.status(200).json({
            accountNumber: account.accountNumber,
            currency: account.currency,
            balance: newBalance
        });
    } catch (error) {
        console.error('Error depositing funds:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};