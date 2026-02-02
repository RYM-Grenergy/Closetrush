const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    brand: { type: String },
    size: { type: String },
    condition: { type: String, enum: ['new', 'good', 'worn'], default: 'good' },
    careInstructions: { type: String, default: '' }, // Editable while on_rent

    // Pricing
    price: { type: Number, required: true },
    rentPricePerDay: { type: Number },
    retailPrice: { type: Number, required: true, default: 0 },
    securityDeposit: { type: Number, default: 0 },

    // Ownership
    owner: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

    // Location/Display
    distance: { type: String, default: 'Nearby' },
    tag: { type: String, default: 'Casual' },
    bgClass: { type: String, default: 'from-gray-500 to-gray-700' },

    // Images
    image: { type: String, default: '' },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],

    // Status - Single source of truth
    status: {
        type: String,
        enum: ['draft', 'pending_admin_approval', 'active', 'on_rent', 'disabled'],
        default: 'pending_admin_approval'
    },
    rejectionReason: { type: String, default: null },

    // Legacy fields for backwards compatibility
    available: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

// Virtual to check if product can be edited (pricing fields)
productSchema.virtual('canEditPricing').get(function () {
    return this.status !== 'on_rent';
});

module.exports = mongoose.model('Product', productSchema);
