import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function AdminAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const snap = await getDocs(collection(db, "scans"));

      let map = {};
      snap.forEach(d => {
        const date = d.data().time.slice(0, 10);
        map[date] = (map[date] || 0) + 1;
      });

      const chartData = Object.keys(map)
        .sort()
        .slice(-30) // Last 30 days only
        .map(k => ({
          date: k,
          scans: map[k]
        }));

      setData(chartData);
      setTotalScans(chartData.reduce((sum, d) => sum + d.scans, 0));
    } catch (err) {
      setError("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAverageDaily = () => {
    if (data.length === 0) return 0;
    return Math.round(totalScans / data.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/20 rounded-lg w-48"></div>
              <div className="h-64 bg-white/20 rounded-2xl"></div>
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
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
            Scan Analytics Dashboard
          </h2>
          <p className="text-xl text-white/80">Real-time product verification insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl font-black text-blue-400 mb-2">{totalScans.toLocaleString()}</div>
            <div className="text-white/90 text-lg font-semibold">Total Scans</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl font-black text-green-400 mb-2">{data.length}</div>
            <div className="text-white/90 text-lg font-semibold">Active Days</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl font-black text-purple-400 mb-2">{getAverageDaily()}</div>
            <div className="text-white/90 text-lg font-semibold">Avg Daily</div>
          </div>
        </div>

        {/* Main Chart Container */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10">
          {error ? (
            <div className="text-center py-16">
              <div className="text-6xl text-red-400 mb-4">⚠️</div>
              <p className="text-xl text-white/80 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all duration-200"
              >
                Retry
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-500 mb-4">📊</div>
              <p className="text-xl text-white/80 mb-8">No scan data available</p>
              <button
                onClick={loadData}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all duration-200"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <>
              {/* Chart Header */}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white">Daily Scan Trends</h3>
                <button
                  onClick={loadData}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>

              {/* Responsive Chart */}
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <defs>
                      <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: "#E5E7EB" }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: "#E5E7EB" }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px"
                      }}
                    />
                    <Bar 
                      dataKey="scans" 
                      fill="url(#scanGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Footer Stats */}
        {data.length > 0 && (
          <div className="mt-8 text-center text-white/80 text-sm">
            <p>📅 Showing last {data.length} days | Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;