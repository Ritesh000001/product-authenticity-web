
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import QRCode from "qrcode";

function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingBatchId, setApprovingBatchId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [showQRPreview, setShowQRPreview] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const snap = await getDocs(collection(db, "batches"));
      let list = [];

      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });

      setBatches(list);
    } catch (error) {
      showToast("Failed to fetch batches", "error");
    }
  };

  // SAME CODE GENERATOR - UNTOUCHED
  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // 🔥 SAME APPROVAL LOGIC - ZERO CHANGE
const approveBatch = async (batch) => {
  setApprovingBatchId(batch.id);
  setLoading(true);

  try {
    console.log("Approving batch:", batch);

    // ✅ FIX 1: companyId check
    if (!batch.companyId) {
      throw new Error("Company ID missing in batch");
    }

    // ✅ FIX 2: quantity safe
    const quantity = Number(batch.quantity);
    if (!quantity || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    for (let i = 0; i < quantity; i++) {
      const productId = `PID-${batch.batch}-${i + 1}`;
      const scratchCode = generateCode();

      const qrData = JSON.stringify({
  productId,
  batch: batch.batch
});
      const qrImage = await QRCode.toDataURL(qrData);

      await addDoc(collection(db, "products"), {
        name: batch.name || "Default Product",
        batch: batch.batch || "BATCH",
        type: batch.type || "General",
        productId,
        scratchCode,
        qrImage,

        // 🔥🔥🔥 MAIN FIX
        companyId: batch.companyId, 

        isUsed: false,
        status: "approved",
        createdAt: new Date().toISOString()
      });

      console.log("Product created:", productId);
    }

    await updateDoc(doc(db, "batches", batch.id), {
      status: "approved"
    });

    showToast(`✅ ${quantity} products generated successfully!`, "success");

    fetchBatches();

  } catch (error) {
    console.error("APPROVAL ERROR:", error);
    showToast(error.message, "error");
  }

  setLoading(false);
  setApprovingBatchId(null);
};

  // QR Preview
  const previewQR = async (batch) => {
    const productId = generateCode();
    const qrData = `productId:${productId}`;
    try {
      const qrImage = await QRCode.toDataURL(qrData);
      setShowQRPreview({ ...batch, qrImage, productId });
    } catch (error) {
      showToast("QR preview failed", "error");
    }
  };

  // Toast (UI only)
  const showToast = (message, type = "error") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 max-w-sm ${
      type === "success" 
        ? "bg-emerald-500 text-white" 
        : "bg-red-500 text-white"
    }`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        ${type === "success" ? "✅" : "❌"}
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.replace("translate-x-full", "translate-x-0"), 100);
    setTimeout(() => toast.remove(), 5000);
  };

  // Filters
  const filteredBatches = batches.filter(b => {
    const matchesSearch = 
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.batch?.toLowerCase().includes(search.toLowerCase()) ||
      b.companyId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: batches.length,
    pending: batches.filter(b => b.status === "pending").length,
    approved: batches.filter(b => b.status === "approved").length
  };

  return (
    <div className="ml-64 p-8 w-full bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 min-h-screen">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-white/0 bg-clip-text text-transparent mb-4">
          Batch Approval Panel
        </h1>
        <p className="text-xl text-white/80">Review & generate QR codes for pending batches</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center">
          <div className="text-4xl font-black text-blue-400 mb-2">{stats.total}</div>
          <div className="text-white/90 font-semibold">Total Batches</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center">
          <div className="text-4xl font-black text-yellow-400 mb-2">{stats.pending}</div>
          <div className="text-white/90 font-semibold">Pending</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center">
          <div className="text-4xl font-black text-emerald-400 mb-2">{stats.approved}</div>
          <div className="text-white/90 font-semibold">Approved</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <input
          placeholder="🔍 Search batches by name, ID or company..."
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

      {/* Batches List */}
      <div className="space-y-6">
        {filteredBatches.map((b) => (
          <div key={b.id} className="group">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              
              {/* Batch Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-white/80 font-bold text-sm uppercase tracking-wide mb-2">Product</label>
                  <p className="text-2xl font-black text-white">{b.name}</p>
                </div>
                <div>
                  <label className="block text-white/80 font-bold text-sm uppercase tracking-wide mb-2">Batch ID</label>
                  <p className="text-xl font-mono bg-white/10 px-4 py-2 rounded-xl text-white">{b.batch}</p>
                </div>
                <div>
                  <label className="block text-white/80 font-bold text-sm uppercase tracking-wide mb-2">Type</label>
                  <p className="text-xl font-semibold text-blue-200">{b.type}</p>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-white/80 font-bold text-sm uppercase tracking-wide mb-2">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-black text-purple-400">{b.quantity}</div>
                    <div className={`w-2 h-2 rounded-full ${
                      b.status === "approved" ? "bg-emerald-400" : "bg-yellow-400"
                    } animate-pulse`}></div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-8">
                <div className={`px-6 py-2 rounded-full font-bold text-lg ${
                  b.status === "approved"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-400/30"
                }`}>
                  {b.status.toUpperCase()}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  {b.status === "pending" && (
                    <button
                      onClick={() => previewQR(b)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview QR
                    </button>
                  )}
                  
                  {b.status === "pending" && (
                    <button
                      onClick={() => approveBatch(b)}
                      disabled={loading && approvingBatchId === b.id}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-3 uppercase tracking-wide group"
                    >
                      {loading && approvingBatchId === b.id ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approve Batch</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredBatches.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl text-white/20 mb-8">📦</div>
            <h3 className="text-3xl font-bold text-white/80 mb-4">No batches found</h3>
            <p className="text-xl text-white/60 mb-8">{search ? "Try different search" : "No pending batches"}</p>
            <button
              onClick={fetchBatches}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all"
            >
              Refresh List
            </button>
          </div>
        )}
      </div>

      {/* QR Preview Modal */}
      {showQRPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto border border-white/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">QR Preview</h3>
              <button
                onClick={() => setShowQRPreview(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="text-center">
              <img src={showQRPreview.qrImage} alt="QR Code" className="mx-auto mb-6 shadow-2xl rounded-xl p-4 bg-white" />
              <div className="space-y-2">
                <p className="font-mono text-xl bg-gray-100 px-4 py-2 rounded-lg">{showQRPreview.productId}</p>
                <p className="font-mono text-lg text-gray-600">Scratch: {showQRPreview.scratchCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBatches;