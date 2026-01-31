const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tag: { type: String, required: true },
    price: { type: Number, required: true },
    period: { type: String, default: '/day' },
    owner: { type: String, required: true },
    distance: { type: String, default: 'Nearby' },
    image: { type: String, default: '' }, // We'll keep it simple for now, URL or placeholder
    bgClass: { type: String, default: 'from-gray-500 to-gray-700' }, // Gradient styling
    available: { type: Boolean, default: true },
    category: { type: String, required: true }, // e.g., 'Hoodies', 'Jackets'
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
