const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

async function internalTransfer(req, res) {
    try {
        const { fromAccount, toAccount, amount } = req.body;
        const userId = req.user.userId;

        // Check for required fields
        if (!fromAccount || !toAccount || !amount) {
            return res.status(400).json({ message: 'All fields (fromAccount, toAccount, amount) are required' });
        }
        
        // Verify account ownership
        const account = await Account.findByAccountNumber(fromAccount);
        console.log('Account found:', account);
        console.log('User ID from token:', userId, 'type:', typeof userId);
        console.log('Account owner ID:', account ? account.ownerId : null, 'type:', account ? typeof account.ownerId : null);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Convert both IDs to numbers for comparison
        const accountOwnerId = Number(account.ownerId);
        const tokenUserId = Number(userId);

        if (accountOwnerId !== tokenUserId) {
            console.log('Account ownership verification failed');
            return res.status(403).json({ message: 'Unauthorized access to account' });
        }
        
        // Debug information about authenticated user
        console.log('User object:', req.user);
        console.log('User ID:', req.user ? req.user.userId : null);

        // Check if userId exists
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'User not authenticated or missing user ID' });
        }

        // Convert amount to number and check if positive
        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ message: 'Transfer amount must be a positive number' });
        }

        // Get user accounts by ID (set by authentication middleware)
        const accounts = await Account.findByOwner(req.user.userId);
        const sender = accounts.find(acc => acc.accountNumber === fromAccount);
        const receiver = accounts.find(acc => acc.accountNumber === toAccount);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'One or both accounts not found' });
        }

        // For internal transfers, use sender account currency
        const currency = sender.currency;

        // Check that account currencies match
        if (sender.currency !== receiver.currency) {
            return res.status(400).json({ message: 'Sender and receiver account currencies must match for internal transfer' });
        }

        // Verify sufficient balance
        if (account.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Calculate new balances
        const newSenderBalance = sender.balance - transferAmount;
        const newReceiverBalance = receiver.balance + transferAmount;

        // Update account balances in database
        await Account.updateBalance(fromAccount, newSenderBalance);
        await Account.updateBalance(toAccount, newReceiverBalance);

        // Ensure userId is a number
        const ownerId = Number(req.user.userId);
        console.log('Owner ID for transaction:', ownerId);

        if (isNaN(ownerId)) {
            console.error('Error: User ID is not a number');
        }

        // Create and process transaction
        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount,
            currency: account.currency,
            status: 'completed',
            ownerId: Number(req.user.userId),  // Add ownerId to ensure it's saved
            transactionType: 'internal'
        });
        
        return res.json({
            message: 'Transfer successful',
            transaction: {
                id: transaction.id,
                fromAccount,
                toAccount,
                amount,
                currency: account.currency,
                status: transaction.status
            }
        });
    } catch (error) {
        console.error('Internal transfer error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}

// Get user transaction history
async function getTransactionHistory(req, res) {
    try {
        const userId = req.user.userId;
        // Change from findByUserId to findByOwner
const transactions = await Transaction.findByOwner(userId);
        
        // Ensure we return an array
        return res.json(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

// Stub for external transfer (not implemented yet)
async function externalTransfer(req, res) {
    try {
        const { fromAccount, toAccount, amount, currency } = req.body;
        const userId = req.user.userId;
        
        // Check for required fields
        if (!fromAccount || !toAccount || !amount || !currency) {
            return res.status(400).json({ message: 'All fields (fromAccount, toAccount, amount, currency) are required' });
        }
        
        // Verify account ownership
        const account = await Account.findByAccountNumber(fromAccount);
        if (!account || account.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to account' });
        }
        
        // Validate external account number format
        if (!toAccount.match(/^[A-Z]{4}\d{16}$/)) {
            return res.status(400).json({ message: 'Invalid external account number format' });
        }
        
        // Verify sufficient balance
        if (account.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }
        
        // Process external transfer
        // Implementation details...
        
        return res.json({
            message: 'External transfer initiated',
            status: 'pending'
        });
    } catch (error) {
        console.error('Error processing external transfer:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { internalTransfer, externalTransfer, getTransactionHistory };
