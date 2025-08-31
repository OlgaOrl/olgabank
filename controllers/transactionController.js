const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const User = require('../models/user');

const internalTransfer = async (req, res) => {
    try {
        const { fromAccount, toAccount, amount } = req.body;
        const userId = req.user.userId;

        if (!fromAccount || !toAccount || !amount) {
            return res.status(400).json({ 
                error: 'All fields (fromAccount, toAccount, amount) are required' 
            });
        }

        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // Get sender account and verify ownership
        const senderAccount = await Account.findByAccountNumber(fromAccount);
        
        if (!senderAccount) {
            return res.status(404).json({ error: 'Sender account not found' });
        }

        // Fix: Check account ownership
        if (senderAccount.userId !== userId) {
            return res.status(403).json({ error: 'Access denied to sender account' });
        }

        // Fix: Check sufficient funds
        if (senderAccount.balance < transferAmount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Get receiver account and verify ownership
        const receiverAccount = await Account.findByAccountNumber(toAccount);
        
        if (!receiverAccount) {
            return res.status(404).json({ error: 'Receiver account not found' });
        }

        if (receiverAccount.userId !== userId) {
            return res.status(403).json({ error: 'Access denied to receiver account' });
        }

        // Update balances
        await Account.updateBalance(fromAccount, senderAccount.balance - transferAmount);
        await Account.updateBalance(toAccount, receiverAccount.balance + transferAmount);

        // Create transaction record
        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount: transferAmount,
            currency: senderAccount.currency,
            status: 'completed',
            ownerId: userId,
            transactionType: 'internal'
        });

        // Fix: Include status in response
        res.json({
            message: 'Transfer successful',
            transaction: {
                id: transaction.id,
                fromAccount,
                toAccount,
                amount: transferAmount,
                currency: senderAccount.currency,
                status: 'completed'
            }
        });
    } catch (error) {
        console.error('Internal transfer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const externalTransfer = async (req, res) => {
    try {
        const { fromAccount, toAccount, amount, currency } = req.body;
        const userId = req.user.userId;
        
        // Validation
        if (!fromAccount || !toAccount || !amount || !currency) {
            return res.status(400).json({ 
                error: 'Missing required fields: fromAccount, toAccount, amount, currency' 
            });
        }
        
        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }
        
        // Verify account ownership and sufficient funds
        const sourceAccount = await Account.findByAccountNumber(fromAccount);
        
        if (!sourceAccount) {
            return res.status(404).json({ error: 'Source account not found' });
        }
        
        if (sourceAccount.userId !== userId) {
            return res.status(403).json({ error: 'Access denied to source account' });
        }
        
        if (sourceAccount.balance < transferAmount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }
        
        // Validate currency
        const validCurrencies = ['EUR', 'USD', 'GBP'];
        if (!validCurrencies.includes(currency)) {
            return res.status(400).json({ 
                error: 'Invalid currency. Allowed: EUR, USD, GBP' 
            });
        }
        
        // Check if target account is external (different bank prefix)
        const bankPrefix = process.env.BANK_PREFIX || 'BANK';
        if (toAccount.startsWith(bankPrefix)) {
            return res.status(400).json({ 
                error: 'Use internal transfer for same bank accounts' 
            });
        }
        
        // Create transaction record with pending status
        const externalId = generateExternalTransactionId();
        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount: transferAmount,
            currency,
            status: 'pending',
            ownerId: userId,
            transactionType: 'external',
            externalId
        });
        
        // Debit source account immediately
        await Account.updateBalance(fromAccount, sourceAccount.balance - transferAmount);
        
        // TODO: Implement Central Bank communication
        // This would involve:
        // 1. Create JWT-signed transaction packet
        // 2. Send to Central Bank API
        // 3. Handle response and update transaction status
        
        // For now, mark as in progress
        await Transaction.updateStatus(transaction.id, 'inProgress');
        
        res.json({
            message: 'External transfer initiated',
            transaction: {
                id: transaction.id,
                transactionId: transaction.id,
                status: 'inProgress',
                amount: transferAmount,
                currency,
                fromAccount,
                toAccount,
                externalId
            }
        });
        
    } catch (error) {
        console.error('External transfer error:', error);
        res.status(500).json({ error: 'External transfer failed' });
    }
};

// Fix: Return transactions as array format
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get transactions for user
        const transactions = await Transaction.findByOwner(userId);

        // Fix: Return array directly, not wrapped in object
        res.json(transactions);
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper functions
function generateExternalTransactionId() {
    return `EXT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractBankFromAccountNumber(accountNumber) {
    // Extract bank prefix from account number (first 3-4 characters)
    return accountNumber.substring(0, 4);
}

module.exports = {
    internalTransfer,
    externalTransfer,
    getTransactionHistory
};
