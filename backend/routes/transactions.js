const router = require('express').Router();
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

// Get all transactions for a wallet
router.get('/wallet/:walletId', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const transactions = await Transaction.find({ walletId: req.params.walletId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('rentalId')
            .populate('productId', 'name');

        const total = await Transaction.countDocuments({ walletId: req.params.walletId });

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get transactions by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 20, type, startDate, endDate } = req.query;

        const query = { userId: req.params.userId };

        // Filter by type
        if (type) {
            query.type = type;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('rentalId')
            .populate('productId', 'name');

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get transactions by rental ID
router.get('/rental/:rentalId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ rentalId: req.params.rentalId })
            .sort({ createdAt: -1 })
            .populate('productId', 'name');

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get transaction summary/stats for a user
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;
        switch (period) {
            case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
            case '30d': startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
            case '90d': startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        }

        const stats = await Transaction.aggregate([
            {
                $match: {
                    userId: require('mongoose').Types.ObjectId(req.params.userId),
                    createdAt: { $gte: startDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            period,
            startDate,
            endDate: now,
            breakdown: stats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
