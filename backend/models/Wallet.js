const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    totalBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },     // Active rentals - not yet withdrawable
    withdrawableBalance: { type: Number, default: 0 }, // Available for withdrawal
    totalEarnings: { type: Number, default: 0 },      // Lifetime earnings
    totalWithdrawn: { type: Number, default: 0 },     // Lifetime withdrawals
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Method to update balances
walletSchema.methods.updateBalances = function () {
    this.totalBalance = this.pendingBalance + this.withdrawableBalance;
    this.lastUpdated = new Date();
};

// Method to add pending earnings
walletSchema.methods.addPendingEarning = function (amount) {
    this.pendingBalance += amount;
    this.updateBalances();
};

// Method to release pending to withdrawable
walletSchema.methods.releasePending = function (amount) {
    const releaseAmount = Math.min(amount, this.pendingBalance);
    this.pendingBalance -= releaseAmount;
    this.withdrawableBalance += releaseAmount;
    this.totalEarnings += releaseAmount;
    this.updateBalances();
};

// Method to process withdrawal
walletSchema.methods.withdraw = function (amount) {
    if (amount > this.withdrawableBalance) {
        throw new Error('Insufficient withdrawable balance');
    }
    this.withdrawableBalance -= amount;
    this.totalWithdrawn += amount;
    this.updateBalances();
};

module.exports = mongoose.model('Wallet', walletSchema);
