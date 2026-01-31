const router = require('express').Router();

router.get('/dashboard', (req, res) => {
    // Mock analytics data
    res.json({
        totalUsers: 12403,
        activeListings: 8200,
        monthlyRevenue: 45290,
        pendingReports: 12,
        recentTransactions: [
            { id: 1, item: "Cyberpunk Jacket", price: 15, status: "Completed" },
            { id: 2, item: "Vintage Hoodie", price: 8, status: "Pending" },
            { id: 3, item: "Silver Skirt", price: 12, status: "Completed" }
        ]
    });
});

module.exports = router;
