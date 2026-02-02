const router = require('express').Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Rental = require('../models/Rental');
const User = require('../models/User');

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        console.log(`Searching conversations for user: ${req.params.userId}`);
        const userId = new mongoose.mongo.ObjectId(req.params.userId);

        // Get unique conversation partners with latest message
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$rentalId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiverId', userId] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { 'lastMessage.createdAt': -1 } }
        ]);

        // Populate rental and user info
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                let rental = null;
                if (conv._id) {
                    rental = await Rental.findById(conv._id).populate('productId', 'name image');
                }

                const otherUserId = conv.lastMessage.senderId.toString() === req.params.userId
                    ? conv.lastMessage.receiverId
                    : conv.lastMessage.senderId;

                const otherUser = await User.findById(otherUserId).select('username fullName');

                return {
                    rentalId: conv._id,
                    rental,
                    otherUser,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount
                };
            })
        );

        res.json(populatedConversations.filter(c => c.otherUser)); // Filter out if user not found
    } catch (err) {
        console.error("Error in /conversations:", err);
        res.status(500).json({ message: err.message });
    }
});

// Get messages for a specific rental
router.get('/rental/:rentalId', async (req, res) => {
    try {
        const { userId } = req.query;

        // Verify user is part of this rental
        const rental = await Rental.findById(req.params.rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        const messages = await Message.find({ rentalId: req.params.rentalId })
            .sort({ createdAt: 1 })
            .populate('senderId', 'username fullName')
            .populate('receiverId', 'username fullName');

        // Mark messages as read if user is receiver
        if (userId) {
            await Message.updateMany(
                {
                    rentalId: req.params.rentalId,
                    receiverId: userId,
                    read: false
                },
                { read: true, readAt: new Date() }
            );
        }

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send a message
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, rentalId, content } = req.body;

        // Verify rental exists and involves both users
        const rental = await Rental.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found. Chat is only allowed with an active rental.' });
        }

        // Create message
        const message = new Message({
            senderId,
            receiverId,
            rentalId,
            content
        });

        await message.save();

        // Populate and return
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'username fullName')
            .populate('receiverId', 'username fullName');

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search buyers by username (for starting conversation)
router.get('/search-users', async (req, res) => {
    try {
        const { query, sellerId } = req.query;

        if (!query || query.length < 2) {
            return res.json([]);
        }

        // Find users who have rentals with this seller
        const rentals = await Rental.find({ ownerId: sellerId })
            .populate('renterId', 'username fullName email');

        // Get unique renters matching search
        const renters = [...new Map(
            rentals
                .filter(r => r.renterId && r.renterId.username.toLowerCase().includes(query.toLowerCase()))
                .map(r => [r.renterId._id.toString(), {
                    user: r.renterId,
                    rentalId: r._id,
                    productId: r.productId
                }])
        ).values()];

        res.json(renters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get unread count for a user
router.get('/unread/:userId', async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiverId: req.params.userId,
            read: false
        });
        res.json({ unreadCount: count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
