const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        default: () => `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
        unique: true
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rentalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rental'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: [
            'rental_earning',
            'security_deposit_hold',
            'security_deposit_release',
            'refund',
            'damage_deduction',
            'withdrawal',
            'platform_fee'
        ],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'reversed'],
        default: 'pending'
    },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed } // For additional info
}, { timestamps: true });

// Index for efficient queries
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ rentalId: 1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
