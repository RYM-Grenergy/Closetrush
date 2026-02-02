const router = require('express').Router();

const User = require('../models/User');
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const Transaction = require('../models/Transaction');

// Dashboard Stats for Super Admin
router.get('/dashboard', async (req, res) => {
    try {
        // User Stats
        const totalUsers = await User.countDocuments();
        const sellers = await User.countDocuments({ isSeller: true });
        const pendingAadhaar = await User.countDocuments({ aadhaarVerificationStatus: 'pending' });
        const pendingSellers = await User.countDocuments({ sellerStatus: 'pending' });

        // Product Stats
        const activeListings = await Product.countDocuments({ status: { $in: ['active', 'on_rent'] } });
        const pendingProducts = await Product.countDocuments({ status: 'pending_admin_approval' });

        // Rental Stats
        const activeRentals = await Rental.countDocuments({ status: 'active' });
        const completedRentals = await Rental.find({ status: 'returned' });
        const totalRevenue = completedRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        // Recent Transactions
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'username');

        res.json({
            totalUsers,
            sellers,
            activeListings,
            pendingProducts,
            pendingAadhaar,
            pendingSellers,
            activeRentals,
            totalRevenue,
            monthlyRevenue: totalRevenue, // For legacy support
            pendingReports: pendingProducts + pendingAadhaar + pendingSellers,
            recentTransactions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Platform Analytics
router.get('/analytics', async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Rentals in last 30 days
        const recentRentals = await Rental.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // New users in last 7 days
        const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // New products in last 7 days
        const newProducts = await Product.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // Category breakdown
        const categoryStats = await Product.aggregate([
            { $match: { status: { $in: ['active', 'on_rent'] } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Rental status breakdown
        const rentalStatusStats = await Rental.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            recentRentals,
            newUsers,
            newProducts,
            categoryStats,
            rentalStatusStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
