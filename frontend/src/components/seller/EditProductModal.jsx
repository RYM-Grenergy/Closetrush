import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const API_URL = config.API_URL;

export default function EditProductModal({ isOpen, onClose, product, onUpdated }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        rentPricePerDay: '',
        securityDeposit: '',
        retailPrice: '',
        description: '',
        careInstructions: '',
        image: '',
        category: '',
        size: '',
        condition: 'good'
    });
    const [loading, setLoading] = useState(false);
    const [isOnRent, setIsOnRent] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                rentPricePerDay: product.rentPricePerDay || '',
                securityDeposit: product.securityDeposit || '',
                retailPrice: product.retailPrice || '',
                description: product.description || '',
                careInstructions: product.careInstructions || '',
                image: product.image || '',
                category: product.category || '',
                size: product.size || '',
                condition: product.condition || 'good'
            });
            setIsOnRent(product.status === 'on_rent');
        }
    }, [product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Only send allowed fields if on_rent
            let updateData = { ...formData };
            if (isOnRent) {
                updateData = {
                    description: formData.description,
                    careInstructions: formData.careInstructions,
                    image: formData.image
                };
            }

            const res = await fetch(`${API_URL}/products/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (res.ok) {
                const updated = await res.json();
                onUpdated?.(updated);
                onClose();
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to update product');
            }
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Error updating product');
        } finally {
            setLoading(false);
        }
    };

    const LockedField = ({ label, value }) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {label}
                <span className="ml-2 text-orange-400">🔒 Locked</span>
            </label>
            <div className="w-full bg-[#1a1a1d] border border-orange-500/30 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed">
                {value}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0f0f11] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase text-white">Edit Product</h2>
                                {isOnRent && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-orange-400">
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                                        Currently On Rent - Some fields are locked
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name - Locked when on rent */}
                            {isOnRent ? (
                                <LockedField label="Item Name" value={formData.name} />
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Pricing Fields - Locked when on rent */}
                            <div className="grid grid-cols-2 gap-4">
                                {isOnRent ? (
                                    <>
                                        <LockedField label="Price/Hour (₹)" value={`₹${formData.price}`} />
                                        <LockedField label="Daily Rate (₹)" value={`₹${formData.rentPricePerDay}`} />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price/Hour (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Daily Rate (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                                value={formData.rentPricePerDay}
                                                onChange={e => setFormData({ ...formData, rentPricePerDay: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {isOnRent ? (
                                    <>
                                        <LockedField label="Security Deposit (₹)" value={`₹${formData.securityDeposit}`} />
                                        <LockedField label="Item Value (₹)" value={`₹${formData.retailPrice}`} />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Security Deposit (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                                value={formData.securityDeposit}
                                                onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Item Value (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                                value={formData.retailPrice}
                                                onChange={e => setFormData({ ...formData, retailPrice: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Description - Always editable */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Description
                                    {isOnRent && <span className="ml-2 text-green-400">✓ Editable</span>}
                                </label>
                                <textarea
                                    className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Care Instructions - Always editable */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Care Instructions
                                    {isOnRent && <span className="ml-2 text-green-400">✓ Editable</span>}
                                </label>
                                <textarea
                                    className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none h-20"
                                    value={formData.careInstructions}
                                    onChange={e => setFormData({ ...formData, careInstructions: e.target.value })}
                                    placeholder="Washing instructions, handling notes, etc."
                                />
                            </div>

                            {/* Image URL - Always editable */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Image URL
                                    {isOnRent && <span className="ml-2 text-green-400">✓ Editable</span>}
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>

                            {isOnRent && (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-sm">
                                    <div className="font-bold text-orange-400 mb-1">Edit Restrictions Active</div>
                                    <p className="text-gray-400">
                                        This product is currently on rent. Pricing fields are locked to protect the ongoing rental agreement.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white font-bold uppercase text-xs tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-lg font-black uppercase text-xs tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
