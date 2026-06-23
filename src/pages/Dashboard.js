
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";

function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [fraudScans, setFraudScans] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const COLORS = {
    primary: "#0F766E",
    secondary: "#1D4ED8",
    danger: "#B91C1C"
  };

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const batchQuery = query(
      collection(db, "batches"),
      where("companyId", "==", user.uid),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(batchQuery, async (snapshot) => {
      try {
        const batches = [];
        let totalProductsCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          batches.push({ id: doc.id, ...data });
          totalProductsCount += Number(data.quantity || 0);
        });

        const scanQuery = query(
          collection(db, "scans"),
          where("companyId", "==", user.uid)
        );

        const scanSnap = await getDocs(scanQuery);

        const totalScansCount = scanSnap.size;
        let fraudCount = 0;
        const scanMap = {};

        scanSnap.forEach((doc) => {
          const data = doc.data();
          const productId = data.productId;

          if (productId) {
            scanMap[productId] = (scanMap[productId] || 0) + 1;
          }
        });

        Object.values(scanMap).forEach((count) => {
          if (count > 1) {
            fraudCount += 1;
          }
        });

        setTotalProducts(totalProductsCount);
        setTotalScans(totalScansCount);
        setFraudScans(fraudCount);
        setBatchList(batches);

        setChartData([
          { name: "Products", value: totalProductsCount, color: COLORS.primary },
          { name: "Scans", value: totalScansCount, color: COLORS.secondary },
          { name: "Fraud", value: fraudCount, color: COLORS.danger }
        ]);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const downloadCSV = useCallback((batch) => {
    const quantity = Number(batch.quantity || 0);
    let csvContent = "ProductID,ScratchCode,Batch,Status\n";

    for (let i = 0; i < quantity; i++) {
      const productId = `P${Date.now()}${String(i).padStart(4, "0")}`;
      const scratchCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      csvContent += `${productId},${scratchCode},${batch.batch},Active\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${batch.batch || "batch"}-products.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 lg:ml-72">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F766E]" />
            <span className="text-base font-semibold text-slate-700">
              Loading dashboard...
            </span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 overflow-x-hidden lg:ml-72">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg lg:hidden">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ☰
            </button>

            <div className="text-right">
              <h1 className="text-base font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500">Company Panel</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-8">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Monitor approved batches, scan activity, and duplicate scan alerts.
            </p>
          </div>

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-teal-50 p-3 text-2xl">📦</div>
                <span className="text-sm font-medium text-slate-500">
                  Total Products
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalProducts.toLocaleString()}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Approved quantity across all batches
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-blue-50 p-3 text-2xl">📲</div>
                <span className="text-sm font-medium text-slate-500">
                  Total Scans
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalScans.toLocaleString()}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                All verification scans recorded
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6 sm:col-span-2 xl:col-span-1">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-red-50 p-3 text-2xl">⚠️</div>
                <span className="text-sm font-medium text-slate-500">
                  Fraud Alerts
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {fraudScans.toLocaleString()}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Products scanned more than once
              </p>
            </div>
          </section>

          <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                Analytics Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Comparison of products, scans, and fraud alerts
              </p>
            </div>

            <div className="h-[280px] w-full sm:h-[320px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={36}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Approved Batches
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Download batch-wise product CSV files
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {batchList.length} batches
              </div>
            </div>

            {batchList.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  📭
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  No approved batches found
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Approved batches will appear here once they are available.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-[760px] w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Batch
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Product
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {batchList.map((batch, index) => (
                        <tr
                          key={batch.id}
                          className={`border-t border-slate-100 transition-colors duration-200 hover:bg-slate-50 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="font-semibold text-slate-900">
                              {batch.batch}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Batch ID: {batch.id}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-slate-700">
                            {batch.name}
                          </td>

                          <td className="px-6 py-5 text-center">
                            <span className="inline-flex min-w-[72px] items-center justify-center rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
                              {Number(batch.quantity || 0).toLocaleString()}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={() => downloadCSV(batch)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#115E59] hover:shadow-md"
                            >
                              <span>📥</span>
                              <span>Download CSV</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4 p-4 md:hidden">
                  {batchList.map((batch) => (
                    <div
                      key={batch.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <div className="mb-3">
                        <h4 className="text-base font-bold text-slate-900">
                          {batch.batch}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {batch.name}
                        </p>
                      </div>

                      <div className="mb-4 flex items-center justify-between rounded-xl bg-white px-3 py-3">
                        <span className="text-sm font-medium text-slate-500">
                          Quantity
                        </span>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                          {Number(batch.quantity || 0).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => downloadCSV(batch)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#115E59]"
                      >
                        <span>📥</span>
                        <span>Download CSV</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;