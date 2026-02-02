import React, { useEffect, useState } from "react";
import config from '../../config';

export default function AllListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, active, on_rent, rejected
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch(`${config.API_URL}/products/admin/all`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing permanently?")) return;

    try {
      const res = await fetch(`${config.API_URL}/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveProduct = async (productId) => {
    if (!window.confirm("Approve this product listing?")) return;
    try {
      const res = await fetch(
        `${config.API_URL}/products/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "active",
            isApproved: true,
          }),
        },
      );
      if (res.ok) {
        alert("✅ Product approved!");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve product");
    }
  };

  const handleRejectProduct = async (productId) => {
    const reason = window.prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      const res = await fetch(
        `${config.API_URL}/products/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "draft",
            isApproved: false,
            rejectionReason: reason,
          }),
        },
      );
      if (res.ok) {
        alert("❌ Product rejected");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reject product");
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${config.API_URL}/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingProduct),
        },
      );
      if (res.ok) {
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert("Failed to update.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === "pending")
      return product.status === "pending_admin_approval";
    if (filter === "active") return product.status === "active";
    if (filter === "on_rent") return product.status === "on_rent";
    if (filter === "rejected")
      return product.status === "draft" && product.rejectionReason;
    return true; // all
  });

  if (loading) return <div className="text-white">Loading Listings...</div>;

  return (
    <div className="bg-[#0f0f11] rounded-3xl border border-white/5 p-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          All Listings ({filteredProducts.length})
        </h2>
        <div className="flex gap-2">
          {["all", "pending", "active", "on_rent", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${filter === f
                ? "bg-cyan-500 text-black"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((item) => (
          <div
            key={item._id}
            className="bg-black/20 p-4 rounded-xl border border-white/5 flex gap-4 group hover:border-white/20 transition-all"
          >
            <div
              className={`w-16 h-16 rounded-lg ${item.bgClass || "bg-gray-800"} flex-shrink-0 overflow-hidden`}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{item.name}</div>
              <div className="text-xs text-gray-500 font-mono">
                ₹{item.price}/hr • @{item.owner}
              </div>
              <div className="mt-2 flex flex-wrap gap-1 items-center">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : item.status === "pending_admin_approval"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : item.status === "on_rent"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                >
                  {item.status}
                </span>
                {item.status === "pending_admin_approval" && (
                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={() => handleApproveProduct(item._id)}
                      className="px-2 py-1 bg-green-500 hover:bg-green-400 text-white text-[10px] font-bold uppercase rounded transition-all"
                      title="Approve"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectProduct(item._id)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold uppercase rounded transition-all"
                      title="Reject"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingProduct(item)}
                  className="text-white hover:text-cyan-400 text-xs font-bold uppercase transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-white hover:text-red-500 text-xs font-bold uppercase transition-colors"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No {filter === "all" ? "" : filter} products found
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1d] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Edit Listing</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Name
                </label>
                <input
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Price (/hr)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_admin_approval">
                      Pending Approval
                    </option>
                    <option value="active">Active</option>
                    <option value="on_rent">On Rent</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:bg-cyan-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
