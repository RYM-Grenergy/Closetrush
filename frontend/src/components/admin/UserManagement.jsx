import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import config from '../../config';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, buyers, sellers, pending_sellers, pending_aadhaar
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetch(`${config.API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const refreshUsers = () => {
    setLoading(true);
    fetch(`${config.API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await fetch(`${config.API_URL}/users/${id}`, {
        method: "DELETE",
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAadhaar = async (userId) => {
    if (!window.confirm("Approve Aadhaar verification for this user?")) return;
    try {
      const res = await fetch(
        `${config.API_URL}/users/${userId}/verify-aadhaar`,
        {
          method: "PUT",
        },
      );
      if (res.ok) {
        alert("✅ Aadhaar verification approved!");
        refreshUsers();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve Aadhaar");
    }
  };

  const handleRejectAadhaar = async (userId) => {
    const reason = window.prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      const res = await fetch(
        `${config.API_URL}/users/${userId}/reject-aadhaar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );
      if (res.ok) {
        alert("❌ Aadhaar verification rejected");
        refreshUsers();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reject Aadhaar");
    }
  };

  const handleApproveSeller = async (userId) => {
    if (!window.confirm("Approve this user as a seller?")) return;
    try {
      const res = await fetch(
        `${config.API_URL}/users/${userId}/approve-seller`,
        {
          method: "PUT",
        },
      );
      if (res.ok) {
        alert("✅ Seller approved!");
        refreshUsers();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve seller");
    }
  };

  const handleRejectSeller = async (userId) => {
    const reason = window.prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      const res = await fetch(
        `${config.API_URL}/users/${userId}/reject-seller`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );
      if (res.ok) {
        alert("❌ Seller application rejected");
        refreshUsers();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reject seller");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "pending_aadhaar")
      return user.aadhaarVerificationStatus === "pending";
    if (filter === "pending_sellers") return user.sellerStatus === "pending";
    if (filter === "sellers")
      return user.isSeller && user.sellerStatus === "approved";
    if (filter === "buyers") return !user.isSeller;
    return true; // all
  });

  if (loading) return <div className="text-white">Loading Users...</div>;

  return (
    <div className="bg-[#0f0f11] rounded-3xl border border-white/5 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          User Management ({filteredUsers.length})
        </h2>
        <div className="flex gap-2">
          {[
            "all",
            "pending_aadhaar",
            "pending_sellers",
            "sellers",
            "buyers",
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${filter === f
                  ? "bg-cyan-500 text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 rounded-tl-xl">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Aadhaar Status</th>
              <th className="p-4">Seller Status</th>
              <th className="p-4">Role</th>
              <th className="p-4 rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.fullName}</div>
                </td>
                <td className="p-4 text-gray-400 font-mono text-sm">
                  {user.email}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.aadhaarVerificationStatus === "verified"
                          ? "bg-green-500/20 text-green-400"
                          : user.aadhaarVerificationStatus === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : user.aadhaarVerificationStatus === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {user.aadhaarVerificationStatus || "not_submitted"}
                    </span>
                    {user.aadhaarVerificationStatus === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApproveAadhaar(user._id)}
                          className="text-green-400 hover:text-green-300 text-xs"
                          title="Approve Aadhaar"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleRejectAadhaar(user._id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                          title="Reject Aadhaar"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.sellerStatus === "approved"
                          ? "bg-purple-500/20 text-purple-400"
                          : user.sellerStatus === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : user.sellerStatus === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {user.sellerStatus}
                    </span>
                    {user.sellerStatus === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApproveSeller(user._id)}
                          className="text-purple-400 hover:text-purple-300 text-xs"
                          title="Approve Seller"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleRejectSeller(user._id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                          title="Reject Seller"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === "admin"
                        ? "bg-pink-500/20 text-pink-400"
                        : "bg-green-500/20 text-green-400"
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailsModal(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-400 hover:text-red-300 font-bold text-xs uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f0f11] w-full max-w-3xl rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase">User Details</h2>
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
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                        Username
                      </div>
                      <div className="text-white font-bold">
                        @{selectedUser.username}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                        Full Name
                      </div>
                      <div className="text-white">
                        {selectedUser.fullName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                        Email
                      </div>
                      <div className="text-white font-mono text-xs">
                        {selectedUser.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                        Role
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedUser.role === "admin"
                              ? "bg-pink-500/20 text-pink-400"
                              : "bg-green-500/20 text-green-400"
                            }`}
                        >
                          {selectedUser.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aadhaar Verification */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    🛡️ Aadhaar Verification
                  </h3>
                  <div className="bg-black/30 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold uppercase ${selectedUser.aadhaarVerificationStatus === "verified"
                            ? "bg-green-500/20 text-green-400"
                            : selectedUser.aadhaarVerificationStatus ===
                              "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : selectedUser.aadhaarVerificationStatus ===
                                "rejected"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                      >
                        {selectedUser.aadhaarVerificationStatus ||
                          "Not Submitted"}
                      </span>
                    </div>
                    {selectedUser.aadhaarVerificationStatus === "verified" && (
                      <div className="text-green-400 text-sm flex items-center gap-2">
                        ✅ Identity verified. User can apply to sell!
                      </div>
                    )}
                    {selectedUser.aadhaarVerificationStatus === "rejected" &&
                      selectedUser.aadhaarRejectionReason && (
                        <div className="text-red-400 text-sm">
                          <strong>Rejection Reason:</strong>{" "}
                          {selectedUser.aadhaarRejectionReason}
                        </div>
                      )}
                  </div>
                </div>

                {/* Seller Information */}
                {(selectedUser.isSeller ||
                  selectedUser.sellerStatus === "pending") && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                        🎉 Seller Details
                      </h3>
                      <div className="bg-black/30 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            Seller Status
                          </span>
                          <span
                            className={`px-3 py-1 rounded text-xs font-bold uppercase ${selectedUser.sellerStatus === "approved"
                                ? "bg-purple-500/20 text-purple-400"
                                : selectedUser.sellerStatus === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                          >
                            {selectedUser.sellerStatus}
                          </span>
                        </div>

                        {selectedUser.shopName && (
                          <div>
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                              Shop / Display Name
                            </div>
                            <div className="text-white font-bold text-lg">
                              {selectedUser.shopName}
                            </div>
                          </div>
                        )}

                        {selectedUser.phoneNumber && (
                          <div>
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                              Phone Number
                            </div>
                            <div className="text-white font-mono">
                              {selectedUser.phoneNumber}
                            </div>
                          </div>
                        )}

                        {selectedUser.pickupAddress && (
                          <div>
                            <div className="text-gray-500 text-xs uppercase font-bold mb-2">
                              📍 Pickup Address
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg space-y-2 text-sm">
                              {selectedUser.pickupAddress.street && (
                                <div>
                                  <span className="text-gray-500">Street:</span>
                                  <span className="text-white ml-2">
                                    {selectedUser.pickupAddress.street}
                                  </span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                {selectedUser.pickupAddress.city && (
                                  <div>
                                    <span className="text-gray-500">City:</span>
                                    <span className="text-white ml-2">
                                      {selectedUser.pickupAddress.city}
                                    </span>
                                  </div>
                                )}
                                {selectedUser.pickupAddress.state && (
                                  <div>
                                    <span className="text-gray-500">State:</span>
                                    <span className="text-white ml-2">
                                      {selectedUser.pickupAddress.state}
                                    </span>
                                  </div>
                                )}
                                {selectedUser.pickupAddress.pincode && (
                                  <div>
                                    <span className="text-gray-500">
                                      Pincode:
                                    </span>
                                    <span className="text-white ml-2">
                                      {selectedUser.pickupAddress.pincode}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedUser.sellerStatus === "rejected" &&
                          selectedUser.sellerRejectionReason && (
                            <div className="text-red-400 text-sm">
                              <strong>Rejection Reason:</strong>{" "}
                              {selectedUser.sellerRejectionReason}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
