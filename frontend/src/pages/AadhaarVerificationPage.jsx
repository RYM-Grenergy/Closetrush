import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import config from '../config';

const API_URL = config.API_URL;

export default function AadhaarVerificationPage() {
    const navigate = useNavigate();
    const [aadhaar, setAadhaar] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user._id) {
            fetchStatus();
        }
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/users/${user._id}/aadhaar-status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setRejectionReason(data.rejectionReason);
            }
        } catch (err) {
            console.error('Error fetching status:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (aadhaar.length !== 12) {
            alert('Aadhaar number must be 12 digits');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/${user._id}/submit-aadhaar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aadhaarNumber: aadhaar })
            });

            if (res.ok) {
                const data = await res.json();
                // Update local storage
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    aadhaarVerificationStatus: 'pending',
                    aadhaarNumber: aadhaar
                }));
                setStatus('pending');
                alert('Aadhaar submitted for verification! You will be notified once verified.');
            } else {
                const error = await res.json();
                alert(error.message || 'Submission failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    const renderStatusCard = () => {
        const statusConfig = {
            not_submitted: {
                icon: '📋',
                title: 'Not Submitted',
                desc: 'Please submit your Aadhaar number for verification.',
                color: 'gray',
                showForm: true
            },
            pending: {
                icon: '⏳',
                title: 'Verification Pending',
                desc: 'Your Aadhaar is being verified. This usually takes 24-48 hours.',
                color: 'yellow',
                showForm: false
            },
            verified: {
                icon: '✅',
                title: 'Verified',
                desc: 'Your identity is verified. You can now list products for rent!',
                color: 'green',
                showForm: false
            },
            rejected: {
                icon: '❌',
                title: 'Verification Rejected',
                desc: rejectionReason || 'Your verification was rejected. Please try again.',
                color: 'red',
                showForm: true
            }
        };

        const config = statusConfig[status] || statusConfig.not_submitted;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${config.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
                    config.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        config.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                            'bg-white/5 border-white/10'
                    } mb-8`}
            >
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{config.icon}</span>
                    <div>
                        <h3 className={`font-bold text-lg ${config.color === 'green' ? 'text-green-400' :
                            config.color === 'yellow' ? 'text-yellow-400' :
                                config.color === 'red' ? 'text-red-400' :
                                    'text-white'
                            }`}>{config.title}</h3>
                        <p className="text-gray-400 text-sm">{config.desc}</p>
                    </div>
                </div>
            </motion.div>
        );
    };

    const showForm = !status || status === 'not_submitted' || status === 'rejected';

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-6 pt-28">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-4xl mb-6">
                            🛡️
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Aadhaar Verification</h1>
                        <p className="text-gray-400">Required for listing products on ClosetRush</p>
                    </div>

                    {/* Status Card */}
                    {status && renderStatusCard()}

                    {/* Form - Only show if not verified or pending */}
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Aadhaar Number</label>
                                    <input
                                        type="text"
                                        maxLength="12"
                                        required
                                        className="w-full bg-[#1a1a1d] border border-white/10 rounded-xl px-5 py-4 text-white text-lg font-mono tracking-widest focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-gray-700"
                                        placeholder="0000 0000 0000"
                                        value={aadhaar}
                                        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-[10px] text-gray-500">{aadhaar.length}/12 digits</p>
                                        {aadhaar.length === 12 && (
                                            <p className="text-[10px] text-green-400">✓ Valid length</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || aadhaar.length !== 12}
                                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : status === 'rejected' ? 'Resubmit for Verification' : 'Submit for Verification'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Verified - Show action buttons */}
                    {status === 'verified' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                Go to Dashboard
                            </button>
                        </motion.div>
                    )}

                    {/* Pending - Show wait message */}
                    {status === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="animate-pulse mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                We're reviewing your submission. You'll receive an update soon.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-3 border border-white/20 hover:border-white text-white font-bold uppercase tracking-widest rounded-xl transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </motion.div>
                    )}

                    <p className="text-center text-[10px] text-gray-600 mt-8 max-w-xs mx-auto">
                        Your data is encrypted and used only for identity verification purposes in compliance with local regulations.
                    </p>
                </div>
            </div>
        </div>
    );
}
