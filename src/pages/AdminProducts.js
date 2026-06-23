
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "products"));
      let list = [];

      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });

      setProducts(list);
    } catch (error) {
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const approveProduct = async (id) => {
    try {
      await updateDoc(doc(db, "products", id), {
        status: "approved"
      });
      showToast("Product approved!", "success");
      fetchProducts();
    } catch (error) {
      showToast("Approval failed", "error");
    }
  };

  const bulkApprove = async () => {
    try {
      for (const id of selectedProducts) {
        await approveProduct(id);
      }
      setSelectedProducts(new Set());
      showToast(`${selectedProducts.size} products approved!`, "success");
    } catch (error) {
      showToast("Bulk approval failed", "error");
    }
  };

  // Toast UI only
  const showToast = (message, type = "error") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 ${
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.replace("translate-x-full", "translate-x-0"), 100);
    setTimeout(() => toast.remove(), 4000);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.batch?.toLowerCase().includes(search.toLowerCase()) ||
      p.productId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products.length,
    pending: products.filter(p => p.status === "pending").length,
    approved: products.filter(p => p.status === "approved").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded-xl w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="h-24 bg-white/10 rounded-2xl"></div>
              <div className="h-24 bg-white/10 rounded-2xl"></div>
              <div className="h-24 bg-white/10 rounded-2xl"></div>
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
            Product Approvals
          </h1>
          <p className="text-xl text-white/80">Review and approve newly generated products</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-blue-400 mb-2">{stats.total}</div>
            <div className="text-white/90 font-semibold">Total Products</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-yellow-400 mb-2">{stats.pending}</div>
            <div className="text-white/90 font-semibold">Pending Review</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-emerald-400 mb-2">{stats.approved}</div>
            <div className="text-white/90 font-semibold">Approved</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <input
            placeholder="🔍 Search by name, batch or product ID..."
            className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-2xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("pending")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === "pending"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25"
                  : "bg-white/20 hover:bg-white/30 border border-white/30"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === "approved"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25"
                  : "bg-white/20 hover:bg-white/30 border border-white/30"
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25"
                  : "bg-white/20 hover:bg-white/30 border border-white/30"
              }`}
            >
              All ({stats.total})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 p-4 rounded-2xl mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{selectedProducts.size}</span>
                </div>
                <span className="font-bold text-emerald-200">
                  {selectedProducts.size} products selected
                </span>
              </div>
              <button
                onClick={bulkApprove}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
              >
                Approve All Selected
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer group-hover:scale-105 transition-transform">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(p.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedProducts);
                        if (e.target.checked) {
                          newSet.add(p.id);
                        } else {
                          newSet.delete(p.id);
                        }
                        setSelectedProducts(newSet);
                      }}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                  </label>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      p.status === "approved" 
                        ? "bg-emerald-400 animate-pulse" 
                        : "bg-yellow-400"
                    }`}></div>
                    <div>
                      <p className="text-2xl font-black text-white truncate max-w-md">{p.name}</p>
                      <p className="text-white/70 font-mono text-sm">{p.productId}</p>
                    </div>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                  p.status === "approved"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-400/30"
                }`}>
                  {p.status?.toUpperCase() || "PENDING"}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">Batch</label>
                  <p className="font-mono bg-white/10 px-4 py-2 rounded-xl text-white">{p.batch}</p>
                </div>
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">Type</label>
                  <p className="font-semibold text-blue-200">{p.type}</p>
                </div>
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">Company</label>
                  <p className="text-white/90 truncate">{p.companyId}</p>
                </div>
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">Status</label>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${
                    p.status === "approved" 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30" 
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                  }`}>
                    {p.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {p.status === "pending" && (
                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button
                    onClick={() => approveProduct(p.id)}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 uppercase tracking-wide group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve Product</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="text-8xl text-white/20 mb-8">📦</div>
            <h3 className="text-3xl font-bold text-white mb-4">No products found</h3>
            <p className="text-xl text-white/60 mb-8">{search ? "Try different search" : "No products to review"}</p>
            <button
              onClick={fetchProducts}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
            >
              Refresh Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;