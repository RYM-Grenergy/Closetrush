const router = require('express').Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// Get all users (Admin only)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user and all related data
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user's products (only if not currently rented)
        const Product = require('../models/Product');
        const activeRentals = await require('../models/Rental').countDocuments({
            $or: [
                { ownerId: user.username, status: { $in: ['approved', 'active'] } },
                { renterId: userId, status: { $in: ['approved', 'active'] } }
            ]
        });

        if (activeRentals > 0) {
            return res.status(400).json({
                message: 'Cannot delete account with active rentals. Please complete or cancel all active rentals first.'
            });
        }

        // Delete products
        await Product.deleteMany({ userId: userId });

        // Delete wallet
        await Wallet.deleteOne({ userId: userId });

        // Delete transactions
        const Transaction = require('../models/Transaction');
        await Transaction.deleteMany({ userId: userId });

        // Delete messages
        const Message = require('../models/Message');
        await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });

        // Finally delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: "Account and all related data deleted successfully" });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Become a Seller (Request)
router.post('/:id/become-seller', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                sellerStatus: 'pending',
                sellerDetails: req.body
            },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve Seller (Admin)
router.put('/:id/approve-seller', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isSeller: true,
                sellerStatus: 'approved'
            },
            { new: true }
        ).select('-password');

        // Create wallet for seller
        let wallet = await Wallet.findOne({ userId: req.params.id });
        if (!wallet) {
            wallet = new Wallet({ userId: req.params.id });
            await wallet.save();
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reject Seller (Admin)
router.put('/:id/reject-seller', async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isSeller: false,
                sellerStatus: 'rejected'
            },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit Aadhaar for Verification
router.post('/:id/submit-aadhaar', async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            return res.status(400).json({ message: "Invalid Aadhaar Number. Must be 12 digits." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                aadhaarNumber: aadhaarNumber,
                aadhaarVerificationStatus: 'pending'
            },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Aadhaar submitted for verification',
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify Aadhaar (Admin approve)
router.put('/:id/verify-aadhaar', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isAadhaarVerified: true,
                aadhaarVerificationStatus: 'verified',
                aadhaarRejectionReason: null
            },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Aadhaar verified successfully',
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reject Aadhaar (Admin reject)
router.put('/:id/reject-aadhaar', async (req, res) => {
    try {
        const { reason } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isAadhaarVerified: false,
                aadhaarVerificationStatus: 'rejected',
                aadhaarRejectionReason: reason || 'Verification failed'
            },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Aadhaar verification rejected',
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Aadhaar status
router.get('/:id/aadhaar-status', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('aadhaarVerificationStatus isAadhaarVerified aadhaarRejectionReason');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            status: user.aadhaarVerificationStatus,
            isVerified: user.isAadhaarVerified,
            rejectionReason: user.aadhaarRejectionReason
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check if user can list products
router.get('/:id/can-list', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const canList = user.isSeller &&
            user.sellerStatus === 'approved' &&
            user.isAadhaarVerified;

        res.json({
            canList,
            requirements: {
                isSeller: user.isSeller,
                sellerStatus: user.sellerStatus,
                isAadhaarVerified: user.isAadhaarVerified,
                aadhaarVerificationStatus: user.aadhaarVerificationStatus
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
