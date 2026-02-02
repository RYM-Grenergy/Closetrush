import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import config from '../config';

const API_URL = config.API_URL;

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const productId = query.get("productId");
  const initialDuration = parseInt(query.get("duration")) || 24;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  // Rental dates
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(initialDuration);

  // Calculate end date as a derived value
  const endDate = useMemo(() => {
    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
      return end.toISOString().slice(0, 16);
    }
    return "";
  }, [startDate, duration]);

  // Minimum start date (2 hours from now)
  const getMinStartDate = () => {
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 2);
    return minDate.toISOString().slice(0, 16);
  };

  // Address
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [useExistingAddress, setUseExistingAddress] = useState(false);

  // Saved addresses (mock for now)
  const [savedAddresses] = useState([
    {
      id: 1,
      label: "Home",
      street: "123, Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "9876543210",
    },
    {
      id: 2,
      label: "Office",
      street: "456, Business Park",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      phone: "9876543211",
    },
  ]);

  useEffect(() => {
    if (!productId) {
      navigate("/dashboard");
      return;
    }

    fetch(`${API_URL}/products/find/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [productId, navigate]);

  // Calculate actual rental details
  const getRentalDetails = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    const isMatching = diffHours === duration;
    return {
      diffMs,
      diffHours,
      diffMinutes,
      diffDays,
      remainingHours,
      isMatching,
    };
  };

  const _rentalDetails = getRentalDetails();

  const handleAddressSelect = (addr) => {
    setAddress(addr);
    setUseExistingAddress(true);
  };

  const handlePayment = async () => {
    // Validate address
    if (
      !address.street ||
      !address.city ||
      !address.pincode ||
      !address.phone
    ) {
      alert("Please fill in all address fields");
      return;
    }

    // Check Aadhaar verification BEFORE payment
    const aadhaarStatus = user.aadhaarVerificationStatus || "not_submitted";
    if (aadhaarStatus !== "verified") {
      alert(
        "⚠️ Aadhaar verification is mandatory to place rental orders.\n\nPlease complete your Aadhaar verification first.",
      );
      navigate("/verify-aadhaar");
      return;
    }

    setProcessingPayment(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        const rentalData = {
          productId: product._id,
          renterId: user._id,
          ownerId: product.owner,
          ownerUserId: product.userId,
          durationHours: duration,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          pricePerDay: product.rentPricePerDay || product.price * 10,
          rentalDays: Math.ceil(duration / 24),
          totalAmount: finalTotal,
          securityDeposit: securityDeposit,
          deliveryAddress: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
          buyerAddress: address,
          status: "requested",
          paymentStatus: "paid",
        };

        const res = await fetch(`${API_URL}/rentals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rentalData),
        });

        if (res.ok) {
          const rental = await res.json();
          console.log("Rental created:", rental);
          setProcessingPayment(false);
          alert(
            "🎉 Payment Successful! Your rental request has been sent to the seller for confirmation.",
          );
          // Force a small delay to ensure backend has updated
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        } else {
          const error = await res.json();
          alert(error.message || "Failed to process rental request.");
          setProcessingPayment(false);
        }
      } catch (err) {
        console.error(err);
        alert("Error processing rental. Please try again.");
        setProcessingPayment(false);
      }
    }, 2000);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold animate-pulse">
        PREPARING CHECKOUT...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Item not found
      </div>
    );

  const totalRent = product.price * duration;

  // Dynamic Security Deposit Logic
  const calculateSecurityDeposit = () => {
    if (product.securityDeposit && product.securityDeposit > 0)
      return product.securityDeposit;
    if (!product.retailPrice) return 0;

    const categoryMultipliers = {
      Tops: 0.5,
      Hoodies: 0.5,
      Jackets: 1.0,
      Dresses: 1.0,
      Bottoms: 1.0,
      Shoes: 1.0,
      Accessories: 1.5,
    };
    const multiplier = categoryMultipliers[product.category] || 1.0;
    const calculated = Math.min(
      totalRent * multiplier,
      product.retailPrice * 0.4,
    );
    return Math.ceil(calculated);
  };

  const securityDeposit = calculateSecurityDeposit();
  const serviceFee = 50.0;
  const finalTotal = totalRent + serviceFee + securityDeposit;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />

      <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">
        <Motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-center"
        >
          Secure Checkout
        </Motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details & Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Summary */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 text-gray-400">
                Order Summary
              </h2>

              <div className="flex gap-6 items-start">
                <div
                  className={`w-24 h-32 rounded-lg ${product.bgClass || "bg-gray-800"} border border-white/10 overflow-hidden`}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black uppercase italic leading-none mb-2">
                    {product.name}
                  </h3>
                  <div className="text-sm font-mono text-gray-500 uppercase">
                    Owner: @{product.owner}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase rounded border border-cyan-500/30">
                      {product.category}
                    </span>
                    <span className="text-2xl font-black">
                      ₹{product.price}
                      <span className="text-sm text-gray-400">/hr</span>
                    </span>
                  </div>
                </div>
              </div>
            </Motion.div>

            {/* Date & Duration Selection */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 text-gray-400">
                📅 Rental Period
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={getMinStartDate()}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select at least 2 hours from now
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    End Date & Time
                    <span className="text-[10px] ml-2 text-cyan-400">
                      (Auto-calculated)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    readOnly
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {endDate
                      ? new Date(endDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                      : "Select start date"}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Duration (Max 24h for Clothes)
                  </label>
                  <span className="text-2xl font-black text-cyan-400">
                    {duration} hours
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(6 182 212) 0%, rgb(6 182 212) ${((duration - 6) / 18) * 100}%, rgb(55 65 81) ${((duration - 6) / 18) * 100}%, rgb(55 65 81) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6h Min</span>
                  <span>24h Max</span>
                </div>
              </div>
            </Motion.div>

            {/* Delivery Address */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 text-gray-400">
                📍 Delivery Address
              </h2>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase mb-3">
                    Saved Addresses
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr)}
                        className={`p-4 border rounded-xl text-left transition-all ${useExistingAddress && address.street === addr.street
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 hover:border-white/30"
                          }`}
                      >
                        <div className="font-bold text-sm">{addr.label}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {addr.street}, {addr.city}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    placeholder="House no, Building, Street"
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    placeholder="400001"
                    maxLength="6"
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        pincode: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength="10"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </Motion.div>

            {/* Payment Method */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold uppercase tracking-widest mb-4 text-gray-400">
                💳 Payment Method
              </h2>
              <div className="flex items-center gap-4 p-4 border border-cyan-500/30 rounded-xl bg-cyan-500/5">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-xs font-bold">
                  VISA
                </div>
                <div>
                  <span className="text-sm font-mono">•••• •••• •••• 4242</span>
                  <span className="text-xs text-gray-500 ml-2">Exp 12/28</span>
                </div>
                <span className="ml-auto text-green-400 text-xs font-bold">
                  ✓ DEFAULT
                </span>
              </div>
            </Motion.div>
          </div>

          {/* Right Column - Price Breakdown */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 sticky top-32">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 text-gray-400">
                Price Breakdown
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Rent (₹{product.price} × {duration}h)
                  </span>
                  <span className="font-bold">₹{totalRent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Service Fee</span>
                  <span className="font-bold">₹{serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <div>
                    <span>Security Deposit</span>
                    <span className="block text-[10px] text-gray-500">
                      (Refundable)
                    </span>
                  </div>
                  <span className="font-bold">
                    ₹{securityDeposit.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between text-xl">
                  <span className="font-bold">Total</span>
                  <span className="font-black text-white">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{finalTotal.toFixed(2)} →</>
                )}
              </button>

              <p className="text-[10px] text-gray-500 mt-4 text-center leading-relaxed">
                By proceeding, you agree to our Terms of Service. Security
                deposit will be refunded upon safe return of the item.
              </p>

              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-4 text-gray-500">
                <span className="flex items-center gap-1 text-xs">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Secure Payment
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  24/7 Support
                </span>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
