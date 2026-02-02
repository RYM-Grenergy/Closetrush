import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import config from '../config';

const API_URL = config.API_URL;

export default function BecomeSellerModal({ isOpen, onClose, onSuccess }) {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Refresh user data when modal opens
    useEffect(() => {
        if (isOpen && user._id) {
            refreshUserData();
        }
    }, [isOpen]);

    const refreshUserData = async () => {
        setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/users/${user._id}`);
            if (res.ok) {
                const updatedUser = await res.json();
                const newUserData = { ...user, ...updatedUser };
                setUser(newUserData);
                localStorage.setItem('user', JSON.stringify(newUserData));
            }
        } catch (err) {
            console.error('Error refreshing user data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    if (!isOpen) return null;

    const isAadhaarVerified = user.isAadhaarVerified || user.aadhaarVerificationStatus === 'verified';
    const aadhaarStatus = user.aadhaarVerificationStatus || 'not_submitted';
    const sellerStatus = user.sellerStatus;

    // If already a seller, close modal
    if (user.isSeller && sellerStatus === 'approved') {
        onSuccess(user);
        onClose();
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formattedAddress = `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

        const payload = {
            shopName: formData.shopName,
            phone: formData.phone,
            address: formattedAddress,
            businessName: formData.shopName,
            reason: 'Joining as seller'
        };

        try {
            const res = await fetch(`${API_URL}/users/${user._id}/become-seller`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const updatedUser = await res.json();

            if (res.ok) {
                const newUserData = { ...user, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newUserData));
                setUser(newUserData);
                alert("🎉 Application Submitted! Your seller application is pending admin approval.");
            } else {
                alert(updatedUser.message || "Failed to submit application");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f0f11] w-full max-w-lg rounded-3xl border border-white/10 p-8 relative z-10 max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-black italic uppercase text-white mb-2">Join the Roster</h2>
                <p className="text-gray-400 text-sm mb-6">Start your fashion empire. Become a verified seller on ClosetRush.</p>

                {/* Aadhaar Verification Status */}
                <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🛡️</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Aadhaar Verification</h3>
                            <p className="text-xs text-gray-500">Required for listing products on ClosetRush</p>
                        </div>
                        <button
                            onClick={refreshUserData}
                            disabled={refreshing}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            {refreshing ? '...' : '🔄'}
                        </button>
                    </div>

                    {isAadhaarVerified ? (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <span className="text-green-400 text-lg">✅</span>
                            <div>
                                <div className="text-green-400 font-bold text-sm">Verified</div>
                                <div className="text-xs text-gray-400">Your identity is verified. You can now apply to sell!</div>
                            </div>
                        </div>
                    ) : aadhaarStatus === 'pending' ? (
                        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <span className="text-yellow-400 text-lg animate-pulse">⏳</span>
                            <div>
                                <div className="text-yellow-400 font-bold text-sm">Pending Verification</div>
                                <div className="text-xs text-gray-400">Your Aadhaar is under review. Please wait for admin approval.</div>
                            </div>
                        </div>
                    ) : aadhaarStatus === 'rejected' ? (
                        <div className="flex flex-col gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-red-400 text-lg">❌</span>
                                <div>
                                    <div className="text-red-400 font-bold text-sm">Verification Rejected</div>
                                    <div className="text-xs text-gray-400">{user.aadhaarRejectionReason || 'Please re-submit with valid documents'}</div>
                                </div>
                            </div>
                            <Link
                                to="/verify-aadhaar"
                                className="mt-2 text-center py-2 bg-red-500 text-white font-bold text-xs uppercase rounded-lg hover:bg-red-400 transition-all"
                            >
                                Re-submit Aadhaar
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-lg">🪪</span>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm">Not Submitted</div>
                                    <div className="text-xs text-gray-500">You need to verify your Aadhaar first to become a seller.</div>
                                </div>
                            </div>
                            <Link
                                to="/verify-aadhaar"
                                className="mt-2 text-center py-2 bg-cyan-500 text-black font-bold text-xs uppercase rounded-lg hover:bg-cyan-400 transition-all"
                            >
                                Verify Aadhaar Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Seller Application Status or Form */}
                {isAadhaarVerified && (
                    <>
                        {sellerStatus === 'pending' ? (
                            <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                                <div className="text-4xl mb-3">⏳</div>
                                <h3 className="text-xl font-bold text-yellow-400 mb-2">Application Pending</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Your seller application is under review. We'll notify you once it's approved!
                                </p>
                                <div className="text-xs text-gray-500">
                                    This usually takes 24-48 hours
                                </div>
                            </div>
                        ) : sellerStatus === 'rejected' ? (
                            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                                <div className="text-4xl mb-3">❌</div>
                                <h3 className="text-xl font-bold text-red-400 mb-2">Application Rejected</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Unfortunately, your seller application was not approved. Please contact support for more information.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl mb-4">
                                    <div className="text-sm font-bold text-white mb-1">🎉 You're almost there!</div>
                                    <div className="text-xs text-gray-400">Fill in your shop details to complete your seller application.</div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Shop / Display Name</label>
                                    <input
                                        required
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                        value={formData.shopName}
                                        onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                                        placeholder="e.g. Vintage Vault"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 00000 00000"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="block text-xs font-bold uppercase text-green-400 mb-4">📍 Pickup Address</label>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Flat / Building / Street</label>
                                            <input
                                                required
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                                value={formData.street}
                                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                                placeholder="e.g. 104, Galaxy Apartments, Main Road"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">City</label>
                                                <input
                                                    required
                                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="e.g. Surat"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">State</label>
                                                <input
                                                    required
                                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                                    value={formData.state}
                                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                                    placeholder="e.g. Gujarat"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Pincode</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength="6"
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                                value={formData.pincode}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setFormData({ ...formData, pincode: val });
                                                }}
                                                placeholder="e.g. 395007"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black uppercase tracking-widest rounded-xl transition-all mt-6 shadow-lg shadow-green-500/20"
                                >
                                    {loading ? 'Submitting...' : '🚀 Submit Seller Application'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {/* If Aadhaar not verified, show disabled form preview */}
                {!isAadhaarVerified && aadhaarStatus !== 'pending' && (
                    <div className="opacity-40 pointer-events-none">
                        <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
                            <div className="text-gray-500 text-sm">
                                Complete Aadhaar verification to unlock the seller application form
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
