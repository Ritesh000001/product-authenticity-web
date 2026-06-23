// import React, { useEffect, useState } from "react";
// import AdminSidebar from "../components/AdminSidebar";
// import { db } from "../firebase/config";
// import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// function CompanyApprovals() {

//   const [companies, setCompanies] = useState([]);

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   const fetchCompanies = async () => {

//     const snap = await getDocs(collection(db, "companies"));
//     let list = [];

//     snap.forEach((d) => {
//       list.push({ id: d.id, ...d.data() });
//     });

//     setCompanies(list);
//   };

//   // ✅ Approve Company
//   const approveCompany = async (id) => {

//     await updateDoc(doc(db, "companies", id), {
//       isApproved: true,
//       isBlocked: false
//     });

//     fetchCompanies();
//   };

//   // 🚫 Block Company
//   const blockCompany = async (id) => {

//     await updateDoc(doc(db, "companies", id), {
//       isBlocked: true
//     });

//     fetchCompanies();
//   };

//   // 🔓 Unblock Company
//   const unblockCompany = async (id) => {

//     await updateDoc(doc(db, "companies", id), {
//       isBlocked: false
//     });

//     fetchCompanies();
//   };

//   return (
//     <div>

//       <AdminSidebar />

//       <div className="ml-64 p-6 bg-gray-100 min-h-screen">

//         <h1 className="text-3xl mb-6 font-bold">
//           Company Approvals
//         </h1>

//         {companies.map((c) => (

//           <div
//             key={c.id}
//             className="bg-white p-5 mb-4 rounded-lg shadow"
//           >

//             <p><b>Name:</b> {c.name}</p>
//             <p><b>Email:</b> {c.email}</p>
//             <p><b>GST:</b> {c.gst}</p>

//             <p className="mt-2">
//               <b>Status:</b>

//               {c.isBlocked && (
//                 <span className="text-red-600 ml-2">Blocked</span>
//               )}

//               {!c.isBlocked && c.isApproved && (
//                 <span className="text-green-600 ml-2">Approved</span>
//               )}

//               {!c.isApproved && !c.isBlocked && (
//                 <span className="text-yellow-600 ml-2">Pending</span>
//               )}

//             </p>

//             <div className="mt-3 flex gap-2">

//               {!c.isApproved && !c.isBlocked && (
//                 <button
//                   onClick={() => approveCompany(c.id)}
//                   className="bg-green-500 text-white px-3 py-1 rounded"
//                 >
//                   Approve
//                 </button>
//               )}

//               {!c.isBlocked && (
//                 <button
//                   onClick={() => blockCompany(c.id)}
//                   className="bg-red-500 text-white px-3 py-1 rounded"
//                 >
//                   Block
//                 </button>
//               )}

//               {c.isBlocked && (
//                 <button
//                   onClick={() => unblockCompany(c.id)}
//                   className="bg-blue-500 text-white px-3 py-1 rounded"
//                 >
//                   Unblock
//                 </button>
//               )}

//             </div>

//           </div>

//         ))}

//       </div>

//     </div>
//   );
// }

// export default CompanyApprovals;


// Perplexity code 



import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function CompanyApprovals() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "companies"));
      let list = [];

      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });

      setCompanies(list);
    } catch (error) {
      showToast("Failed to fetch companies", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAME APPROVE LOGIC - ZERO CHANGE
  const approveCompany = async (id) => {
    try {
      await updateDoc(doc(db, "companies", id), {
        isApproved: true,
        isBlocked: false
      });
      showToast("Company approved!", "success");
      fetchCompanies();
    } catch (error) {
      showToast("Approval failed", "error");
    }
  };

  // ✅ SAME BLOCK LOGIC - ZERO CHANGE
  const blockCompany = async (id) => {
    try {
      await updateDoc(doc(db, "companies", id), {
        isBlocked: true
      });
      showToast("Company blocked!", "success");
      fetchCompanies();
    } catch (error) {
      showToast("Block failed", "error");
    }
  };

  // ✅ SAME UNBLOCK LOGIC - ZERO CHANGE
  const unblockCompany = async (id) => {
    try {
      await updateDoc(doc(db, "companies", id), {
        isBlocked: false
      });
      showToast("Company unblocked!", "success");
      fetchCompanies();
    } catch (error) {
      showToast("Unblock failed", "error");
    }
  };

  const bulkApprove = async () => {
    for (const id of selectedCompanies) {
      await approveCompany(id);
    }
    setSelectedCompanies(new Set());
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

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.gst?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !c.isApproved && !c.isBlocked) ||
      (filter === "approved" && c.isApproved && !c.isBlocked) ||
      (filter === "blocked" && c.isBlocked);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: companies.length,
    pending: companies.filter(c => !c.isApproved && !c.isBlocked).length,
    approved: companies.filter(c => c.isApproved && !c.isBlocked).length,
    blocked: companies.filter(c => c.isBlocked).length
  };

  if (loading) {
    return (
      <div className="flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <AdminSidebar />
        <div className="ml-72 p-8 w-full flex items-center justify-center">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white/10 rounded-xl w-80"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="h-24 bg-white/10 rounded-3xl"></div>
              <div className="h-24 bg-white/10 rounded-3xl"></div>
              <div className="h-24 bg-white/10 rounded-3xl"></div>
              <div className="h-24 bg-white/10 rounded-3xl"></div>
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
            Company Approvals
          </h1>
          <p className="text-xl text-white/80">Manage company registrations and access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-blue-400 mb-2">{stats.total}</div>
            <div className="text-white/90 font-semibold">Total Companies</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-yellow-400 mb-2">{stats.pending}</div>
            <div className="text-white/90 font-semibold">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-emerald-400 mb-2">{stats.approved}</div>
            <div className="text-white/90 font-semibold">Approved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center group hover:bg-white/20 transition-all">
            <div className="text-4xl font-black text-red-400 mb-2">{stats.blocked}</div>
            <div className="text-white/90 font-semibold">Blocked</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <input
            placeholder="🔍 Search by name, email or GST..."
            className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-2xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
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
              onClick={() => setFilter("blocked")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === "blocked"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/25"
                  : "bg-white/20 hover:bg-white/30 border border-white/30"
              }`}
            >
              Blocked ({stats.blocked})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCompanies.size > 0 && (
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 p-4 rounded-2xl mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{selectedCompanies.size}</span>
                </div>
                <span className="font-bold text-blue-200 text-lg">
                  {selectedCompanies.size} companies selected
                </span>
              </div>
              <button
                onClick={bulkApprove}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
              >
                Approve Selected
              </button>
            </div>
          </div>
        )}

        {/* Companies List */}
        <div className="space-y-6">
          {filteredCompanies.map((c) => (
            <div
              key={c.id}
              className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer group-hover:scale-105 transition-transform">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.has(c.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedCompanies);
                        if (e.target.checked) {
                          newSet.add(c.id);
                        } else {
                          newSet.delete(c.id);
                        }
                        setSelectedCompanies(newSet);
                      }}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      c.isBlocked ? "bg-red-400" : 
                      c.isApproved ? "bg-emerald-400" : "bg-yellow-400"
                    } animate-pulse`}></div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{c.name}</h3>
                      <p className="text-white/70 font-mono text-sm">{c.gst}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge - SAME LOGIC */}
                <div className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg ${
                  c.isBlocked 
                    ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-400/30" 
                    : c.isApproved 
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-400/30" 
                    : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-400/30"
                }`}>
                  {c.isBlocked ? "BLOCKED" : c.isApproved ? "APPROVED" : "PENDING"}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">Email</label>
                  <p className="text-white/90 font-mono bg-white/10 px-4 py-2 rounded-xl truncate">{c.email}</p>
                </div>
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">GST Number</label>
                  <p className="font-mono text-blue-200 bg-white/10 px-4 py-2 rounded-xl">{c.gst}</p>
                </div>
                <div>
                  <label className="block text-white/70 font-bold text-sm uppercase tracking-wide mb-2">Status</label>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    c.isBlocked 
                      ? "bg-red-500/20 text-red-400 border border-red-400/30" 
                      : c.isApproved 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30" 
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                  }`}>
                    {c.isBlocked ? "Blocked" : c.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Action Buttons - SAME LOGIC */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                {!c.isApproved && !c.isBlocked && (
                  <button
                    onClick={() => approveCompany(c.id)}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 uppercase tracking-wide group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve Company</span>
                  </button>
                )}

                {!c.isBlocked && (
                  <button
                    onClick={() => blockCompany(c.id)}
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 uppercase tracking-wide group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span>Block Company</span>
                  </button>
                )}

                {c.isBlocked && (
                  <button
                    onClick={() => unblockCompany(c.id)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 uppercase tracking-wide group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Unblock Company</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredCompanies.length === 0 && !loading && (
            <div className="text-center py-24">
              <div className="text-8xl text-white/20 mb-8">🏢</div>
              <h3 className="text-3xl font-bold text-white mb-4">No companies found</h3>
              <p className="text-xl text-white/60 mb-8">{search ? "Try different search" : "No companies registered yet"}</p>
              <button
                onClick={fetchCompanies}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
              >
                Refresh List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyApprovals; 