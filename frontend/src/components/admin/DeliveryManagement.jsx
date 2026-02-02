import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import config from '../../config';

const API_URL = config.API_URL;

export default function DeliveryManagement() {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "bike",
    vehicleNumber: "",
    serviceAreas: "",
    password: "",
  });

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/delivery`);
      const data = await res.json();
      setDeliveryPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching delivery partners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        serviceAreas: formData.serviceAreas
          .split(",")
          .map((area) => area.trim())
          .filter(Boolean),
      };

      const res = await fetch(`${API_URL}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Delivery partner added successfully!");
        setShowAddModal(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          vehicleType: "bike",
          vehicleNumber: "",
          serviceAreas: "",
          password: "",
        });
        fetchDeliveryPartners();
      } else {
        alert("Failed to add delivery partner");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const toggleActive = async (partnerId, isActive) => {
    try {
      await fetch(`${API_URL}/delivery/${partnerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchDeliveryPartners();
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10 animate-pulse font-bold">
        Loading Delivery Partners...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase">Delivery Partners</h2>
          <p className="text-gray-400 text-sm">
            Manage logistics and delivery personnel
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-green-500 text-black font-bold uppercase rounded-xl hover:bg-green-400 transition-all"
        >
          + Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveryPartners.map((partner) => (
          <div
            key={partner._id}
            className="bg-[#0f0f11] border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{partner.name}</h3>
                <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                  <span>{partner.phone}</span>
                </div>
              </div>
              <button
                onClick={() => toggleActive(partner._id, partner.isActive)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${partner.isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
              >
                {partner.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {partner.vehicleType === "bike"
                    ? "🏍️"
                    : partner.vehicleType === "car"
                      ? "🚗"
                      : "🚲"}
                </span>
                <span className="text-gray-400">
                  {partner.vehicleNumber || "No vehicle"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span>
                  {partner.rating?.toFixed(1)} ({partner.ratingCount || 0}{" "}
                  reviews)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span>{partner.completedDeliveries || 0} deliveries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">📦</span>
                <span>{partner.activeRentals?.length || 0} active</span>
              </div>
            </div>

            {partner.serviceAreas && partner.serviceAreas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-[10px] text-gray-500 uppercase mb-2">
                  Service Areas
                </div>
                <div className="flex flex-wrap gap-1">
                  {partner.serviceAreas.map((area, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-white/5 rounded"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {deliveryPartners.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No delivery partners yet. Add your first partner!
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-black uppercase mb-6">
              Add Delivery Partner
            </h3>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Vehicle #
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleNumber: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Service Areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.serviceAreas}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceAreas: e.target.value })
                  }
                  placeholder="e.g., Mumbai, Andheri, Bandra"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white font-bold uppercase text-xs hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500 text-black rounded-xl font-bold uppercase text-xs hover:bg-green-400 transition-all"
                >
                  Add Partner
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
