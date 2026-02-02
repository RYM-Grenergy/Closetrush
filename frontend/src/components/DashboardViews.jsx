import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useRentals } from "../context/RentalContext";
import DeliveryTracker from "./DeliveryTracker";
import config from '../config';

// --- BUYER VIEWS ---



export const BuyerRentals = () => {
  const {
    user,
    buyerRentals: rentals,
    loading,
    extendRental,
    initiateReturn,
    triggerRefresh,
    lastUpdate,
  } = useRentals();

  const [selectedRental, setSelectedRental] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [extendHours, setExtendHours] = useState(6);
  const [returnAddress, setReturnAddress] = useState("");
  const [processing, setProcessing] = useState(false);

  const calculateTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return { hours: 0, minutes: 0, isOverdue: true };

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      isOverdue: false,
    };
  };

  const calculateProgress = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const handleExtend = async () => {
    if (!selectedRental) return;
    setProcessing(true);

    const result = await extendRental(selectedRental._id, extendHours);

    if (result.success) {
      alert(
        `✅ Rental extended by ${extendHours} hours! Additional cost: ₹${result.data.additionalCost}`,
      );
      setShowExtendModal(false);
    } else {
      alert(result.error || "Failed to extend rental");
    }
    setProcessing(false);
  };

  const handleReturn = async () => {
    if (!selectedRental) return;
    setProcessing(true);

    const result = await initiateReturn(
      selectedRental._id,
      returnAddress || selectedRental.deliveryAddress,
      "Ready for pickup",
    );

    if (result.success) {
      alert(
        "✅ Return initiated! The seller will arrange pickup at your address.",
      );
      setShowReturnModal(false);
    } else {
      alert(result.error || "Failed to initiate return");
    }
    setProcessing(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      requested: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        label: "Pending Approval",
      },
      confirmed: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        label: "Confirmed",
      },
      picked_up: {
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        text: "text-indigo-400",
        label: "Picked Up",
      },
      approved: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        label: "Approved",
      },
      active: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-400",
        label: "Active",
      },
      returned: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-400",
        label: "Returned",
      },
      completed: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-400",
        label: "Completed",
      },
      rejected: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        label: "Rejected",
      },
      cancelled: {
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        text: "text-gray-400",
        label: "Cancelled",
      },
    };
    return badges[status] || badges["requested"];
  };

  if (loading)
    return (
      <div className="text-center p-10 animate-pulse font-bold">
        LOADING YOUR RENTALS...
      </div>
    );

  const activeRentals = rentals.filter((r) =>
    ["requested", "confirmed", "picked_up", "approved", "active"].includes(
      r.status,
    ),
  );
  const pastRentals = rentals.filter((r) =>
    ["returned", "completed", "rejected", "cancelled"].includes(r.status),
  );

  console.log("BuyerRentals - Total rentals:", rentals.length);
  console.log("BuyerRentals - Active rentals:", activeRentals.length);
  console.log("BuyerRentals - All rentals:", rentals);

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">
        Current Rotation
      </h2>

      {rentals.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👗</div>
          <p className="text-gray-400 text-lg">
            No rentals yet. Go cop some heat!
          </p>
          <Link
            to="/explore"
            className="inline-block mt-4 px-6 py-3 bg-cyan-500 text-black font-bold uppercase rounded-xl hover:bg-cyan-400 transition-all"
          >
            Explore Items
          </Link>
        </div>
      ) : null}

      {/* Active Rentals */}
      {activeRentals.length > 0 && (
        <div className="space-y-4">
          {activeRentals.map((rental) => {
            const timeRemaining = calculateTimeRemaining(rental.endDate);
            const progress = calculateProgress(
              rental.startDate,
              rental.endDate,
            );
            const badge = getStatusBadge(rental.status);
            const product = rental.productId || {};

            return (
              <motion.div
                key={rental._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f11] rounded-xl border border-white/10 p-6 relative overflow-hidden group"
              >
                {/* Gradient Background */}
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-purple-900/20 to-transparent pointer-events-none" />

                <div className="flex gap-6 items-start relative z-10">
                  <div
                    className={`w-24 h-32 rounded-lg border border-white/10 bg-gray-800 overflow-hidden flex-shrink-0`}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="font-black text-xl italic uppercase">
                          {product.name || "Loading..."}
                        </div>
                        <div className="text-xs font-mono text-gray-500 mt-1">
                          ORDER ID: #{rental._id?.slice(-6).toUpperCase()}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 ${badge.bg} border ${badge.border} ${badge.text} text-[10px] font-bold tracking-widest uppercase rounded`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Time Remaining - Only for active rentals */}
                    {rental.status === "active" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                          <span>Time Remaining</span>
                          <span
                            className={
                              timeRemaining.isOverdue
                                ? "text-red-400"
                                : "text-white"
                            }
                          >
                            {timeRemaining.isOverdue
                              ? "OVERDUE - Return Now!"
                              : `${timeRemaining.hours}H ${timeRemaining.minutes}M`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${timeRemaining.isOverdue ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rental Details */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Start</span>
                        <span className="text-white">
                          {new Date(rental.startDate).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">End</span>
                        <span className="text-white">
                          {new Date(rental.endDate).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Duration</span>
                        <span className="text-white">
                          {rental.durationHours ||
                            Math.ceil(
                              (new Date(rental.endDate) -
                                new Date(rental.startDate)) /
                              (1000 * 60 * 60),
                            )}{" "}
                          hours
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total</span>
                        <span className="text-cyan-400 font-bold">
                          ₹{rental.totalAmount?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Pickup Requested Badge */}
                    {rental.pickupRequested && (
                      <div className="mt-3 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-400">
                        🚚 Pickup requested - Seller will contact you
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={() => {
                      setSelectedRental(rental);
                      setShowTrackingModal(true);
                    }}
                    className="px-4 py-2 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold uppercase hover:bg-blue-500 hover:text-black transition-all flex items-center gap-2"
                  >
                    <span>📍</span>
                    Track Delivery
                  </button>

                  <button
                    onClick={() =>
                      alert(
                        `Opening chat with seller @${product.owner || rental.ownerId}...\n\nMessage feature coming soon!`,
                      )
                    }
                    className="px-4 py-2 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold uppercase hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2"
                  >
                    <span>💬</span>
                    Message Seller
                  </button>

                  {/* Early return for confirmed/picked_up/active status */}
                  {(rental.status === "confirmed" ||
                    rental.status === "picked_up" ||
                    rental.status === "active") && (
                      <>
                        {rental.status === "active" && (
                          <button
                            onClick={() => {
                              setSelectedRental(rental);
                              setShowExtendModal(true);
                            }}
                            className="px-6 py-2 border border-white/10 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all rounded-lg"
                          >
                            Extend Time
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedRental(rental);
                            setReturnAddress(rental.deliveryAddress || "");
                            setShowReturnModal(true);
                          }}
                          disabled={rental.pickupRequested}
                          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-80 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,100,0,0.3)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {rental.pickupRequested
                            ? "Pickup Pending"
                            : rental.status === "active"
                              ? "Return Now"
                              : "Cancel & Return"}
                        </button>
                      </>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Past Rentals */}
      {pastRentals.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold uppercase text-gray-400 mb-4">
            Past Rentals
          </h3>
          <div className="space-y-3">
            {pastRentals.map((rental) => {
              const badge = getStatusBadge(rental.status);
              const product = rental.productId || {};

              return (
                <div
                  key={rental._id}
                  className="bg-[#0f0f11]/50 rounded-xl border border-white/5 p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-20 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover opacity-50"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold uppercase">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(rental.createdAt).toLocaleDateString()} • ₹
                      {rental.totalAmount?.toFixed(2)}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 ${badge.bg} border ${badge.border} ${badge.text} text-[10px] font-bold rounded`}
                  >
                    {badge.label}
                  </span>
                  {rental.status === "returned" && rental.refundAmount > 0 && (
                    <span className="text-green-400 text-xs font-bold">
                      +₹{rental.refundAmount} refunded
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f11] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-black uppercase mb-4">
              ⏰ Extend Rental
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Add more time to your rental of{" "}
              <span className="text-white font-bold">
                {selectedRental.productId?.name}
              </span>
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Additional Hours
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={extendHours}
                  onChange={(e) => setExtendHours(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-black text-cyan-400 w-16 text-right">
                  {extendHours}h
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Additional cost:{" "}
                <span className="text-white font-bold">
                  ₹
                  {(
                    extendHours * (selectedRental.productId?.price || 20)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white font-bold uppercase text-xs hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleExtend}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-cyan-500 text-black rounded-xl font-bold uppercase text-xs hover:bg-cyan-400 transition-all disabled:opacity-50"
              >
                {processing ? "Processing..." : "Pay & Extend"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f11] border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-black uppercase mb-4">
              📦 Return Item
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Request pickup for{" "}
              <span className="text-white font-bold">
                {selectedRental.productId?.name}
              </span>
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Pickup Address
              </label>
              <textarea
                value={returnAddress}
                onChange={(e) => setReturnAddress(e.target.value)}
                placeholder="Enter your full address for pickup"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none h-24"
              />
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6">
              <div className="text-green-400 font-bold text-sm mb-1">
                🎉 Refund on Return
              </div>
              <div className="text-xs text-gray-400">
                Security deposit of{" "}
                <span className="text-white">
                  ₹{selectedRental.securityDeposit?.toFixed(2) || 0}
                </span>{" "}
                will be refunded after inspection.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white font-bold uppercase text-xs hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={processing || !returnAddress}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-bold uppercase text-xs hover:bg-purple-400 transition-all disabled:opacity-50"
              >
                {processing ? "Processing..." : "Request Pickup"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#020617] border border-blue-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase">
                Delivery Tracking
              </h3>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-[#0f0f11] rounded-xl border border-white/10">
                <div className="w-16 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  {selectedRental.productId?.image && (
                    <img
                      src={selectedRental.productId.image}
                      alt={selectedRental.productId.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {selectedRental.productId?.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    Order #{selectedRental._id?.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <DeliveryTracker rental={selectedRental} />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold uppercase text-xs hover:bg-blue-400 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const PurchaseHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user._id) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [user._id]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        `${config.API_URL}/transactions/user/${user._id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-black italic text-gray-500 animate-pulse uppercase tracking-widest">
        Loading Receipts...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black tracking-tighter italic uppercase text-gray-500">
        Receipts
      </h2>

      {transactions.length === 0 ? (
        <div className="border-t-2 border-dashed border-white/10 py-12 flex flex-col items-center justify-center text-gray-600 gap-4">
          <svg
            className="w-12 h-12 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="font-mono text-sm uppercase tracking-widest">
            No transaction history
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <motion.div
              key={txn._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f11] border border-white/10 rounded-xl p-6 hover:border-cyan-400/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-bold uppercase text-sm text-gray-400 mb-1">
                    {txn.transactionId || "Transaction"}
                  </div>
                  <div className="text-lg font-black uppercase italic">
                    {txn.type === "security_deposit_release"
                      ? "Security Deposit Refund"
                      : txn.description || "Rental Payment"}
                  </div>
                  {txn.productId?.name && (
                    <div className="text-sm text-gray-500 mt-1">
                      {txn.productId.name}
                    </div>
                  )}
                </div>
                <div
                  className={`text-2xl font-black ${txn.type === "security_deposit_release" || txn.amount >= 0
                    ? "text-green-400"
                    : "text-red-400"
                    }`}
                >
                  {txn.type === "security_deposit_release" || txn.amount >= 0
                    ? "+"
                    : "-"}
                  ₹{Math.abs(txn.amount)}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-3">
                <div className="flex gap-4">
                  <span className="font-mono">
                    {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded uppercase font-bold">
                    {txn.type.replace(/_/g, " ")}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded uppercase font-bold ${txn.status === "completed"
                    ? "bg-green-500/10 text-green-400"
                    : txn.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                    }`}
                >
                  {txn.status}
                </span>
              </div>

              {txn.metadata && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-600 space-y-1">
                  {txn.type === "security_deposit_release" &&
                    txn.metadata.originalDeposit && (
                      <div className="flex items-center gap-2 text-green-400 font-bold">
                        <span>✅</span>
                        <span>
                          Deposit Refunded: ₹{txn.metadata.refundedAmount}
                        </span>
                      </div>
                    )}
                  {txn.metadata.durationHours && (
                    <div>Duration: {txn.metadata.durationHours} hours</div>
                  )}
                  {txn.metadata.securityDeposit > 0 &&
                    txn.type !== "security_deposit_release" && (
                      <div>
                        Security Deposit: ₹{txn.metadata.securityDeposit}
                      </div>
                    )}
                  {txn.metadata.startDate && (
                    <div>
                      Rental Period:{" "}
                      {new Date(txn.metadata.startDate).toLocaleDateString()} -{" "}
                      {new Date(txn.metadata.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- SELLER VIEWS ---

export const SellerWardrobe = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { products, setProducts, loading, refetch } = useProducts(
    user._id
      ? `${config.API_URL}/products/user/${user._id}`
      : undefined,
  );
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedProductForRequests, setSelectedProductForRequests] =
    useState(null);
  const [requestCounts, setRequestCounts] = useState({});

  // Fetch request counts for each product
  useEffect(() => {
    const fetchRequestCounts = async () => {
      const counts = {};
      for (const product of products) {
        try {
          const res = await fetch(
            `${config.API_URL}/rentals/product/${product._id}/requests`,
          );
          const data = await res.json();
          counts[product._id] = data.length || 0;
        } catch (err) {
          counts[product._id] = 0;
        }
      }
      setRequestCounts(counts);
    };
    if (products.length > 0) fetchRequestCounts();
  }, [products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      const res = await fetch(`${config.API_URL}/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleViewRequests = (product) => {
    setSelectedProductForRequests(product);
    setShowRequestsModal(true);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "draft":
        return { color: "gray", label: "DRAFT", bg: "bg-gray-600" };
      case "pending_admin_approval":
        return { color: "yellow", label: "PENDING", bg: "bg-yellow-500" };
      case "active":
        return { color: "green", label: "ACTIVE", bg: "bg-green-500" };
      case "on_rent":
        return { color: "cyan", label: "ON RENT", bg: "bg-cyan-500" };
      case "disabled":
        return { color: "red", label: "DISABLED", bg: "bg-red-500" };
      default:
        return {
          color: "gray",
          label: status?.toUpperCase() || "UNKNOWN",
          bg: "bg-gray-600",
        };
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold animate-pulse">
        SYNCING INVENTORY...
      </div>
    );

  // Lazy import modals
  const EditProductModal = React.lazy(
    () => import("./seller/EditProductModal"),
  );
  const RentalRequestsModal = React.lazy(
    () => import("./seller/RentalRequestsModal"),
  );

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-8">
        <div className="flex justify-between items-end pb-4 border-b border-white/10">
          <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">
            Inventory
          </h2>
          <div className="flex gap-2 text-xs text-gray-500 font-mono">
            {products.length} Items
          </div>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xl text-gray-500">
            <div className="text-xl font-bold mb-2">Your Wardrobe is Empty</div>
            <p className="text-sm">List your first item to start earning.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item, i) => {
              const statusConfig = getStatusConfig(item.status);
              const pendingRequests = requestCounts[item._id] || 0;

              return (
                <div
                  key={i}
                  className="bg-[#0f0f11] rounded-lg border border-white/10 overflow-hidden group hover:border-white/30 transition-all relative"
                >
                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 left-2 z-10 px-2 py-1 ${statusConfig.bg} text-black rounded text-[10px] font-bold uppercase tracking-wider`}
                  >
                    ● {statusConfig.label}
                  </div>

                  {/* Request Count Badge */}
                  {pendingRequests > 0 && (
                    <button
                      onClick={() => handleViewRequests(item)}
                      className="absolute top-2 right-2 z-10 px-2 py-1 bg-orange-500 text-black rounded text-[10px] font-bold animate-pulse hover:scale-110 transition-transform"
                    >
                      {pendingRequests} Request{pendingRequests > 1 ? "s" : ""}
                    </button>
                  )}

                  <div className={`h-40 bg-gray-800 relative`}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {item.status === "on_rent" && (
                      <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-white font-black text-xs bg-black/60 px-3 py-1 rounded">
                          ON RENT
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-bold uppercase text-sm truncate">
                      {item.name}
                    </div>
                    {item.rejectionReason && (
                      <div className="mt-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        ⚠ {item.rejectionReason}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                      <div className="font-mono text-xs text-gray-400">
                        ₹{item.price}/hr
                      </div>
                      <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <button
                          onClick={() => handleEdit(item)}
                          className="hover:text-white transition-colors"
                        >
                          Edit {item.status === "on_rent" && "🔒"}
                        </button>
                        <span>/</span>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className={`transition-colors ${item.status === "on_rent" ? "text-gray-700 cursor-not-allowed" : "hover:text-red-400"}`}
                          disabled={item.status === "on_rent"}
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <EditProductModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            product={editingProduct}
            onUpdated={(updated) => {
              setProducts((prev) =>
                prev.map((p) => (p._id === updated._id ? updated : p)),
              );
            }}
          />
        )}

        {/* Requests Modal */}
        {showRequestsModal && (
          <RentalRequestsModal
            isOpen={showRequestsModal}
            onClose={() => setShowRequestsModal(false)}
            productId={selectedProductForRequests?._id}
            productName={selectedProductForRequests?.name}
            onApproved={() => {
              refetch?.();
            }}
          />
        )}
      </div>
    </React.Suspense>
  );
};

export const SellerRentals = () => {
  const {
    user,
    sellerRentals: rentals,
    loading,
    updateRentalStatus,
    approveRental,
    rejectRental,
    triggerRefresh,
    lastUpdate,
  } = useRentals();

  const [selectedRental, setSelectedRental] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const handleStatus = async (id, status) => {
    const result = await updateRentalStatus(id, status);
    if (!result.success) {
      alert(result.error || "Failed to update status");
    }
  };

  const handleApprove = async (id) => {
    const result = await approveRental(id);
    if (result.success) {
      alert("✅ Rental approved! Delivery partner auto-assigned.");
    } else {
      alert(result.error || "Failed to approve rental");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to decline this rental?"))
      return;
    const result = await rejectRental(id, "Declined by seller");
    if (!result.success) {
      alert(result.error || "Failed to decline rental");
    }
  };

  const updateDeliveryStatus = async (deliveryStatus) => {
    if (!selectedRental) return;

    try {
      const res = await fetch(
        `${config.API_URL}/rentals/${selectedRental._id}/delivery-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryStatus,
            notes: `Updated by seller`,
          }),
        },
      );

      if (res.ok) {
        alert(`✅ Delivery updated!`);
        setShowDeliveryModal(false);
        triggerRefresh();
      }
    } catch (err) {
      alert("Error updating delivery status");
    }
  };

  if (loading) return <div className="text-white">Loading Moves...</div>;

  const activeMoves = rentals.filter((r) =>
    ["requested", "confirmed", "picked_up", "approved", "active", "returned"].includes(
      r.status,
    ),
  );
  const pastMoves = rentals.filter((r) =>
    ["completed", "rejected", "cancelled"].includes(r.status),
  );

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">
        Active Moves
      </h2>

      {activeMoves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-xl text-gray-600 gap-4">
          <svg
            className="w-12 h-12 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <div className="font-mono text-sm uppercase tracking-widest">
            No active requests yet
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeMoves.map((rental, i) => (
            <div
              key={i}
              className="bg-[#0f0f11] rounded-xl border border-white/10 p-6 relative overflow-hidden group"
            >
              {/* Status Indicator */}
              <div
                className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest ${rental.status === "pending" || rental.status === "requested"
                  ? "bg-yellow-500 text-black"
                  : rental.status === "active" || rental.status === "approved"
                    ? "bg-green-500 text-black"
                    : rental.status === "completed"
                      ? "bg-gray-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
              >
                {rental.status}
              </div>

              <div className="flex gap-6 items-start relative z-10 pt-2">
                <div className="w-20 h-24 bg-gray-800 rounded-lg border border-white/5 overflow-hidden">
                  {rental.productId?.image && (
                    <img
                      src={rental.productId.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-xl italic uppercase text-white">
                        {rental.productId?.name || "Item"}
                      </div>
                      <div className="text-xs font-mono text-gray-400 mt-1">
                        Renter: @{rental.renterId?.username || "Unknown"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                    <div>
                      <span className="block text-gray-700">Earnings</span>
                      <span className="text-green-400 text-lg font-bold">
                        ₹{rental.totalAmount}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-700">Duration</span>
                      <span className="text-white text-lg font-bold">
                        {rental.durationHours}H
                      </span>
                    </div>
                    {rental.pickupRequested && rental.deliveryStatus !== 'returned_to_seller' && (
                      <div className="ml-auto">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded text-[10px] font-bold animate-pulse">
                          📦 PICKUP REQUESTED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Status Display */}
              {rental.deliveryStatus && rental.status !== "requested" && (
                <div className="mt-4 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                    Delivery Status
                  </div>
                  <div className="text-sm font-bold text-white uppercase">
                    {rental.deliveryStatus.replace(/_/g, " ")}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
                <button
                  onClick={() =>
                    alert(
                      `Opening chat with buyer @${rental.renterId?.username}...\n\nMessage feature coming soon!`,
                    )
                  }
                  className="mr-auto px-4 py-2 border border-cyan-500/30 text-cyan-400 rounded-lg text-[10px] font-bold uppercase hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2"
                >
                  <span>💬</span>
                  Message Buyer
                </button>

                {/* Delivery Tracking Button */}
                {(rental.status === "confirmed" ||
                  rental.status === "picked_up" ||
                  rental.status === "active" ||
                  rental.status === "approved") && (
                    <button
                      onClick={() => {
                        setSelectedRental(rental);
                        setShowDeliveryModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold uppercase hover:opacity-80 rounded transition-all flex items-center gap-2"
                    >
                      <span>📦</span>
                      Update Delivery
                    </button>
                  )}

                {(rental.status === "pending" ||
                  rental.status === "requested") && (
                    <>
                      <button
                        onClick={() => handleApprove(rental._id)}
                        className="px-6 py-2 bg-green-500 text-black text-xs font-bold uppercase hover:bg-green-400 rounded transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(rental._id)}
                        className="px-6 py-2 border border-red-500/30 text-red-400 text-xs font-bold uppercase hover:bg-red-500 hover:text-white rounded transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                {rental.status === "approved" && (
                  <button
                    onClick={() => handleStatus(rental._id, "active")}
                    className="px-6 py-2 bg-cyan-500 text-black text-xs font-bold uppercase hover:bg-cyan-400 rounded transition-colors"
                  >
                    Mark as Active
                  </button>
                )}

                {rental.status === "active" && (
                  <button
                    onClick={() => handleStatus(rental._id, "returned")}
                    className="px-6 py-2 border border-white/20 text-white text-xs font-bold uppercase hover:bg-white hover:text-black rounded transition-colors"
                  >
                    Mark Returned
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Moves / History */}
      {pastMoves.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-black italic uppercase text-gray-500 mb-6">
            Earning History
          </h3>
          <div className="space-y-3">
            {pastMoves.map((rental) => (
              <div
                key={rental._id}
                className="bg-[#0f0f11]/50 rounded-xl border border-white/5 p-4 flex items-center gap-6 group hover:border-white/20 transition-all"
              >
                <div className="w-12 h-16 bg-gray-800 rounded border border-white/5 overflow-hidden flex-shrink-0">
                  {rental.productId?.image && (
                    <img
                      src={rental.productId.image}
                      alt=""
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold uppercase text-gray-300">
                    {rental.productId?.name}
                  </div>
                  <div className="text-[10px] font-mono text-gray-600 mt-1">
                    Buyer: @{rental.renterId?.username} • {new Date(rental.completedAt || rental.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-black">₹{rental.totalAmount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                    {rental.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Status Update Modal */}
      {showDeliveryModal && selectedRental && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0c] border border-white/20 rounded-xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-black uppercase italic text-white mb-6">
              Update Delivery Status
            </h3>

            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Current Status</div>
              <div className="text-lg font-bold text-cyan-400 uppercase mt-1">
                {selectedRental.deliveryStatus?.replace(/_/g, " ") ||
                  "Not Assigned"}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => updateDeliveryStatus("picked_from_seller")}
                disabled={selectedRental.deliveryStatus !== "assigned"}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold uppercase rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                📦 Mark as Picked from Seller
              </button>

              <button
                onClick={() => updateDeliveryStatus("in_transit_to_buyer")}
                disabled={
                  selectedRental.deliveryStatus !== "picked_from_seller"
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold uppercase rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                🚚 Mark as In Transit to Buyer
              </button>

              <button
                onClick={() => updateDeliveryStatus("delivered_to_buyer")}
                disabled={
                  selectedRental.deliveryStatus !== "in_transit_to_buyer"
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold uppercase rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ✅ Mark as Delivered to Buyer
              </button>

              <button
                onClick={() => updateDeliveryStatus("picked_from_buyer")}
                disabled={
                  !["delivered_to_buyer", "active"].includes(
                    selectedRental.status,
                  )
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold uppercase rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                📥 Mark as Picked from Buyer (Return)
              </button>

              <button
                onClick={() => updateDeliveryStatus("in_transit_to_seller")}
                disabled={selectedRental.deliveryStatus !== "picked_from_buyer"}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold uppercase rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                🚚 Mark as In Transit to Seller
              </button>

              <button
                onClick={() => updateDeliveryStatus("returned_to_seller")}
                disabled={
                  selectedRental.deliveryStatus !== "in_transit_to_seller"
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-500 to-slate-500 text-white text-sm font-bold uppercase rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                🏠 Mark as Returned to Seller
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setSelectedRental(null);
                }}
                className="px-6 py-2 border border-white/20 text-white text-sm font-bold uppercase rounded-lg hover:bg-white hover:text-black transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SellerEarnings = () => {
  const { sellerRentals, loading } = useRentals();

  // Calculate earnings from rentals
  const earnings = React.useMemo(() => {
    let total = 0;
    let pending = 0;

    const history = sellerRentals.map((r) => {
      const amount = r.totalAmount || 0;
      if (r.status === "returned") total += amount;
      if (r.status === "active" || r.status === "approved") pending += amount;

      return {
        id: r._id,
        item: r.productId?.name || "Item",
        amount,
        status: r.status,
        date: new Date(r.createdAt).toLocaleDateString(),
      };
    });

    return { total, pending, lastWeek: 0, history };
  }, [sellerRentals]);

  if (loading)
    return (
      <div className="text-center p-10 font-bold animate-pulse">
        CALCULATING NET WORTH...
      </div>
    );

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">
        The Bag
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0f0f11] border border-green-500/20 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
            Total Revenue
          </div>
          <div className="text-5xl font-black text-white font-mono tracking-tighter">
            ₹{earnings.total.toFixed(2)}
          </div>
          <div className="text-[10px] font-bold text-gray-600 mt-2">
            Verified Earnings
          </div>
        </div>
        <div className="bg-[#0f0f11] border border-white/10 p-6 rounded-xl">
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
            Pending Payout
          </div>
          <div className="text-5xl font-black text-gray-400 font-mono tracking-tighter">
            ₹{earnings.pending.toFixed(2)}
          </div>
          <div className="text-[10px] font-bold text-gray-600 mt-2">
            Payouts every Monday
          </div>
        </div>
      </div>

      {/* Earnings Log */}
      <div className="bg-[#0f0f11] rounded-xl border border-white/10 p-6">
        <h3 className="text-sm font-bold uppercase text-white mb-6">
          Transaction Log
        </h3>
        {earnings.history.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
            No earnings data yet
          </div>
        ) : (
          <div className="space-y-4">
            {earnings.history.map((tx, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <div className="font-bold text-white text-sm">{tx.item}</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">
                    {tx.date} • {tx.status}
                  </div>
                </div>
                <div
                  className={`font-mono font-bold ${tx.status === "completed" ? "text-green-400" : "text-gray-400"}`}
                >
                  +₹{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const Messages = () => (
  <div className="h-[600px] flex bg-[#0f0f11] rounded-xl border border-white/10 overflow-hidden font-sans">
    {/* Chat List */}
    <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
      <div className="p-5 border-b border-white/10 font-black uppercase italic tracking-wider text-sm">
        Direct Messages
      </div>
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 text-center">
        <div className="text-gray-600 font-mono text-xs uppercase tracking-widest">
          No conversations yet
        </div>
      </div>
    </div>

    {/* Chat Area - Empty State */}
    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4 bg-gradient-to-b from-[#0f0f11] to-[#020617]">
      <svg
        className="w-16 h-16 opacity-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <p className="font-mono text-sm uppercase tracking-widest">
        Select a message to start chatting
      </p>
    </div>
  </div>
);

export const AccountSettings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      alert('Please type "delete" to confirm');
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`${config.API_URL}/users/${user._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Clear local storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        alert("Your account has been deleted successfully.");
        // Redirect to home
        window.location.href = "/";
      } else {
        const error = await res.json();
        alert(error.message || "Failed to delete account");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">
        My Profile
      </h2>

      <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-8 space-y-8">
        <div className="flex items-center gap-6 pb-8 border-b border-white/5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black uppercase shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            {(user.username || "U").charAt(0)}
          </div>
          <div>
            <div className="text-2xl font-black uppercase tracking-wide">
              {user.username || "Guest"}
            </div>
            <div className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
              {user.email} •{" "}
              {user.role === "admin"
                ? "Super Admin"
                : user.isSeller
                  ? "Verified Seller"
                  : "ClosetRush Member"}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              Unique Username
            </label>
            <div className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-mono flex justify-between items-center group cursor-not-allowed opacity-70">
              <span>@{user.username}</span>
              <span className="text-[10px] text-gray-600 uppercase">
                Unique ID
              </span>
            </div>
            <p className="text-[10px] text-gray-600 mt-2">
              * Usernames are unique to each rusher and cannot be changed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              Account Email
            </label>
            <div className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white opacity-70">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              Identity Verification
            </label>
            <div
              className={`w-full border rounded-xl px-4 py-3 font-bold flex items-center gap-2 ${user.isAadhaarVerified ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-500"}`}
            >
              <span className="text-lg">
                {user.isAadhaarVerified ? "✓" : "⚠"}
              </span>
              {user.isAadhaarVerified ? "Aadhaar Verified" : "Not Verified"}
            </div>
          </div>

          {user.isSeller && (
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-green-400 uppercase italic mb-4">
                Seller Profile
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Shop Name
                  </label>
                  <div className="text-white font-bold">
                    {user.sellerDetails?.shopName || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Location
                  </label>
                  <div className="text-white font-bold">
                    {user.sellerDetails?.address || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-white/5 flex gap-4">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
            Change Password
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f11] border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-black uppercase text-red-400 mb-2">
                Delete Account?
              </h3>
              <p className="text-gray-400 text-sm">
                This action is{" "}
                <span className="text-red-400 font-bold">permanent</span> and
                cannot be undone. All your data, listings, rentals, and
                transaction history will be deleted.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Type "delete" to confirm
              </label>
              <input
                type="text"
                className="w-full bg-black/50 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                placeholder='Type "delete" here'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmText("");
                }}
                className="flex-1 px-6 py-3 border border-white/20 rounded-xl text-white text-xs font-bold uppercase hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || confirmText.toLowerCase() !== "delete"}
                className="flex-1 px-6 py-3 bg-red-500 rounded-xl text-white text-xs font-bold uppercase hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
