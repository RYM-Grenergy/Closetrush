const router = require('express').Router();
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get or create wallet for a user
router.get('/:userId', async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ userId: req.params.userId });

        // Auto-create wallet if doesn't exist
        if (!wallet) {
            wallet = new Wallet({ userId: req.params.userId });
            await wallet.save();
        }

        res.json(wallet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get wallet with transaction summary
router.get('/:userId/summary', async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ userId: req.params.userId });

        if (!wallet) {
            wallet = new Wallet({ userId: req.params.userId });
            await wallet.save();
        }

        // Get recent transactions
        const recentTransactions = await Transaction.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('rentalId')
            .populate('productId', 'name');

        res.json({
            wallet,
            recentTransactions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Request withdrawal
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, amount } = req.body;

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (amount > wallet.withdrawableBalance) {
            return res.status(400).json({
                message: 'Insufficient withdrawable balance',
                available: wallet.withdrawableBalance
            });
        }

        // Process withdrawal
        wallet.withdraw(amount);
        await wallet.save();

        // Create transaction record
        const transaction = new Transaction({
            walletId: wallet._id,
            userId,
            amount: -amount,
            type: 'withdrawal',
            status: 'completed',
            description: `Withdrawal of ₹${amount}`
        });
        await transaction.save();

        res.json({
            message: 'Withdrawal successful',
            wallet,
            transaction
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add earnings (internal use - called when rental completes)
router.post('/add-earning', async (req, res) => {
    try {
        const { userId, amount, rentalId, productId, type = 'rental_earning', isPending = true } = req.body;

        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({ userId });
        }

        if (isPending) {
            wallet.addPendingEarning(amount);
        } else {
            wallet.withdrawableBalance += amount;
            wallet.totalEarnings += amount;
            wallet.updateBalances();
        }
        await wallet.save();

        // Create transaction record
        const transaction = new Transaction({
            walletId: wallet._id,
            userId,
            rentalId,
            productId,
            amount,
            type,
            status: isPending ? 'pending' : 'completed',
            description: `Earning from rental`
        });
        await transaction.save();

        res.json({ wallet, transaction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Release pending to withdrawable (when rental completes)
router.post('/release-pending', async (req, res) => {
    try {
        const { userId, amount, rentalId } = req.body;

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        wallet.releasePending(amount);
        await wallet.save();

        // Update pending transaction to completed
        await Transaction.updateOne(
            { userId, rentalId, status: 'pending', type: 'rental_earning' },
            { status: 'completed' }
        );

        res.json({ wallet });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
