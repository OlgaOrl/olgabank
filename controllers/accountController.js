const Account = require('../models/Account');
const User = require('../models/user');

const VALID_CURRENCIES = ['EUR', 'USD', 'GBP'];

function generateAccountNumber() {
    const prefix = process.env.BANK_PREFIX || 'BANK';
    const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return `${prefix}${randomDigits}`;
}

const createAccount = async (req, res) => {
    try {
        const { currency } = req.body;
        const userId = req.user.userId;

        if (!currency) {
            return res.status(400).json({ error: 'Currency is required' });
        }

        // Fix: Validate currency
        if (!VALID_CURRENCIES.includes(currency)) {
            return res.status(400).json({ 
                error: 'Invalid currency. Allowed: EUR, USD, GBP' 
            });
        }

        const accountNumber = generateAccountNumber();
        
        const account = await Account.create({
            accountNumber,
            currency,
            balance: 0.00,
            userId
        });

        res.status(201).json({
            message: 'Account created successfully',
            account: {
                accountNumber: account.accountNumber,
                currency: account.currency,
                balance: account.balance
            }
        });
    } catch (error) {
        console.error('Account creation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getAccounts = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const accounts = await Account.findByUserId(userId);

        res.json(accounts);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createAccount,
    getAccounts
};
