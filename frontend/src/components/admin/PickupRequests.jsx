import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import config from '../../config';

const API_URL = config.API_URL;

export default function PickupRequests() {
    const [rentals, setRentals] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rentalsRes, deliveryRes] = await Promise.all([
                fetch(`${API_URL}/rentals/admin/all`),
                fetch(`${API_URL}/delivery`),
            ]);

            const rentalsData = await rentalsRes.json();
            const deliveryData = await deliveryRes.json();

            // Filter for rentals that need action:
            // 1. confirmed but not assigned
            // 2. returned requested but not assigned
            const pendingRentals = rentalsData.filter(r =>
                (r.status === 'confirmed' && r.deliveryStatus === 'not_assigned') ||
                (r.pickupRequested === true && r.deliveryStatus === 'delivered_to_buyer')
            );

            setRentals(pendingRentals);
            setDeliveryPartners(Array.isArray(deliveryData) ? deliveryData : []);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (partnerId) => {
        try {
            const res = await fetch(`${API_URL}/rentals/${selectedRental._id}/assign-delivery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliveryPartnerId: partnerId }),
            });

            if (res.ok) {
                alert("✅ Partner assigned successfully!");
                setShowAssignModal(false);
                fetchData();
            } else {
                alert("Failed to assign partner");
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return <div className="text-center py-10 font-bold uppercase tracking-widest animate-pulse">Scanning logistics...</div>;

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black uppercase italic">Pending <span className="text-cyan-500">Pickups</span></h2>
                <p className="text-gray-500 text-xs font-mono">Current segment: Logistics Queue / Unassigned</p>
            </div>

            {rentals.length === 0 ? (
                <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">🚛</div>
                    <h3 className="text-xl font-bold text-gray-400 uppercase">All clear</h3>
                    <p className="text-gray-600 text-sm mt-1">No pending pickup requests in the queue.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {rentals.map((rental) => (
                        <motion.div
                            key={rental._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 hover:border-cyan-500/30 transition-all"
                        >
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-20 h-24 bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                                    {rental.productId?.image && <img src={rental.productId.image} className="w-full h-full object-cover" alt="" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${rental.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            {rental.status === 'confirmed' ? 'Outbound Pickup' : 'Inbound Return'}
                                        </span>
                                        <span className="text-gray-600 text-[10px] font-mono">ID: {rental._id.slice(-8)}</span>
                                    </div>
                                    <h3 className="text-lg font-black uppercase text-white leading-tight">{rental.productId?.name}</h3>
                                    <div className="flex flex-col gap-1 mt-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-500 font-bold uppercase w-16">From:</span>
                                            <span className="text-gray-300 font-mono">@{rental.ownerId} (Seller)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-500 font-bold uppercase w-16">To:</span>
                                            <span className="text-gray-300 font-mono">@{rental.renterId?.username} (Buyer)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:items-end gap-3 min-w-[200px]">
                                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 w-full text-center lg:text-right">
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Pickup Zone</div>
                                    <div className="text-xs text-white truncate max-w-[200px]">{rental.pickupAddress || 'No address specified'}</div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedRental(rental);
                                        setShowAssignModal(true);
                                    }}
                                    className="w-full px-6 py-3 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                >
                                    Assign Partner
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#08080a] border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-[0_10px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic">Select <span className="text-cyan-500">Partner</span></h3>
                                    <p className="text-gray-500 text-xs mt-1">Found {deliveryPartners.length} active units in field</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                {deliveryPartners.filter(p => p.isActive).map((partner) => (
                                    <button
                                        key={partner._id}
                                        onClick={() => handleAssign(partner._id)}
                                        className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-cyan-500/50 transition-all text-left flex items-start gap-4 group"
                                    >
                                        <div className="text-3xl bg-black/50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                            {partner.vehicleType === 'bike' ? '🏍️' : '🚗'}
                                        </div>
                                        <div>
                                            <div className="font-black uppercase text-white text-sm mb-1">{partner.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{partner.vehicleNumber}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black italic">
                                                    {partner.completedDeliveries} XP
                                                </span>
                                                <span className="text-[10px] text-cyan-400 font-black">⭐ {partner.rating?.toFixed(1) || 'NEW'}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {deliveryPartners.filter(p => p.isActive).length === 0 && (
                                <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <p className="text-gray-500 uppercase font-bold text-xs">No active partners available</p>
                                    <button className="text-cyan-500 text-[10px] mt-2 underline">Register new partner</button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
