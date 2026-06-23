
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function AdminDashboard() {

  const [stats, setStats] = useState({
    companies: 0,
    approvedCompanies: 0,
    blockedCompanies: 0,
    products: 0,
    batches: 0,
    scans: 0,
    frauds: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      const companySnap = await getDocs(collection(db, "companies"));
      const productSnap = await getDocs(collection(db, "products"));
      const batchSnap = await getDocs(collection(db, "batches"));
      const scanSnap = await getDocs(collection(db, "scans"));

      let approved = 0;
      let blocked = 0;

      // 🏢 Companies count
      companySnap.forEach((doc) => {
        const data = doc.data();

        if (data.isApproved) approved++;
        if (data.isBlocked) blocked++;
      });

      // 🚨 Fraud detection (same product multiple scans)
      let scanMap = {};

      scanSnap.forEach((doc) => {
        const data = doc.data();

        if (scanMap[data.productId]) {
          scanMap[data.productId]++;
        } else {
          scanMap[data.productId] = 1;
        }
      });

      let fraudCount = 0;

      Object.values(scanMap).forEach((count) => {
        if (count > 1) fraudCount++;
      });

      setStats({
        companies: companySnap.size,
        approvedCompanies: approved,
        blockedCompanies: blocked,
        products: productSnap.size,
        batches: batchSnap.size,
        scans: scanSnap.size,
        frauds: fraudCount
      });

    } catch (error) {
      console.error(error);
      alert("Error loading dashboard");
    }
  };

  return (
    <div>

      {/* 🔥 Sidebar */}
      <AdminSidebar />

      {/* 🔥 Content (IMPORTANT ml-64) */}
      <div className="ml-64 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        {/* 🔢 STATS GRID */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-4 rounded shadow">
            <h3>Total Companies</h3>
            <p className="text-2xl font-bold">{stats.companies}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Approved Companies</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.approvedCompanies}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Blocked Companies</h3>
            <p className="text-2xl font-bold text-red-600">
              {stats.blockedCompanies}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Total Products</h3>
            <p className="text-2xl font-bold">{stats.products}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Total Batches</h3>
            <p className="text-2xl font-bold">{stats.batches}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Total Scans</h3>
            <p className="text-2xl font-bold">{stats.scans}</p>
          </div>

          <div className="bg-white p-4 rounded shadow col-span-3">
            <h3>Fraud Alerts</h3>
            <p className="text-2xl font-bold text-red-500">
              {stats.frauds}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;