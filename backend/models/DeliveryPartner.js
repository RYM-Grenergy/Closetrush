const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "car"],
      default: "bike",
    },
    vehicleNumber: { type: String },

    // Status
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },

    // Location tracking
    currentLocation: {
      lat: Number,
      lng: Number,
      address: String,
      lastUpdated: Date,
    },

    // Service area
    serviceAreas: [{ type: String }], // Array of city/area names

    // Performance metrics
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    // Current assignments
    activeRentals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rental",
      },
    ],

    // Document verification
    isVerified: { type: Boolean, default: false },
    documents: {
      idProof: String,
      drivingLicense: String,
      vehicleRegistration: String,
    },

    // Login credentials (simplified)
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// Method to assign rental
deliveryPartnerSchema.methods.assignRental = function (rentalId) {
  if (!this.activeRentals.includes(rentalId)) {
    this.activeRentals.push(rentalId);
    this.isAvailable = this.activeRentals.length < 3; // Max 3 concurrent deliveries
  }
};

// Method to complete rental
deliveryPartnerSchema.methods.completeRental = function (rentalId) {
  this.activeRentals = this.activeRentals.filter((id) => !id.equals(rentalId));
  this.completedDeliveries += 1;
  this.totalDeliveries += 1;
  this.isAvailable = true;
};

// Method to update rating
deliveryPartnerSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating * this.ratingCount + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
};

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
