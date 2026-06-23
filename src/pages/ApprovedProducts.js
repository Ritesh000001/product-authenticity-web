
  import React, { useEffect, useState } from "react";
  import Sidebar from "../components/Sidebar";
  import { db, auth } from "../firebase/config";
  import { collection, onSnapshot, query, where } from "firebase/firestore";
  import Papa from "papaparse";

  function ApprovedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterBatch, setFilterBatch] = useState("all");

    useEffect(() => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "batches"),
        where("companyId", "==", user.uid),
        where("status", "==", "approved")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = [];

        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        setProducts(list);
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    const downloadCSV = () => {
      if (products.length === 0) {
        showToast("No approved products available", "error");
        return;
      }

      const csvData = products.map(p => ({
        productId: p.productId,
        scratchCode: p.scratchCode,
        batch: p.batch,
        type: p.type
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = `approved_products_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();

      showToast("CSV downloaded successfully!", "success");
    };

    const copyToClipboard = async (text, type) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${type} copied to clipboard!`, "success");
      } catch (err) {
        showToast("Copy failed", "error");
      }
    };

    const showToast = (message, type = "error") => {
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 ${
        type === "success" ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
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
        p.productId?.toLowerCase().includes(search.toLowerCase()) ||
        p.scratchCode?.toLowerCase().includes(search.toLowerCase());
      
      const matchesBatch = filterBatch === "all" || p.batch === filterBatch;
      return matchesSearch && matchesBatch;
    });

    const uniqueBatches = [...new Set(products.map(p => p.batch))];
    const stats = {
      total: products.length,
      batches: uniqueBatches.length
    };

    if (loading) {
      return (
        <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
          <Sidebar />
          <div className="ml-64 p-8 w-full flex items-center justify-center">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-300 rounded-xl w-96 mx-auto"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-300 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <Sidebar />

        <div className="ml-64 p-8 w-full">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-black bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">
              Approved Products
            </h1>
            <p className="text-gray-500 mt-3 text-lg">
              Ready for printing and distribution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all group">
              <div className="text-4xl font-black text-blue-600 mb-2">{stats.total}</div>
              <div className="text-gray-700 font-semibold">Total Products</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all group">
              <div className="text-4xl font-black text-emerald-600 mb-2">{stats.batches}</div>
              <div className="text-gray-700 font-semibold">Batch Groups</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all col-span-1 md:col-span-2 lg:col-span-2 group">
              <button
                onClick={downloadCSV}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3 uppercase tracking-wide group-hover:tracking-widest"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10l-5.5 5.5m0 0L8 18l5.5-5.5M12 10l5.5 5.5m-5.5 0L16 18l-5.5-5.5M12 10V5m0 0L7 10m5-5l5 5" />
                </svg>
                <span>Download CSV Export</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <input
              placeholder="🔍 Search by name, batch, ID or scratch code..."
              className="flex-1 bg-white/60 backdrop-blur-sm border border-gray-300 p-4 rounded-2xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg shadow-lg hover:shadow-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {uniqueBatches.length > 0 && (
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="bg-white/60 backdrop-blur-sm border border-gray-300 p-4 rounded-2xl text-gray-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg hover:shadow-xl min-w-[200px]"
              >
                <option value="all">All Batches ({stats.batches})</option>
                {uniqueBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p, i) => (
              <div key={p.id || i} className="group bg-white/70 backdrop-blur-lg border border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{p.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{p.batch}</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ✔ Approved
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-3"></div>

                {/* Product ID */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">PRODUCT ID</p>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => copyToClipboard(p.productId, "Product ID")}
                  >
                    {p.productId || "Auto Generated"}
                  </div>
                </div>

                {/* Scratch Code */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">SCRATCH CODE</p>
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => copyToClipboard(p.scratchCode, "Scratch Code")}
                  >
                    {p.scratchCode || "Hidden"}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between text-sm text-gray-600 mt-4">
                  <span>Type: {p.type}</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>

                {/* Print Button - Added at bottom */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head><title>Print ${p.productId}</title></head>
                          <body style="font-family: Arial; padding: 40px; max-width: 400px; margin: 0 auto;">
                            <h2 style="text-align: center; color: #1f2937;">${p.name}</h2>
                            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                              <div style="font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 2px; margin-bottom: 12px;">
                                ${p.productId}
                              </div>
                              <div style="font-size: 20px; text-align: center; color: #6b7280; font-family: monospace;">
                                Scratch: ${p.scratchCode}
                              </div>
                            </div>
                            <p style="text-align: center; color: #6b7280; font-size: 14px;">Scan QR + Enter Scratch Code</p>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v.5" />
                    </svg>
                    <span>Print Label</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && !loading && (
              <div className="col-span-full text-center py-24">
                <div className="text-8xl text-gray-300 mb-8 mx-auto">📦</div>
                <h3 className="text-3xl font-black text-gray-800 mb-4">No Approved Products</h3>
                <p className="text-xl text-gray-600 mb-8">Your approved batches will appear here</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    Refresh List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  export default ApprovedProducts;