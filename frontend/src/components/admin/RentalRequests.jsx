import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import config from '../../config';

export default function RentalRequests() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = () => {
    fetch(`${config.API_URL}/rentals/admin/all`)
      .then((res) => res.json())
      .then((data) => {
        setRentals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(
        `${config.API_URL}/rentals/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        fetchRentals();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white">Loading Rentals...</div>;

  return (
    <div className="bg-[#0f0f11] rounded-3xl border border-white/5 p-8">
      <h2 className="text-xl font-bold mb-6 text-white">Rental Requests</h2>
      <div className="space-y-4">
        {rentals.length === 0 && (
          <div className="text-gray-500">No requests found.</div>
        )}

        {rentals.map((rental) => (
          <div
            key={rental._id}
            className="bg-black/20 p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            {/* Product Info */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
              <div>
                <div className="text-white font-bold text-sm uppercase">
                  {rental.productId?.name || "Unknown Item"}
                </div>
                <div className="text-gray-500 text-xs text-xs">
                  Owner: {rental.ownerId}
                </div>
              </div>
            </div>

            {/* Renter Info */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">
                Rented By
              </div>
              <div className="text-white font-bold">
                @{rental.renterId?.username}
              </div>
              <div className="text-gray-600 text-[10px] mt-1">
                Duration: {rental.durationHours} Hours • Total: ₹
                {rental.totalAmount || rental.totalPrice}
              </div>
              <button
                onClick={() => {
                  setSelectedRental(rental);
                  setShowDetailsModal(true);
                }}
                className="text-cyan-400 hover:text-cyan-300 text-xs mt-2 underline"
              >
                View Full Details
              </button>
            </div>

            {/* Status Badge */}
            <div
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${rental.status === "pending"
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  : rental.status === "approved" || rental.status === "active"
                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}
            >
              {rental.status}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  alert(`Opening chat with @${rental.renterId?.username}...`)
                }
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Chat with Renter"
              >
                💬
              </button>

              {rental.status === "pending" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(rental._id, "approved")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase rounded transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(rental._id, "rejected")}
                    className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold uppercase rounded transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}

              {rental.status === "approved" && (
                <button
                  onClick={() => handleStatusUpdate(rental._id, "active")}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase rounded transition-colors"
                >
                  Mark Active
                </button>
              )}

              {rental.status === "active" && (
                <button
                  onClick={() => handleStatusUpdate(rental._id, "completed")}
                  className="px-4 py-2 border border-white/20 hover:bg-white hover:text-black text-xs font-bold uppercase rounded transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Rental Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f0f11] w-full max-w-3xl rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase">
                  Rental Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
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

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Product Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                    Product Information
                  </h3>
                  <div className="bg-black/30 p-4 rounded-xl">
                    <div className="font-black text-2xl uppercase italic text-white mb-2">
                      {selectedRental.productId?.name || "Unknown Item"}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase rounded border border-cyan-500/30">
                        {selectedRental.productId?.category}
                      </span>
                      <span className="text-gray-400">
                        Owner:{" "}
                        <span className="text-white font-bold">
                          @{selectedRental.ownerId}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        ₹
                        {selectedRental.pricePerDay ||
                          selectedRental.productId?.price}
                        /hr
                      </span>
                    </div>
                  </div>
                </div>

                {/* Renter Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                    Renter Information
                  </h3>
                  <div className="bg-black/30 p-4 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                          Username
                        </div>
                        <div className="text-white font-bold">
                          @{selectedRental.renterId?.username}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                          Full Name
                        </div>
                        <div className="text-white">
                          {selectedRental.renterId?.fullName || "N/A"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                          Email
                        </div>
                        <div className="text-white font-mono text-sm">
                          {selectedRental.renterId?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Period */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                    📅 Rental Period
                  </h3>
                  <div className="bg-black/30 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Start Date</span>
                      <span className="text-white font-mono text-sm">
                        {new Date(selectedRental.startDate).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">End Date</span>
                      <span className="text-white font-mono text-sm">
                        {new Date(selectedRental.endDate).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-gray-400 text-sm font-bold">
                        Duration
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {selectedRental.durationHours} hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedRental.buyerAddress && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                      📍 Delivery Address
                    </h3>
                    <div className="bg-black/30 p-4 rounded-xl space-y-2">
                      {selectedRental.buyerAddress.street && (
                        <div>
                          <span className="text-gray-500 text-xs">Street:</span>
                          <div className="text-white">
                            {selectedRental.buyerAddress.street}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4">
                        {selectedRental.buyerAddress.city && (
                          <div>
                            <span className="text-gray-500 text-xs">City:</span>
                            <div className="text-white">
                              {selectedRental.buyerAddress.city}
                            </div>
                          </div>
                        )}
                        {selectedRental.buyerAddress.state && (
                          <div>
                            <span className="text-gray-500 text-xs">
                              State:
                            </span>
                            <div className="text-white">
                              {selectedRental.buyerAddress.state}
                            </div>
                          </div>
                        )}
                        {selectedRental.buyerAddress.pincode && (
                          <div>
                            <span className="text-gray-500 text-xs">
                              Pincode:
                            </span>
                            <div className="text-white">
                              {selectedRental.buyerAddress.pincode}
                            </div>
                          </div>
                        )}
                      </div>
                      {selectedRental.buyerAddress.phone && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-gray-500 text-xs">Phone:</span>
                          <div className="text-white font-mono">
                            {selectedRental.buyerAddress.phone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                    💳 Payment Breakdown
                  </h3>
                  <div className="bg-black/30 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        Rent (
                        {selectedRental.pricePerDay ||
                          selectedRental.productId?.price}{" "}
                        × {selectedRental.durationHours}h)
                      </span>
                      <span className="text-white font-mono">
                        ₹
                        {(
                          (selectedRental.pricePerDay ||
                            selectedRental.productId?.price ||
                            0) * selectedRental.durationHours
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Service Fee</span>
                      <span className="text-white font-mono">₹50.00</span>
                    </div>
                    {selectedRental.securityDeposit > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          Security Deposit (Refundable)
                        </span>
                        <span className="text-yellow-400 font-mono">
                          ₹{selectedRental.securityDeposit.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-cyan-400 font-black text-xl">
                        ₹
                        {(
                          selectedRental.totalAmount ||
                          selectedRental.totalPrice ||
                          0
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold uppercase ${selectedRental.paymentStatus === "paid"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                          }`}
                      >
                        {selectedRental.paymentStatus || "pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                    Rental Status
                  </h3>
                  <div className="bg-black/30 p-4 rounded-xl">
                    <span
                      className={`px-4 py-2 rounded text-sm font-bold uppercase ${selectedRental.status === "pending" ||
                          selectedRental.status === "requested"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : selectedRental.status === "approved" ||
                            selectedRental.status === "confirmed" ||
                            selectedRental.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : selectedRental.status === "completed"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {selectedRental.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>{" "}
    </div>
  );
}
