const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isSeller: { type: Boolean, default: false },
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    sellerDetails: {
      shopName: String,
      phone: String,
      address: String,
    },
    // Aadhaar Verification
    isAadhaarVerified: { type: Boolean, default: false },
    aadhaarNumber: { type: String, default: null },
    aadhaarVerificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },
    aadhaarRejectionReason: { type: String, default: null },
    // Verification Documents
    verificationDocuments: {
      aadhaarFront: { type: String, default: null },
      aadhaarBack: { type: String, default: null },
      collegeId: { type: String, default: null },
      hostelId: { type: String, default: null },
    },
    residenceType: {
      type: String,
      enum: ["hostel", "college", "home", "not_specified"],
      default: "not_specified",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
