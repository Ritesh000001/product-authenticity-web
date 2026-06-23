// import React, { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import { db, auth } from "../firebase/config";
// import { collection, getDocs } from "firebase/firestore";

// function ProductList() {

//   const [products, setProducts] = useState([]);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     const user = auth.currentUser;
//     const querySnapshot = await getDocs(collection(db, "products"));

//     let list = [];

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       if (data.companyId === user.uid) {
//         list.push({ id: doc.id, ...data });
//       }
//     });

//     setProducts(list);
//   };

//   const filtered = products.filter((p) =>
//     p.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="flex">
//   <Sidebar />

//   <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen">

//         <h1 className="text-3xl mb-4">Product List</h1>

//         {/* 🔍 SEARCH */}
//         <input 
//           placeholder="Search product..."
//           className="p-2 border mb-4 w-full"
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <table className="w-full bg-white shadow rounded">

//           <thead className="bg-gray-200">
//             <tr>
//               <th>Name</th>
//               <th>Batch</th>
//               <th>Type</th>
//               <th>Product ID</th>
//               <th>Scratch</th>
//               <th>Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.map((p) => (
//               <tr key={p.id} className="text-center border-b">
//                 <td>{p.name}</td>
//                 <td>{p.batch}</td>
//                 <td>{p.type}</td>
//                 <td>{p.productId}</td>
//                 <td>{p.scratchCode}</td>
//                 <td>{p.isUsed ? "Used" : "Unused"}</td>
//               </tr>
//             ))}
//           </tbody>

//         </table>

//       </div>
//     </div>
//   );
// }

// // export default ProductList;



// Perplexity code 




import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (value) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setSearch(value), 300);
    setSearchTimeout(timeout);
  };

  const showToast = (message, type = "error") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[1000] p-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 ${
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
      toast.classList.add("translate-x-0");
    }, 100);
    setTimeout(() => toast.remove(), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        showToast("User not logged in", "error");
        return;
      }

      const batchQuery = query(
        collection(db, "batches"),
        where("companyId", "==", user.uid),
        where("status", "==", "approved")
      );

      const productQuery = query(
        collection(db, "products"),
        where("companyId", "==", user.uid)
      );

      const [batchSnapshot, productSnapshot] = await Promise.all([
        getDocs(batchQuery),
        getDocs(productQuery),
      ]);

      const batchList = [];
batchSnapshot.forEach((doc) => {
  const data = doc.data();

  batchList.push({
    id: doc.id,
    ...data
  });
});

      const productList = [];
      productSnapshot.forEach((doc) => {
        productList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setBatches(batchList);
      setProducts(productList);
    } catch (error) {
      console.error(error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.productId?.toLowerCase().includes(search.toLowerCase()) ||
        p.scratchCode?.toLowerCase().includes(search.toLowerCase()) ||
        p.batch?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "used" ? p.isUsed : !p.isUsed);

      const matchesBatch =
        filterBatch === "all" || p.batch === filterBatch;

      const matchesSelectedBatch =
  !selectedBatch ||
  p.batch?.trim().toLowerCase() === selectedBatch?.trim().toLowerCase();

      return matchesSearch && matchesStatus && matchesBatch && matchesSelectedBatch;
    });
  }, [products, search, filterStatus, filterBatch, selectedBatch]);

