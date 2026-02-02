const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: { type: String, required: true }, // Username for frontend compatibility
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Proper relation

    // Time & Cost
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentalDays: { type: Number },
    durationHours: { type: Number }, // Legacy support

    // Pricing
    pricePerDay: { type: Number },
    securityDeposit: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Damage & Refunds
    damageDeduction: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date },
    refundReason: { type: String },

    // Commission & Final Earnings (5% platform commission)
    platformCommission: { type: Number, default: 0 },
    finalSellerEarning: { type: Number, default: 0 },

    // Status - Complete flow: Requested → Confirmed → Picked Up → Active → Returned → Completed
    status: {
      type: String,
      enum: [
        "requested",
        "confirmed",
        "picked_up",
        "active",
        "returned",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "requested",
    },
    rejectionReason: { type: String },

    // Delivery tracking
    confirmedAt: { type: Date },
    pickedUpAt: { type: Date },
    activeAt: { type: Date },
    returnedAt: { type: Date },
    completedAt: { type: Date },

    // Transaction tracking
    transactionId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "partial_refund"],
      default: "pending",
    },

    // Pickup/Return
    pickupRequested: { type: Boolean, default: false },
    pickupAddress: { type: String },
    pickupNotes: { type: String },
    pickupRequestedAt: { type: Date },
    deliveryAddress: { type: String },

    // Buyer address
    buyerAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },

    // Delivery Partner tracking
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    },
    deliveryStatus: {
      type: String,
      enum: [
        "not_assigned",
        "assigned",
        "picked_from_seller",
        "in_transit_to_buyer",
        "delivered_to_buyer",
        "picked_from_buyer",
        "in_transit_to_seller",
        "returned_to_seller",
      ],
      default: "not_assigned",
    },
    deliveryNotes: { type: String },
  },
  { timestamps: true },
);

// Index for efficient overlapping date queries
rentalSchema.index({ productId: 1, startDate: 1, endDate: 1 });
rentalSchema.index({ status: 1 });

module.exports = mongoose.model("Rental", rentalSchema);
