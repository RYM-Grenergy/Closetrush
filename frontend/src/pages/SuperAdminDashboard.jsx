import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DeliveryManagement from "../components/admin/DeliveryManagement";
import PickupRequests from "../components/admin/PickupRequests";

import config from '../config';

const API_URL = config.API_URL;

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#0f0f11] p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden"
  >
    <div
      className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-all`}
    />
    <div className="flex items-center justify-between mb-3">
      <span className="text-3xl">{icon}</span>
      {trend && (
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${trend > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">
      {title}
    </h3>
    <div className={`text-4xl font-black ${color.replace("bg-", "text-")}`}>
      {value}
    </div>
  </motion.div>
);

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0f0f11] w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase">{title}</h2>
            <button
              onClick={onClose}
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
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Badge Component
const Badge = ({ status }) => {
  const configs = {
    pending: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
    },
    approved: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    verified: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    rejected: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    },
    active: {
      bg: "bg-cyan-500/20",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    },
    returned: {
      bg: "bg-purple-500/20",
      text: "text-purple-400",
      border: "border-purple-500/30",
    },
    requested: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
    },
    not_submitted: {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      border: "border-gray-500/30",
    },
  };
  const config = configs[status] || configs.pending;
  return (
    <span
      className={`px-2 py-1 ${config.bg} ${config.text} ${config.border} border rounded text-[10px] font-bold uppercase tracking-wider`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [deliverySubTab, setDeliverySubTab] = useState("Requests");
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    sellers: 0,
    activeListings: 0,
    pendingProducts: 0,
    pendingAadhaar: 0,
    pendingSellers: 0,
    activeRentals: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);

  // Filter states
  const [userFilter, setUserFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes, rentalsRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/products/admin/all`),
        fetch(`${API_URL}/rentals/admin/all`),
      ]);

      const usersData = await usersRes.json();
      const productsData = await productsRes.json();
      const rentalsData = await rentalsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setRentals(Array.isArray(rentalsData) ? rentalsData : []);

      // Calculate stats
      const userList = Array.isArray(usersData) ? usersData : [];
      const productList = Array.isArray(productsData) ? productsData : [];
      const rentalList = Array.isArray(rentalsData) ? rentalsData : [];

      setStats({
        totalUsers: userList.length,
        sellers: userList.filter((u) => u.isSeller).length,
        activeListings: productList.filter(
          (p) => p.status === "active" || p.status === "on_rent",
        ).length,
        pendingProducts: productList.filter(
          (p) => p.status === "pending_admin_approval",
        ).length,
        pendingAadhaar: userList.filter(
          (u) => u.aadhaarVerificationStatus === "pending",
        ).length,
        pendingSellers: userList.filter((u) => u.sellerStatus === "pending")
          .length,
        activeRentals: rentalList.filter((r) => r.status === "active").length,
        totalRevenue: rentalList
          .filter((r) => r.status === "returned")
          .reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleApproveAadhaar = async (userId) => {
    try {
      await fetch(`${API_URL}/users/${userId}/verify-aadhaar`, {
        method: "PUT",
      });
      fetchAllData();
      alert("✅ Aadhaar verified successfully!");
    } catch (err) {
      alert("Failed to verify Aadhaar");
    }
  };

  const handleRejectAadhaar = async (userId, reason) => {
    try {
      await fetch(`${API_URL}/users/${userId}/reject-aadhaar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchAllData();
      setShowUserModal(false);
      alert("Aadhaar rejected");
    } catch (err) {
      alert("Failed to reject Aadhaar");
    }
  };

  const handleApproveSeller = async (userId) => {
    try {
      await fetch(`${API_URL}/users/${userId}/approve-seller`, {
        method: "PUT",
      });
      fetchAllData();
      alert("✅ Seller approved!");
    } catch (err) {
      alert("Failed to approve seller");
    }
  };

  const handleRejectSeller = async (userId) => {
    try {
      await fetch(`${API_URL}/users/${userId}/reject-seller`, {
        method: "PUT",
      });
      fetchAllData();
      alert("Seller application rejected");
    } catch (err) {
      alert("Failed to reject seller");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "⚠️ Are you sure? This will delete the user and ALL their data!",
      )
    )
      return;
    try {
      await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
      fetchAllData();
      setShowUserModal(false);
      alert("User deleted");
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  // Product Actions
  const handleApproveProduct = async (productId) => {
    try {
      await fetch(`${API_URL}/products/${productId}/approve`, {
        method: "PUT",
      });
      fetchAllData();
      alert("✅ Product approved!");
    } catch (err) {
      alert("Failed to approve product");
    }
  };

  const handleRejectProduct = async (productId, reason) => {
    try {
      await fetch(`${API_URL}/products/${productId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchAllData();
      setShowProductModal(false);
      alert("Product rejected");
    } catch (err) {
      alert("Failed to reject product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
      });
      fetchAllData();
      alert("Product deleted");
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleUpdateRentalStatus = async (rentalId, status) => {
    try {
      const res = await fetch(`${API_URL}/rentals/${rentalId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert("✅ Status updated and product state reconciled!");
        fetchAllData();
      }
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleSync = async () => {
    try {
      const res = await fetch(`${API_URL}/rentals/admin/sync-products`, {
        method: "POST",
      });
      const data = await res.json();
      alert(`✅ ${data.message}`);
      fetchAllData();
    } catch (err) {
      alert("Sync failed: " + err.message);
    }
  };

  // Filter functions
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (userFilter) {
      case "pending_aadhaar":
        return u.aadhaarVerificationStatus === "pending";
      case "pending_seller":
        return u.sellerStatus === "pending";
      case "sellers":
        return u.isSeller;
      case "verified":
        return u.isAadhaarVerified;
      default:
        return true;
    }
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (productFilter) {
      case "pending":
        return p.status === "pending_admin_approval";
      case "active":
        return p.status === "active";
      case "on_rent":
        return p.status === "on_rent";
      case "disabled":
        return p.status === "disabled";
      default:
        return true;
    }
  });

  // Tab configs
  const tabs = [
    { id: "Overview", icon: "📊", label: "Overview" },
    {
      id: "Approvals",
      icon: "✅",
      label: "Approvals",
      badge:
        stats.pendingProducts + stats.pendingAadhaar + stats.pendingSellers,
    },
    { id: "Users", icon: "👥", label: "Users" },
    { id: "Products", icon: "👗", label: "Products" },
    { id: "Rentals", icon: "📦", label: "Rentals" },
    { id: "Delivery", icon: "🚚", label: "Delivery" },
    { id: "Analytics", icon: "📈", label: "Analytics" },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="font-bold uppercase tracking-widest">
            Loading Dashboard...
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f0f11] border-r border-white/10 p-6 flex flex-col fixed h-full">
        <div className="mb-8">
          <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-1">
            CLOSETRUSH
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">
            Super Admin Console
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl text-left font-medium transition-all flex items-center gap-3 relative ${activeTab === tab.id
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/10"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute right-4 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/admin-login");
            }}
            className="w-full p-4 rounded-xl text-left font-medium text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              {activeTab}
            </h1>
            <p className="text-gray-500">Welcome back, Commander</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-pink-500/20 text-pink-500 border border-pink-500/30 rounded-lg hover:bg-pink-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              🪄 Sync Live Status
            </button>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm font-bold flex items-center gap-2"
            >
              🔄 Refresh
            </button>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center font-bold text-lg">
              SA
            </div>
          </div>
        </header>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Overview" && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon="👥"
                    color="bg-cyan-400"
                  />
                  <StatCard
                    title="Active Sellers"
                    value={stats.sellers}
                    icon="🏪"
                    color="bg-purple-400"
                  />
                  <StatCard
                    title="Active Listings"
                    value={stats.activeListings}
                    icon="👗"
                    color="bg-pink-400"
                  />
                  <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon="💰"
                    color="bg-green-400"
                  />
                </div>

                {/* Pending Alerts */}
                <div className="grid grid-cols-3 gap-6">
                  {stats.pendingProducts > 0 && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-6 rounded-2xl border border-orange-500/30 cursor-pointer hover:border-orange-500 transition-all"
                      onClick={() => setActiveTab("Approvals")}
                    >
                      <div className="text-4xl font-black text-orange-400">
                        {stats.pendingProducts}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        Products awaiting approval
                      </div>
                    </motion.div>
                  )}
                  {stats.pendingAadhaar > 0 && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-2xl border border-blue-500/30 cursor-pointer hover:border-blue-500 transition-all"
                      onClick={() => setActiveTab("Approvals")}
                    >
                      <div className="text-4xl font-black text-blue-400">
                        {stats.pendingAadhaar}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        Aadhaar verifications pending
                      </div>
                    </motion.div>
                  )}
                  {stats.pendingSellers > 0 && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-2xl border border-purple-500/30 cursor-pointer hover:border-purple-500 transition-all"
                      onClick={() => setActiveTab("Approvals")}
                    >
                      <div className="text-4xl font-black text-purple-400">
                        {stats.pendingSellers}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        Seller applications pending
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Recent Rentals */}
                <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Rentals</h3>
                  <div className="space-y-3">
                    {rentals.slice(0, 5).map((rental, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg" />
                          <div>
                            <div className="font-bold">
                              {rental.productId?.name || "Product"}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{rental.renterId?.username || "User"} → @
                              {rental.ownerId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge status={rental.status} />
                          <div className="text-sm text-gray-400 mt-1">
                            ₹{rental.totalAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Approvals" && (
              <div className="space-y-8">
                {/* Product Approvals */}
                <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      👗 Product Approvals
                      {stats.pendingProducts > 0 && (
                        <span className="px-2 py-1 bg-orange-500 text-black text-xs font-bold rounded-full">
                          {stats.pendingProducts}
                        </span>
                      )}
                    </h3>
                  </div>
                  {products.filter((p) => p.status === "pending_admin_approval")
                    .length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      ✅ No products pending approval
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {products
                        .filter((p) => p.status === "pending_admin_approval")
                        .map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-20 bg-gray-800 rounded-lg overflow-hidden">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-lg">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Owner: @{product.owner} • ₹{product.price}/hr
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                                    {product.category}
                                  </span>
                                  <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">
                                    {product.size}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowProductModal(true);
                                }}
                                className="px-4 py-2 border border-white/20 text-white text-xs font-bold uppercase rounded-lg hover:bg-white/10 transition-all"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleApproveProduct(product._id)
                                }
                                className="px-4 py-2 bg-green-500 text-black text-xs font-bold uppercase rounded-lg hover:bg-green-400 transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setRejectionReason("");
                                  setShowProductModal(true);
                                }}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Aadhaar Verifications */}
                <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      🪪 Aadhaar Verifications
                      {stats.pendingAadhaar > 0 && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                          {stats.pendingAadhaar}
                        </span>
                      )}
                    </h3>
                  </div>
                  {users.filter(
                    (u) => u.aadhaarVerificationStatus === "pending",
                  ).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      ✅ No Aadhaar verifications pending
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users
                        .filter(
                          (u) => u.aadhaarVerificationStatus === "pending",
                        )
                        .map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-lg font-bold">
                                {user.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold">
                                  {user.fullName || user.username}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {user.email}
                                </div>
                                <div className="text-xs text-cyan-400 font-mono mt-1">
                                  Aadhaar:{" "}
                                  {user.aadhaarNumber
                                    ?.replace(/(\d{4})/g, "$1 ")
                                    .trim() || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApproveAadhaar(user._id)}
                                className="px-4 py-2 bg-green-500 text-black text-xs font-bold uppercase rounded-lg hover:bg-green-400 transition-all"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setRejectionReason("");
                                  setShowUserModal(true);
                                }}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Seller Applications */}
                <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      🏪 Seller Applications
                      {stats.pendingSellers > 0 && (
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                          {stats.pendingSellers}
                        </span>
                      )}
                    </h3>
                  </div>
                  {users.filter((u) => u.sellerStatus === "pending").length ===
                    0 ? (
                    <div className="text-center py-10 text-gray-500">
                      ✅ No seller applications pending
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users
                        .filter((u) => u.sellerStatus === "pending")
                        .map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold">
                                {user.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold">
                                  {user.fullName || user.username}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {user.email}
                                </div>
                                {user.sellerDetails && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {user.sellerDetails.businessName ||
                                      user.sellerDetails.reason}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApproveSeller(user._id)}
                                className="px-4 py-2 bg-green-500 text-black text-xs font-bold uppercase rounded-lg hover:bg-green-400 transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectSeller(user._id)}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Users" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#0f0f11] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-3 bg-[#0f0f11] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Users</option>
                    <option value="sellers">Sellers Only</option>
                    <option value="verified">Aadhaar Verified</option>
                    <option value="pending_aadhaar">Pending Aadhaar</option>
                    <option value="pending_seller">Pending Seller</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="bg-[#0f0f11] rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          User
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Role
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Aadhaar
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Seller
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Joined
                        </th>
                        <th className="text-right p-4 text-xs font-bold uppercase text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-t border-white/5 hover:bg-white/5"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                                {user.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold">{user.username}</div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge status={user.role || "user"} />
                          </td>
                          <td className="p-4">
                            <Badge
                              status={
                                user.aadhaarVerificationStatus ||
                                "not_submitted"
                              }
                            />
                          </td>
                          <td className="p-4">
                            {user.isSeller ? (
                              <Badge status="approved" />
                            ) : user.sellerStatus === "pending" ? (
                              <Badge status="pending" />
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="px-3 py-1 border border-white/20 rounded text-xs font-bold hover:bg-white hover:text-black transition-all"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Products" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#0f0f11] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="px-4 py-3 bg-[#0f0f11] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Products</option>
                    <option value="pending">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="on_rent">On Rent</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-[#0f0f11] rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all"
                    >
                      <div className="h-48 bg-gray-800 relative">
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge status={product.status} />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-bold uppercase mb-1">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          @{product.owner}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400 font-bold">
                            ₹{product.price}/hr
                          </span>
                          <div className="flex gap-2">
                            {product.status === "pending_admin_approval" && (
                              <button
                                onClick={() =>
                                  handleApproveProduct(product._id)
                                }
                                className="px-2 py-1 bg-green-500 text-black text-xs font-bold rounded"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded hover:bg-red-500 hover:text-white"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Rentals" && (
              <div className="space-y-6">
                <div className="bg-[#0f0f11] rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Product
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Renter
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Owner
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Status
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Amount
                        </th>
                        <th className="text-left p-4 text-xs font-bold uppercase text-gray-400">
                          Date
                        </th>
                        <th className="text-right p-4 text-xs font-bold uppercase text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((rental) => (
                        <tr
                          key={rental._id}
                          className="border-t border-white/5 hover:bg-white/5"
                        >
                          <td className="p-4 font-bold">
                            {rental.productId?.name || "N/A"}
                          </td>
                          <td className="p-4 text-sm">
                            @{rental.renterId?.username || "N/A"}
                          </td>
                          <td className="p-4 text-sm">@{rental.ownerId}</td>
                          <td className="p-4">
                            <Badge status={rental.status} />
                          </td>
                          <td className="p-4 text-green-400 font-bold">
                            ₹{rental.totalAmount}
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {new Date(rental.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            {rental.status !== "completed" && (
                              <button
                                onClick={() =>
                                  handleUpdateRentalStatus(
                                    rental._id,
                                    "completed",
                                  )
                                }
                                className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[10px] font-black uppercase hover:bg-green-500 hover:text-black transition-all"
                              >
                                Force Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Delivery" && (
              <div className="space-y-8">
                {/* Sub-Tabs */}
                <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5 w-fit">
                  <button
                    onClick={() => setDeliverySubTab("Requests")}
                    className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${deliverySubTab === "Requests"
                      ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      : "text-gray-500 hover:text-white"
                      }`}
                  >
                    Pickup Requests
                  </button>
                  <button
                    onClick={() => setDeliverySubTab("Fleet")}
                    className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${deliverySubTab === "Fleet"
                      ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      : "text-gray-500 hover:text-white"
                      }`}
                  >
                    Logistics Fleet
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={deliverySubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {deliverySubTab === "Requests" ? (
                      <PickupRequests />
                    ) : (
                      <DeliveryManagement />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {activeTab === "Analytics" && (
              <div className="space-y-8">
                {" "}
                <div className="grid grid-cols-2 gap-6">
                  {" "}
                  <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-6">
                    {" "}
                    <h3 className="text-xl font-bold mb-4">Platform Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Rentals</span>
                        <span className="font-bold text-xl">
                          {rentals.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Completed Rentals</span>
                        <span className="font-bold text-xl text-green-400">
                          {
                            rentals.filter((r) => r.status === "returned")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Rentals</span>
                        <span className="font-bold text-xl text-cyan-400">
                          {stats.activeRentals}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pending Requests</span>
                        <span className="font-bold text-xl text-yellow-400">
                          {
                            rentals.filter((r) => r.status === "requested")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0f0f11] rounded-2xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Revenue Breakdown
                    </h3>
                    <div className="text-5xl font-black text-green-400 mb-4">
                      ₹{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      Total platform revenue from completed rentals
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
                {selectedUser.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xl font-bold">
                  {selectedUser.fullName || selectedUser.username}
                </div>
                <div className="text-gray-400">{selectedUser.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  @{selectedUser.username}
                </div>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-xs text-gray-500 uppercase mb-2">
                  Aadhaar
                </div>
                <Badge
                  status={
                    selectedUser.aadhaarVerificationStatus || "not_submitted"
                  }
                />
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-xs text-gray-500 uppercase mb-2">
                  Seller
                </div>
                <Badge status={selectedUser.sellerStatus || "none"} />
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-xs text-gray-500 uppercase mb-2">Role</div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${selectedUser.isSeller ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                >
                  {selectedUser.isSeller ? "Seller" : "Buyer"}
                </span>
              </div>
            </div>

            {/* Aadhaar Details */}
            {(selectedUser.aadhaarNumber ||
              selectedUser.aadhaarFrontImage ||
              selectedUser.aadhaarBackImage) && (
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🪪</span>
                    <span className="text-sm font-bold text-yellow-400 uppercase">
                      Aadhaar Information
                    </span>
                  </div>

                  {selectedUser.aadhaarNumber && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        Aadhaar Number
                      </div>
                      <div className="font-mono text-lg bg-black/30 p-2 rounded">
                        {selectedUser.aadhaarNumber}
                      </div>
                    </div>
                  )}

                  {selectedUser.permanentAddress && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        Permanent Address (from Aadhaar)
                      </div>
                      <div className="text-sm text-gray-300 bg-black/30 p-2 rounded">
                        {selectedUser.permanentAddress}
                      </div>
                    </div>
                  )}

                  {(selectedUser.aadhaarFrontImage ||
                    selectedUser.aadhaarBackImage) && (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedUser.aadhaarFrontImage && (
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Front
                            </div>
                            <a
                              href={selectedUser.aadhaarFrontImage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={selectedUser.aadhaarFrontImage}
                                alt="Aadhaar Front"
                                className="w-full h-24 object-cover rounded-lg border border-white/10 hover:border-cyan-500 transition-all"
                              />
                            </a>
                          </div>
                        )}
                        {selectedUser.aadhaarBackImage && (
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Back
                            </div>
                            <a
                              href={selectedUser.aadhaarBackImage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={selectedUser.aadhaarBackImage}
                                alt="Aadhaar Back"
                                className="w-full h-24 object-cover rounded-lg border border-white/10 hover:border-cyan-500 transition-all"
                              />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}

            {/* Seller/Shop Details */}
            {(selectedUser.shopName ||
              selectedUser.businessName ||
              selectedUser.phone) && (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏪</span>
                    <span className="text-sm font-bold text-green-400 uppercase">
                      Shop / Business Details
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {selectedUser.shopName && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">
                          Shop Name
                        </div>
                        <div className="text-sm font-bold">
                          {selectedUser.shopName}
                        </div>
                      </div>
                    )}
                    {selectedUser.businessName && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">
                          Business Name
                        </div>
                        <div className="text-sm">{selectedUser.businessName}</div>
                      </div>
                    )}
                    {selectedUser.phone && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">
                          Phone
                        </div>
                        <div className="text-sm font-mono">
                          {selectedUser.phone}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUser.address && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        Pickup Address
                      </div>
                      <div className="text-sm text-gray-300 bg-black/30 p-2 rounded">
                        {selectedUser.address}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Saved Addresses */}
            {selectedUser.savedAddresses &&
              selectedUser.savedAddresses.length > 0 && (
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📍</span>
                    <span className="text-sm font-bold text-cyan-400 uppercase">
                      Saved Delivery Addresses
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedUser.savedAddresses.map((addr, i) => (
                      <div
                        key={i}
                        className="text-sm text-gray-300 bg-black/30 p-2 rounded flex items-start gap-2"
                      >
                        <span className="text-xs bg-white/10 px-1 py-0.5 rounded">
                          {i + 1}
                        </span>
                        {typeof addr === "string"
                          ? addr
                          : addr.fullAddress || addr.address}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Account Info */}
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-xs text-gray-500 uppercase mb-3">
                Account Information
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{" "}
                  <span>
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>{" "}
                  <span className="font-mono text-xs">
                    {selectedUser._id?.slice(-8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Aadhaar Approval Actions */}
            {selectedUser.aadhaarVerificationStatus === "pending" && (
              <div className="space-y-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="text-sm font-bold text-orange-400 uppercase">
                  ⚠️ Aadhaar Verification Required
                </div>
                <input
                  type="text"
                  placeholder="Rejection reason (optional)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveAadhaar(selectedUser._id)}
                    className="flex-1 py-3 bg-green-500 text-black font-bold uppercase rounded-xl hover:bg-green-400"
                  >
                    ✓ Verify Aadhaar
                  </button>
                  <button
                    onClick={() =>
                      handleRejectAadhaar(selectedUser._id, rejectionReason)
                    }
                    className="flex-1 py-3 bg-red-500 text-white font-bold uppercase rounded-xl hover:bg-red-400"
                  >
                    ✗ Reject Aadhaar
                  </button>
                </div>
              </div>
            )}

            {/* Seller Approval Actions */}
            {selectedUser.sellerStatus === "pending" && (
              <div className="space-y-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="text-sm font-bold text-purple-400 uppercase">
                  🏪 Seller Application Pending
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `${API_URL}/users/${selectedUser._id}/approve-seller`,
                          { method: "POST" },
                        );
                        if (res.ok) {
                          alert("Seller approved!");
                          fetchData();
                          setShowUserModal(false);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 py-3 bg-green-500 text-black font-bold uppercase rounded-xl hover:bg-green-400"
                  >
                    ✓ Approve Seller
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `${API_URL}/users/${selectedUser._id}/reject-seller`,
                          { method: "POST" },
                        );
                        if (res.ok) {
                          alert("Seller rejected");
                          fetchData();
                          setShowUserModal(false);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 py-3 bg-red-500 text-white font-bold uppercase rounded-xl hover:bg-red-400"
                  >
                    ✗ Reject Seller
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all"
              >
                ⚠ Delete User & All Data
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Product Details"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-32 h-40 bg-gray-800 rounded-xl overflow-hidden">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold uppercase">
                  {selectedProduct.name}
                </div>
                <div className="text-gray-400 mt-1">
                  by @{selectedProduct.owner}
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge status={selectedProduct.status} />
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                    {selectedProduct.category}
                  </span>
                </div>
                <div className="text-3xl font-black text-cyan-400 mt-4">
                  ₹{selectedProduct.price}/hr
                </div>
              </div>
            </div>

            {selectedProduct.description && (
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-xs text-gray-500 uppercase mb-2">
                  Description
                </div>
                <p className="text-sm text-gray-300">
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {selectedProduct.status === "pending_admin_approval" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Rejection reason (required for rejection)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleApproveProduct(selectedProduct._id);
                      setShowProductModal(false);
                    }}
                    className="flex-1 py-3 bg-green-500 text-black font-bold uppercase rounded-xl hover:bg-green-400"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleRejectProduct(selectedProduct._id, rejectionReason)
                    }
                    disabled={!rejectionReason}
                    className="flex-1 py-3 bg-red-500 text-white font-bold uppercase rounded-xl hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
