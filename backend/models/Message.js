const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rentalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rental',
        required: true // Chat only allowed if rental exists
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date }
}, { timestamps: true });

// Indexes for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ rentalId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, read: 1 }); // For unread count

// Virtual for conversation ID (consistent regardless of sender/receiver order)
messageSchema.virtual('conversationKey').get(function () {
    const ids = [this.senderId.toString(), this.receiverId.toString()].sort();
    return `${ids[0]}_${ids[1]}_${this.rentalId}`;
});

module.exports = mongoose.model('Message', messageSchema);
