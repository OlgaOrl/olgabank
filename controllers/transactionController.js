const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

async function internalTransfer(req, res) {
    try {
        const { fromAccount, toAccount, amount } = req.body;

        // Check for required fields for internal transfer
        if (!fromAccount || !toAccount || !amount) {
            return res.status(400).json({ message: 'All fields (fromAccount, toAccount, amount) are required' });
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

        // Check if sender has sufficient funds
        if (sender.balance < transferAmount) {
            return res.status(400).json({ message: 'Insufficient funds in sender account' });
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

        // Create transaction record, using account currency
        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount: transferAmount,
            currency, // Use sender account currency
            status: 'completed',
            ownerId: ownerId
        });

        console.log('Created transaction:', transaction);

        return res.status(200).json({ message: 'Transfer completed successfully', transaction });
    } catch (error) {
        console.error('Internal transfer error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}

// Get user transaction history
async function getTransactionHistory(req, res) {
    try {
        console.log('User ID for transaction history:', req.user ? req.user.userId : null);

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'User not authenticated or missing user ID' });
        }

        // Get user transactions
        const transactions = await Transaction.findByOwner(req.user.userId);

        return res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error getting transaction history:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}

// Stub for external transfer (not implemented yet)
async function externalTransfer(req, res) {
    return res.status(200).json({ message: 'External transfer not implemented yet' });
}

module.exports = { internalTransfer, externalTransfer, getTransactionHistory };