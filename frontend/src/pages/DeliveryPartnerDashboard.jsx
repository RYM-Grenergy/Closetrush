import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import config from '../config';

const API_URL = config.API_URL;

const DeliveryCard = ({ task, type, onUpdateStatus }) => {
    const isOutbound = type === "outbound"; // Seller -> Buyer
    const isInbound = type === "inbound"; // Buyer -> Seller

    // Determine addresses based on flow
    const pickupName = isOutbound
        ? task.ownerUserId?.fullName || task.ownerUserId?.username
        : task.renterId?.fullName || task.renterId?.username;

    const pickupAddress = isOutbound
        ? task.ownerUserId?.address || "Seller Location"
        : task.pickupAddress || task.renterId?.address || "Buyer Location";

    const dropName = isOutbound
        ? task.renterId?.fullName || task.renterId?.username
        : task.ownerUserId?.fullName || task.ownerUserId?.username;

    const dropAddress = isOutbound
        ? task.buyerAddress?.city ? `${task.buyerAddress.street}, ${task.buyerAddress.city}` : (task.renterId?.address || "Buyer Location")
        : task.ownerUserId?.address || "Seller Location";

    // Google Maps Link
    const openMap = () => {
        const origin = encodeURIComponent(pickupAddress);
        const destination = encodeURIComponent(dropAddress);
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
            "_blank"
        );
    };

    // Status Logic
    const getAction = () => {
        if (task.deliveryStatus === "assigned") {
            return {
                label: "Confirm Pickup",
                nextStatus: isOutbound ? "picked_from_seller" : "picked_from_buyer",
                color: "bg-blue-500",
            };
        }
        if (task.deliveryStatus === "picked_from_seller") {
            return {
                label: "Confirm Delivery to Buyer",
                nextStatus: "delivered_to_buyer",
                color: "bg-green-500",
            };
        }
        if (task.deliveryStatus === "picked_from_buyer") {
            return {
                label: "Confirm Return to Seller",
                nextStatus: "returned_to_seller",
                color: "bg-purple-500",
            };
        }
        return null;
    };

    const action = getAction();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1d] p-5 rounded-2xl border border-white/10 mb-4 shadow-xl"
        >
            {/* Header with ID and Price */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400 uppercase tracking-wider">
                        #{task._id.slice(-6)}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{task.productId?.name}</h3>
                </div>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                    {isOutbound ? "Deliver" : "Return"}
                </div>
            </div>

            {/* Route Visualization */}
            <div className="relative pl-6 border-l-2 border-dashed border-white/10 ml-2 space-y-6 my-6">
                {/* Pickup Point */}
                <div className="relative">
                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-blue-500 border-2 border-[#1a1a1d]" />
                    <div className="text-xs text-blue-400 font-bold uppercase mb-1">Pickup From</div>
                    <div className="text-white font-medium">{pickupName}</div>
                    <div className="text-sm text-gray-400">{pickupAddress}</div>
                    <a href={`tel:${isOutbound ? task.ownerUserId?.phone : task.renterId?.phone}`} className="inline-block mt-2 text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10 text-gray-300">
                        📞 Call {isOutbound ? "Seller" : "Buyer"}
                    </a>
                </div>

                {/* Drop Point */}
                <div className="relative">
                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-green-500 border-2 border-[#1a1a1d]" />
                    <div className="text-xs text-green-400 font-bold uppercase mb-1">Drop At</div>
                    <div className="text-white font-medium">{dropName}</div>
                    <div className="text-sm text-gray-400">{dropAddress}</div>
                    <a href={`tel:${isOutbound ? task.renterId?.phone : task.ownerUserId?.phone}`} className="inline-block mt-2 text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10 text-gray-300">
                        📞 Call {isOutbound ? "Buyer" : "Seller"}
                    </a>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={openMap}
                    className="py-3 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                    <span>🗺️</span> Navigate
                </button>
                {action && (
                    <button
                        onClick={() => onUpdateStatus(task._id, action.nextStatus)}
                        className={`py-3 rounded-xl ${action.color} text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg`}
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default function DeliveryPartnerDashboard() {
    const [partner, setPartner] = useState(null); // Auth state
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState("todo"); // todo, completed
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Login Handler
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/delivery/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setPartner(data);
                localStorage.setItem("delivery_partner", JSON.stringify(data));
                fetchTasks(data._id);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("delivery_partner");
        setPartner(null);
        setTasks([]);
    };

    // Fetch Tasks
    const fetchTasks = async (partnerId) => {
        try {
            const res = await fetch(`${API_URL}/delivery/${partnerId}/active-rentals`);
            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Update Status
    const handleUpdateStatus = async (rentalId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this as ${newStatus.replace(/_/g, " ")}?`)) return;

        try {
            const res = await fetch(`${API_URL}/delivery/rental/${rentalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliveryStatus: newStatus }),
            });
            if (res.ok) {
                // Refresh tasks
                fetchTasks(partner._id);
            }
        } catch (err) {
            alert("Update failed");
        }
    };

    // Auto-login on mount
    useEffect(() => {
        const saved = localStorage.getItem("delivery_partner");
        if (saved) {
            const p = JSON.parse(saved);
            setPartner(p);
            fetchTasks(p._id);
        }
    }, []);

    // Filter Tasks
    const todoTasks = tasks.filter(t =>
        !["delivered_to_buyer", "returned_to_seller"].includes(t.deliveryStatus)
    );

    const completedHistory = tasks.filter(t =>
        ["delivered_to_buyer", "returned_to_seller"].includes(t.deliveryStatus)
    );

    if (!partner) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                        <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                            🚚 FLEET
                        </div>
                        <p className="text-gray-500">Delivery Partner Portal</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Partner Email"
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button
                            disabled={loading}
                            className="w-full py-4 bg-orange-500 rounded-xl font-bold text-black hover:bg-orange-400 transition-all"
                        >
                            {loading ? "Logging in..." : "Login to Console"}
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-600 mt-6">
                        Strictly for authorized personnel only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white pb-20">
            {/* Header */}
            <header className="bg-[#1a1a1d] p-4 flex justify-between items-center sticky top-0 z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-black">
                        {partner.name[0]}
                    </div>
                    <div>
                        <div className="font-bold">{partner.name}</div>
                        <div className="text-xs text-green-400">● Online</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="text-xs text-red-400 font-bold uppercase border border-red-500/20 px-3 py-1 rounded hover:bg-red-500/10 transition-all">
                    Logout
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 p-4">
                <div className="bg-[#1a1a1d] p-4 rounded-2xl border border-white/5 text-center">
                    <div className="text-2xl font-black text-white">{todoTasks.length}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Active Tasks</div>
                </div>
                <div className="bg-[#1a1a1d] p-4 rounded-2xl border border-white/5 text-center">
                    <div className="text-2xl font-black text-green-400">{partner.completedDeliveries || 0}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Completed</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-4 gap-4">
                <button
                    onClick={() => setActiveTab("todo")}
                    className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${activeTab === "todo" ? "bg-white text-black" : "bg-white/5 text-gray-400"}`}
                >
                    Tasks ({todoTasks.length})
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${activeTab === "completed" ? "bg-white text-black" : "bg-white/5 text-gray-400"}`}
                >
                    History
                </button>
            </div>

            {/* Task List */}
            <div className="px-4 space-y-4">
                {activeTab === "todo" ? (
                    todoTasks.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <div className="text-4xl mb-4">💤</div>
                            <div>No active tasks assigned</div>
                        </div>
                    ) : (
                        todoTasks.map(task => {
                            // Determine Flow Type
                            // Outbound: status is confirmed, picked_up, assigned (and deliveryStatus is active stuff)
                            // If it's deliveryStatus 'assigned' -> Check if rental.status is 'confirmed' (Outbound) or 'returned' etc?
                            // Actually Rental status 'requested' -> 'confirmed' (Outbound start) -> 'active' (Outbound end)
                            // Rental status 'active' + pickupRequested -> Inbound (Return) start

                            let type = "outbound";
                            if (task.status === "active" || task.pickupRequested || task.deliveryStatus === "picked_from_buyer") {
                                type = "inbound";
                            }

                            return (
                                <DeliveryCard
                                    key={task._id}
                                    task={task}
                                    type={type}
                                    onUpdateStatus={handleUpdateStatus}
                                />
                            );
                        })
                    )
                ) : (
                    completedHistory.map(task => (
                        <div key={task._id} className="bg-[#1a1a1d] p-4 rounded-xl border border-white/5 opacity-50">
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-400">{task.productId?.name}</span>
                                <span className="text-xs text-green-500">Completed</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {new Date(task.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="h-6"></div>
        </div>
    );
}
