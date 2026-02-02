import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const API_URL = config.API_URL;

export default function RentalRequestsModal({ isOpen, onClose, productId, productName, onApproved }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);

    useEffect(() => {
        if (isOpen && productId) {
            fetchRequests();
        }
    }, [isOpen, productId]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_URL}/rentals/product/${productId}/requests`);
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        const overlapping = requests.filter(r => r._id !== requestId);

        if (overlapping.length > 0) {
            const confirmed = window.confirm(
                `Approving this request will automatically REJECT ${overlapping.length} other overlapping request(s) and refund them. Continue?`
            );
            if (!confirmed) return;
        }

        setApproving(requestId);
        try {
            const res = await fetch(`${API_URL}/rentals/${requestId}/approve-with-rejection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Approved! ${data.rejectedCount} overlapping requests were automatically rejected.`);
                onApproved?.();
                onClose();
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to approve');
            }
        } catch (err) {
            console.error('Error approving:', err);
            alert('Error approving request');
        } finally {
            setApproving(null);
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Reject this rental request?')) return;

        try {
            const res = await fetch(`${API_URL}/rentals/${requestId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'rejected',
                    rejectionReason: 'Rejected by seller'
                })
            });

            if (res.ok) {
                fetchRequests();
            }
        } catch (err) {
            console.error('Error rejecting:', err);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Check for date overlaps
    const hasOverlap = (request, otherRequests) => {
        return otherRequests.some(other => {
            if (other._id === request._id) return false;
            const start1 = new Date(request.startDate);
            const end1 = new Date(request.endDate);
            const start2 = new Date(other.startDate);
            const end2 = new Date(other.endDate);
            return start1 <= end2 && end1 >= start2;
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0f0f11] w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase text-white">Rental Requests</h2>
                                    <p className="text-sm text-gray-500 mt-1">{productName}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading requests...</div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No pending requests for this product</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.length > 1 && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <span className="text-yellow-500 text-xl">⚠</span>
                                                <div>
                                                    <div className="font-bold text-yellow-400">Multiple Requests</div>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Approving one request will automatically reject all overlapping requests and issue refunds.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {requests.map((request, i) => {
                                        const isOverlapping = hasOverlap(request, requests);
                                        return (
                                            <motion.div
                                                key={request._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`bg-[#1a1a1d] rounded-xl p-4 border ${isOverlapping ? 'border-yellow-500/30' : 'border-white/10'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="font-bold text-white">
                                                            @{request.renterId?.username || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {request.renterId?.fullName}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-green-400 font-bold font-mono">
                                                            ₹{request.totalAmount}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            {request.rentalDays ||
                                                                Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24))
                                                            } days
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 mb-4">
                                                    <div className="flex-1 bg-black/30 rounded-lg p-3">
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">From</div>
                                                        <div className="font-mono text-sm">{formatDate(request.startDate)}</div>
                                                    </div>
                                                    <div className="flex-1 bg-black/30 rounded-lg p-3">
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">To</div>
                                                        <div className="font-mono text-sm">{formatDate(request.endDate)}</div>
                                                    </div>
                                                </div>

                                                {isOverlapping && (
                                                    <div className="text-xs text-yellow-400 mb-3">
                                                        ⚠ Overlaps with other requests
                                                    </div>
                                                )}

                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleReject(request._id)}
                                                        className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-bold uppercase rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(request._id)}
                                                        disabled={approving === request._id}
                                                        className="px-4 py-2 bg-green-500 text-black text-xs font-bold uppercase rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                                                    >
                                                        {approving === request._id ? 'Approving...' : 'Approve'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