const batchCounts = useMemo(() => {
  const counts = {};

  products.forEach((p) => {
    if (!p.batch) return;

    const key = p.batch.trim().toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}, [products]);











  const stats = {
    totalProducts: products.length,
    totalBatches: batches.length,
    used: products.filter((p) => p.isUsed).length,
    unused: products.filter((p) => !p.isUsed).length,
  };

  const exportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Batch,Type,Product ID,Scratch Code,Status\n" +
      filteredProducts
        .map(
          (p) =>
            `"${p.name || ""}","${p.batch || ""}","${p.type || ""}","${p.productId || ""}","${p.scratchCode || ""}","${p.isUsed ? "Used" : "Available"}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `products_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Products exported!", "success");
  };

 const normalize = (v) => v?.trim().toLowerCase();

const getBatchProductCount = (batchCode) => {
  return products.filter(
    (p) => normalize(p.batch) === normalize(batchCode)
  ).length;
};

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="ml-72 w-full p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-72 rounded-2xl bg-white/10"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/10"></div>
              ))}
            </div>
            <div className="h-28 rounded-3xl bg-white/10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-white/10"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_22%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#0b1120_100%)]">
      <Sidebar />

      <div className="ml-72 w-full p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Product Inventory
              </h1>
              <p className="mt-2 text-base md:text-lg text-slate-300">
                Approved batches dekho aur click karke products open karo.
              </p>
            </div>

            {selectedBatch && (
              <button
                onClick={() => setSelectedBatch(null)}
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/15"
              >
                ← Back to Batches
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <p className="text-sm text-slate-300">Approved Batches</p>
              <h2 className="mt-3 text-4xl font-black text-cyan-300">{stats.totalBatches}</h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <p className="text-sm text-slate-300">Total Products</p>
              <h2 className="mt-3 text-4xl font-black text-blue-300">{stats.totalProducts}</h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <p className="text-sm text-slate-300">Available</p>
              <h2 className="mt-3 text-4xl font-black text-emerald-300">{stats.unused}</h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <p className="text-sm text-slate-300">Used</p>
              <h2 className="mt-3 text-4xl font-black text-orange-300">{stats.used}</h2>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-5 md:p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <input
                placeholder="Search name, product ID, scratch code or batch..."
                className="w-full flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white placeholder:text-slate-400 outline-none transition-all focus:border-blue-400/40 focus:bg-white/15"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none focus:border-blue-400/40"
                >
                  <option className="text-black" value="all">All Status</option>
                  <option className="text-black" value="unused">Available</option>
                  <option className="text-black" value="used">Used</option>
                </select>

                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none focus:border-purple-400/40"
                >
                  <option className="text-black" value="all">All Batches</option>
                  {Array.from(new Set(products.map((p) => p.batch).filter(Boolean))).map((batch) => (
                    <option className="text-black" key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>

                <button
                  onClick={exportCSV}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Batch cards */}
          {!selectedBatch && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {batches.map((batch) => {
const count =
  batchCounts[batch.batch?.trim().toLowerCase()] || 0;
                return (
                  <div
                    key={batch.id}
                    className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/15"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                          Approved Batch
                        </p>
                        <h3 className="text-2xl font-black text-white break-all">
                          {batch.displayBatchName}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                        <p className="text-xs text-slate-300">Products</p>
                        <p className="text-2xl font-black text-emerald-300">{count}</p>
                      </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-black/10 p-4">
                        <p className="text-xs text-slate-400">Status</p>
                        <p className="mt-1 font-bold text-white">{batch.status || "approved"}</p>
                      </div>
                      <div className="rounded-2xl bg-black/10 p-4">
                        <p className="text-xs text-slate-400">Type</p>
                        <p className="mt-1 font-bold text-white">{batch.type || "-"}</p>
                      </div>
                    </div>

                    <div className="mb-6 rounded-2xl bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Product Name</p>
                      <p className="mt-1 font-semibold text-white">{batch.name || "-"}</p>
                    </div>

                    <button
                     onClick={() => {
  setSelectedBatch(batch.batch);
  setFilterBatch("all");
}}
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 font-bold text-white transition-all hover:scale-[1.01]"
                    >
                      View Products
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected batch products */}
          {selectedBatch && (
            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5 md:px-8">
                <h3 className="text-2xl font-black text-white">{selectedBatch}</h3>
                <p className="mt-1 text-slate-300">
                  Showing {filteredProducts.length} product(s) in this batch.
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="px-8 py-20 text-center">
                  <div className="text-6xl">📦</div>
                  <h4 className="mt-4 text-2xl font-black text-white">No products found</h4>
                  <p className="mt-2 text-slate-400">
                    Is batch me products nahi mile ya filter/search match nahi kar raha.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">#</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Batch</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Product ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Scratch</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {filteredProducts.map((p, i) => (
                        <tr key={p.id} className="transition-all hover:bg-white/10">
                          <td className="px-6 py-4 text-sm text-slate-300">{i + 1}</td>
                          <td className="px-6 py-4 font-semibold text-white">{p.name || "-"}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-200">
                              {p.batch || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{p.type || "-"}</td>
                          <td className="px-6 py-4 font-mono text-cyan-300">{p.productId || "-"}</td>
                          <td className="px-6 py-4">
                            <div className="max-w-[180px] truncate rounded-xl bg-white/8 px-3 py-2 font-mono text-sm text-slate-200">
                              {p.scratchCode || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                p.isUsed
                                  ? "bg-orange-500/15 text-orange-200"
                                  : "bg-emerald-500/15 text-emerald-200"
                              }`}
                            >
                              {p.isUsed ? "USED" : "AVAILABLE"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && batches.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-8 py-20 text-center backdrop-blur-xl">
              <div className="text-6xl">📭</div>
              <h3 className="mt-4 text-3xl font-black text-white">No approved batches found</h3>
              <p className="mt-2 text-slate-400">
                Officer ko dikhane ke liye approved batches zaroori hain.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;