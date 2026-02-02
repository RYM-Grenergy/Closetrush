const router = require('express').Router();
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const User = require('../models/User');

// Get single product by ID
router.get('/find/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get approved/active products (Public Explore)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {
            status: { $in: ['active', 'on_rent'] },
            isApproved: true
        };

        if (category && category !== 'All') {
            query.category = category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get trending/fresh drops
router.get('/trending', async (req, res) => {
    try {
        const products = await Product.find({
            status: { $in: ['active', 'on_rent'] },
            isApproved: true
        })
            .sort({ createdAt: -1 })
            .limit(4);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get products by User ID (Seller Dashboard)
router.get('/user/:userId', async (req, res) => {
    try {
        const products = await Product.find({ userId: req.params.userId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get pending products (Admin)
router.get('/pending', async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending_admin_approval' });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve a product (Admin)
router.put('/:id/approve', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                status: 'active',
                isApproved: true,
                available: true,
                rejectionReason: null
            },
            { new: true }
        );
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reject a product (Admin)
router.put('/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                status: 'disabled',
                isApproved: false,
                rejectionReason: reason || 'Does not meet quality standards'
            },
            { new: true }
        );
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all products (Admin - All Status)
router.get('/admin/all', async (req, res) => {
    try {
        const products = await Product.find().populate('userId', 'username fullName');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a product (User)
router.post('/', async (req, res) => {
    try {
        const { userId, isDraft } = req.body;

        // Check Aadhaar verification
        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!user.isAadhaarVerified && user.aadhaarVerificationStatus !== 'verified') {
                return res.status(403).json({
                    message: "Aadhaar verification required to list products",
                    verificationStatus: user.aadhaarVerificationStatus
                });
            }
            if (!user.isSeller || user.sellerStatus !== 'approved') {
                return res.status(403).json({
                    message: "Seller approval required to list products",
                    sellerStatus: user.sellerStatus
                });
            }
        }

        const product = new Product({
            ...req.body,
            status: isDraft ? 'draft' : 'pending_admin_approval',
            isApproved: false,
            available: true
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Publish draft to pending (User)
router.put('/:id/publish', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.status !== 'draft') {
            return res.status(400).json({ message: "Only draft products can be published" });
        }

        product.status = 'pending_admin_approval';
        await product.save();

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a product (Admin/Owner) with edit restrictions
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if product is on_rent
        const isOnRent = product.status === 'on_rent';

        // Define restricted fields when on_rent
        const restrictedFields = ['price', 'rentPricePerDay', 'securityDeposit', 'retailPrice'];

        if (isOnRent) {
            // Check if trying to edit restricted fields
            const editingRestricted = restrictedFields.some(field =>
                req.body[field] !== undefined && req.body[field] !== product[field]
            );

            if (editingRestricted) {
                return res.status(403).json({
                    message: "Cannot edit pricing fields while product is on rent",
                    restrictedFields,
                    allowedFields: ['description', 'images', 'careInstructions', 'image']
                });
            }

            // Only allow editing non-restricted fields
            const allowedUpdates = {};
            ['description', 'images', 'careInstructions', 'image'].forEach(field => {
                if (req.body[field] !== undefined) {
                    allowedUpdates[field] = req.body[field];
                }
            });

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                allowedUpdates,
                { new: true }
            );
            return res.json(updatedProduct);
        }

        // If not on_rent, allow full edit
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a product (Admin/Owner)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if product is on_rent
        if (product.status === 'on_rent') {
            return res.status(403).json({
                message: "Cannot delete product while it is currently rented"
            });
        }

        // Also check for active rentals
        const activeRental = await Rental.findOne({
            productId: req.params.id,
            status: { $in: ['active', 'approved', 'requested'] }
        });

        if (activeRental) {
            return res.status(403).json({
                message: "Cannot delete product with pending or active rentals"
            });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check product availability for dates
router.get('/:id/availability', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "startDate and endDate required" });
        }

        const overlappingRentals = await Rental.find({
            productId: req.params.id,
            status: { $in: ['approved', 'active', 'requested'] },
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ]
        }).populate('renterId', 'username');

        res.json({
            available: overlappingRentals.length === 0,
            conflicts: overlappingRentals
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
