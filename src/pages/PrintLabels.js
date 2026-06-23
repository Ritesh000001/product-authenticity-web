
// Perplexity code 
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

function PrintLabels() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        showToast("User not logged in", "error");
        setLoading(false);
        return;
      }

      const snap = await getDocs(collection(db, "products"));
      let list = [];

      snap.forEach((d) => {
        const data = d.data();
        if (data.companyId === user.uid) {
          list.push(data);
        }
      });

      setProducts(list);
    } catch (error) {
      console.error(error);
      showToast("Failed to load labels", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.productId?.toLowerCase().includes(search.toLowerCase()) ||
      p.scratchCode?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = true;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: products.length,
    readyToPrint: products.filter((p) => p.status === "approved").length,
  };

  const copyAllCodes = () => {
    const codes = filteredProducts
      .map((p) => `${p.productId} | ${p.scratchCode}`)
      .join("\n");
    navigator.clipboard.writeText(codes);
    showToast("Copied all codes!", "success");
  };

  const showToast = (message, type = "error") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[1000] p-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 ${
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.replace("translate-x-full", "translate-x-0"), 100);
    setTimeout(() => toast.remove(), 4000);
  };

  const groupedBatches = {};

  filteredProducts.forEach((p) => {
    if (!groupedBatches[p.batch]) {
      groupedBatches[p.batch] = [];
    }
    groupedBatches[p.batch].push(p);
  });

  const downloadCSV = (products, batchName) => {
    const rows = [
      ["Product ID", "Scratch Code", "Batch"],
      ...products.map((p) => [p.productId, p.scratchCode, p.batch]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${batchName}.csv`;
    link.click();
  };

  const downloadQR = async (products, batchName) => {
    try {
      const zip = new JSZip();

      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        let qrData = p.qrImage;

        if (!qrData) {
          // const data = JSON.stringify({
          //   productId: p.productId,
          //   batch: p.batch,
          // });

          const data = p.productId;

          qrData = await QRCode.toDataURL(data);
        }

        const img = new Image();
        img.src = qrData;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 300;
            canvas.height = 320;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Canvas context not found"));
              return;
            }

            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 50, 20, 200, 200);

            ctx.fillStyle = "#000";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";

            ctx.fillText(p.productId || "N/A", 150, 260);

            const finalBase64 = canvas.toDataURL("image/png").split(",")[1];
            const fileName = `${p.productId || "product"}.png`;

            zip.file(fileName, finalBase64, { base64: true });
            resolve();
          };

          img.onerror = () => reject(new Error("Image load failed"));
        });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${batchName}_QR.zip`);
      showToast("QR ZIP downloaded successfully!", "success");
    } catch (error) {
      console.error("QR ZIP download failed:", error);
      showToast("QR download failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 bg-gray-300 rounded-xl w-72"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-12 bg-gray-300 rounded-2xl"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-300 rounded-2xl border-4 border-gray-200 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 bg-gray-800 text-white px-6 py-2 rounded-xl shadow hover:bg-gray-900 transition"
      >
        🏠 Home
      </button>

      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text mb-4">
          Print Product Labels
        </h1>
        <p className="text-xl text-gray-600">High-quality labels with QR codes</p>
      </div>

      <div className="max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 text-center group hover:shadow-2xl transition-all">
            <div className="text-4xl font-black text-blue-600 mb-2">{stats.total}</div>
            <div className="text-gray-700 font-semibold">Total Labels</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 text-center group hover:shadow-2xl transition-all">
            <div className="text-4xl font-black text-emerald-600 mb-2">{stats.readyToPrint}</div>
            <div className="text-gray-700 font-semibold">Ready to Print</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <input
            placeholder="🔍 Search by name, ID or scratch..."
            className="flex-1 bg-white/60 backdrop-blur-sm border border-gray-300 p-4 rounded-2xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg hover:shadow-xl text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-3 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/60 backdrop-blur-sm border border-gray-300 p-4 rounded-2xl text-gray-800 font-semibold focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl min-w-[180px]"
            >
              <option value="all">All Approved ({stats.readyToPrint})</option>
              <option value="approved">Approved Only</option>
            </select>

            <button
              onClick={copyAllCodes}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
            >
              Copy Codes
            </button>

            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all uppercase tracking-wide flex items-center space-x-2 group"
            >
              <span>🖨️ Print ({filteredProducts.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {Object.keys(groupedBatches).map((batchName) => {
          const batchProducts = groupedBatches[batchName];

          return (
            <div key={batchName} className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    📦 Batch: {batchName}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Total Products: {batchProducts.length}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => downloadCSV(batchProducts, batchName)}
                    className="bg-blue-500 text-white px-5 py-2 rounded-xl"
                  >
                    Download CSV
                  </button>

                  <button
                    onClick={() => downloadQR(batchProducts, batchName)}
                    className="bg-green-500 text-white px-5 py-2 rounded-xl"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {Object.keys(groupedBatches).length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800">No batches found</h3>
            <p className="text-gray-600 mt-2">Search change karo ya products refresh karo.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }

        @page {
          margin: 1cm;
          size: A4;
        }
      `}</style>
    </div>
  );
}

export default PrintLabels;