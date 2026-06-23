import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "scans"));
      let list = [];
      snap.forEach((d) => {
        list.push(d.data());
      });
      setScans(list);
    } catch (error) {
      console.error("Error fetching scans:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading scans...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Scan History
          </h1>
        </div>

        {scans.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No scans yet</h3>
            <p className="text-gray-500">Scan some products to see history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((s, i) => (
              <div 
                key={i} 
                className="group bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-800">
                      {s.productId || 'Product ID'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{s.time}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    s.fraud 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {s.fraud ? '🚨 Fraud' : '✅ Genuine'}
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-4"></div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Scan #{scans.length - i}</span>
                  <button 
                    onClick={() => fetchScans()}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 group-hover:scale-105 transition-all"
                  >
                    Refresh
                    <span>↻</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanHistory;