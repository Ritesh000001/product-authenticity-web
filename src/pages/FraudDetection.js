


import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function FraudDetection() {
  const [frauds, setFrauds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("count"); // "count" or "productId"

  useEffect(() => {
    detectFraud();
  }, []);

  // ✅ SAME FRAUD LOGIC - ZERO CHANGE
  const detectFraud = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "scans"));

      let scanMap = {};

      snap.forEach(doc => {
        const data = doc.data();
        if (!scanMap[data.productId]) {
          scanMap[data.productId] = [];
        }
        scanMap[data.productId].push(data);
      });

      let fraudList = [];

      Object.keys(scanMap).forEach(productId => {
        if (scanMap[productId].length > 1) {
          fraudList.push({
            productId,
            count: scanMap[productId].length
          });
        }
      });

      setFrauds(fraudList);
    } catch (error) {
      showToast("Failed to detect fraud", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSeverity = (count) => {
    if (count > 10) return "CRITICAL";
    if (count > 5) return "HIGH";
    if (count > 2) return "MEDIUM";
    return "LOW";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      "CRITICAL": "from-red-500 to-rose-600",
      "HIGH": "from-orange-500 to-red-500", 
      "MEDIUM": "from-yellow-500 to-orange-500",
      "LOW": "from-emerald-500 to-green-600"
    };
    return colors[severity] || "from-gray-500 to-gray-600";
  };

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

  const exportCSV = () => {
    if (frauds.length === 0) {
      showToast("No fraud data to export", "error");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Product ID,Scan Count,Severity\n"
      + frauds.map(f => `"${f.productId}",${f.count},"${getSeverity(f.count)}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fraud_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Fraud report exported!", "success");
  };

  const sortedFrauds = frauds
    .filter(f => 
      f.productId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      return a.productId.localeCompare(b.productId);
    });

  const stats = {
    total: frauds.length,
    critical: frauds.filter(f => getSeverity(f.count) === "CRITICAL").length,
    highRisk: frauds.filter(f => getSeverity(f.count) === "HIGH").length
  };

  if (loading) {
    return (
      <div className="flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <AdminSidebar />
        <div className="ml-72 p-8 w-full flex items-center justify-center">
          <div className="animate-pulse space-y-6 max-w-4xl">
            <div className="h-12 bg-white/10 rounded-xl w-80"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-24 bg-white/10 rounded-3xl"></div>
              <div className="h-24 bg-white/10 rounded-3xl"></div>
              <div className="h-24 bg-white/10 rounded-3xl"></div>
            </div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 min-h-screen">
      <AdminSidebar />

      <div className="ml-72 p-8 w-full">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
            Fraud Detection
          </h1>
          <p className="text-xl text-white/80">Multiple scan attempts on same products</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-red-400 mb-2">{stats.total}</div>
            <div className="text-white/90 font-semibold">Total Fraud Cases</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-orange-400 mb-2">{stats.highRisk}</div>
            <div className="text-white/90 font-semibold">High Risk (5+)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-red-400 mb-2">{stats.critical}</div>
            <div className="text-white/90 font-semibold">Critical (10+)</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <input
            placeholder="🔍 Search product IDs..."
            className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-2xl text-white placeholder-white/70 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={() => setSortBy("count")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                sortBy === "count" 
                  ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/25" 
                  : "bg-white/20 hover:bg-white/30 border border-white/30"
              }`}
            >
              Sort by Count
            </button>
            <button
              onClick={() => setSortBy("productId")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                sortBy === "productId" 
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25" 
                  : "bg-white/20 hover:bg-white/30 border border-white/30"
              }`}
            >
              Sort by ID
            </button>
            <button
              onClick={exportCSV}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10l-5.5 5.5m0 0L8 18l5.5-5.5M12 10l5.5 5.5m-5.5 0L16 18l-5.5-5.5M12 10V5m0 0L7 10m5-5l5 5" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Fraud List */}
        <div className="space-y-4">
          {sortedFrauds.map((f, i) => {
            const severity = getSeverity(f.count);
            return (
              <div
                key={i}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${getSeverityColor(severity)} text-white font-bold text-xl`}>
                      {f.count}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-mono bg-gradient-to-r from-white to-white/50 bg-clip-text truncate max-w-md">
                        {f.productId}
                      </h3>
                      <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm mt-2 ${getSeverityColor(severity).replace('from', 'bg-gradient-to-r from').replace('to', 'to')}`}>
                        {severity}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-4xl font-black text-white opacity-80">{f.count}x</div>
                    <div className="text-white/60 text-sm font-mono">Scanned Times</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>Risk Level</span>
                    <span>{Math.round((f.count / 15) * 100)}%</span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden shadow-lg bg-white/10`}>
                    <div 
                      className={`h-3 rounded-full transition-all duration-700 bg-gradient-to-r ${getSeverityColor(severity)} shadow-lg`}
                      style={{ width: `${Math.min((f.count / 15) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {sortedFrauds.length === 0 && !loading && (
            <div className="text-center py-24">
              <div className="text-8xl text-white/20 mb-8">✅</div>
              <h3 className="text-3xl font-bold text-white mb-4">No Fraud Detected</h3>
              <p className="text-xl text-white/60 mb-8">All products have been scanned legitimately</p>
              <button
                onClick={detectFraud}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
              >
                Re-scan for Fraud
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FraudDetection;