import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import {
  FaArrowLeft,
  FaBuilding,
  FaBoxes,
  FaEnvelopeOpenText,
  FaShieldAlt,
  FaDownload,
  FaSyncAlt,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaSignOutAlt,
  FaChartLine,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaIndustry,
  FaClipboardList,
  FaLayerGroup,
  FaUserShield,
  FaBoxOpen,
  FaHistory,
  FaFilter,
} from "react-icons/fa";
import { auth, db } from "../firebase/config";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [companies, setCompanies] = useState([]);
  const [batches, setBatches] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [scans, setScans] = useState([]);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const [batchDateFrom, setBatchDateFrom] = useState("");
  const [batchDateTo, setBatchDateTo] = useState("");
  const [inquiryDateFrom, setInquiryDateFrom] = useState("");
  const [inquiryDateTo, setInquiryDateTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingBatchId, setApprovingBatchId] = useState(null);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  const productsRef = useRef([]);
  const scansRef = useRef([]);
  
  // Yahan humne collection name define kiya hai jo landing page se match karta hai
  const INQUIRIES_COLLECTION = "contactInquiries";

  const showToast = useCallback((message, type = "success") => {
    if (type === "error") toast.error(message);
    else if (type === "warning") toast(message, { icon: "⚠️" });
    else toast.success(message);
  }, []);

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isDateWithinRange = (value, from, to) => {
    const date = parseDate(value);
    if (!date) return !from && !to;

    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59`) : null;

    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  };

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) return "N/A";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchAll = useCallback(async () => {
    try {
      setRefreshing(true);

      const [compSnap, batchSnap, inquirySnap, prodSnap, scanSnap] = await Promise.all([
        getDocs(collection(db, "companies")),
        getDocs(collection(db, "batches")),
        getDocs(collection(db, INQUIRIES_COLLECTION)), // Fixed: Using contactInquiries
        getDocs(collection(db, "products")),
        getDocs(collection(db, "scans")),
      ]);

      const compList = compSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const batchList = batchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const inquiryList = inquirySnap.docs.map((d) => ({
        id: d.id,
        inquiryStatus: d.data().inquiryStatus || (d.data().isRead ? "Contacted" : "New"),
        isRead: d.data().isRead ?? false,
        ...d.data(),
      }));
      const prodList = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const scanList = scanSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setCompanies(compList);
      setBatches(batchList);
      setInquiries(inquiryList);
      setProducts(prodList);
      setScans(scanList);

      productsRef.current = prodList;
      scansRef.current = scanList;
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Failed to fetch admin data", "error");
    } finally {
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  const getStats = useCallback((companyId) => {
    const companyProducts = productsRef.current.filter((p) => p.companyId === companyId);
    const companyProductIds = new Set(companyProducts.map((p) => p.productId));

    const scanMap = {};
    scansRef.current.forEach((scan) => {
      if (companyProductIds.has(scan.productId)) {
        scanMap[scan.productId] = (scanMap[scan.productId] || 0) + 1;
      }
    });

    let fraud = 0;
    Object.values(scanMap).forEach((count) => {
      if (count > 1) fraud += 1;
    });

    let risk = "Low";
    if (fraud > 5) risk = "High";
    else if (fraud > 2) risk = "Medium";

    return {
      totalProducts: companyProducts.length,
      fraud,
      risk,
    };
  }, []);

  const duplicateScanRows = useMemo(() => {
    const grouped = {};

    scans.forEach((scan) => {
      const key = scan.productId || "UNKNOWN";
      if (!grouped[key]) {
        grouped[key] = {
          productId: key,
          totalScans: 0,
          latestScanAt: scan.createdAt || scan.scannedAt || null,
          items: [],
        };
      }
      grouped[key].totalScans += 1;
      grouped[key].items.push(scan);

      const currentLatest = parseDate(grouped[key].latestScanAt);
      const incoming = parseDate(scan.createdAt || scan.scannedAt);
      if (incoming && (!currentLatest || incoming > currentLatest)) {
        grouped[key].latestScanAt = scan.createdAt || scan.scannedAt;
      }
    });

    return Object.values(grouped)
      .filter((row) => row.totalScans > 1)
      .sort((a, b) => (b.totalScans || 0) - (a.totalScans || 0));
  }, [scans]);

  const globalMetrics = useMemo(() => {
    return {
      totalCompanies: companies.length,
      approvedCompanies: companies.filter((c) => c.isApproved).length,
      pendingCompanies: companies.filter((c) => !c.isApproved).length,
      totalBatches: batches.length,
      pendingBatches: batches.filter((b) => b.status === "pending").length,
      approvedBatches: batches.filter((b) => b.status === "approved").length,
      totalProducts: products.length,
      totalScans: scans.length,
      totalInquiries: inquiries.length,
      unreadInquiries: inquiries.filter((i) => !i.isRead).length,
      duplicateProducts: duplicateScanRows.length,
      closedInquiries: inquiries.filter((i) => i.inquiryStatus === "Closed").length,
    };
  }, [companies, batches, inquiries, products, scans, duplicateScanRows]);

  const approveBatch = useCallback(
    async (batch) => {
      setApprovingBatchId(batch.id);
      setLoading(true);

      try {
        const quantity = Number(batch.quantity);
        if (!quantity || quantity <= 0) throw new Error("Invalid quantity");
        if (!batch.companyId) throw new Error("Company ID missing");

        const productPromises = [];
        for (let i = 0; i < quantity; i++) {
          // const productId = `PID-${batch.batch}-${i + 1}`;

          // Create document reference first
          const productRef = doc(collection(db, "products"));

          // Firebase generated ID
          const productId = productRef.id;

          const scratchCode = Math.random().toString(36).substring(2, 10).toUpperCase();

          productPromises.push(
            setDoc(productRef,  {
              productId,
              scratchCode,
              batch: batch.batch,
              expiryDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year validity
              failedCount: 0,
              firstScanLocation: null,
              firstScanTime: null,
              lastScanTime: null,
              name: batch.name,
              scanCount: 0,
              scratchVerified: false,
              type: batch.type,
              companyId: batch.companyId,
              productImageUrl: batch.image || "",
              isUsed: false,
              status: "approved",
              verifiedCount: 0,
              createdAt: new Date().toISOString(),
              manufacturingDate: Timestamp.now(),
            })
          );
        }

        await Promise.all(productPromises);
        await updateDoc(doc(db, "batches", batch.id), { status: "approved" });

        showToast("Products generated successfully");
        await fetchAll();
      } catch (error) {
        console.error("Approve batch error:", error);
        showToast(`Error: ${error.message}`, "error");
      } finally {
        setLoading(false);
        setApprovingBatchId(null);
      }
    },
    [fetchAll, showToast]
  );

  const deleteBatch = useCallback(
    async (batchId, batchName) => {
      try {
        await deleteDoc(doc(db, "batches", batchId));

        const q = query(collection(db, "products"), where("batch", "==", batchName));
        const productSnap = await getDocs(q);
        const deletePromises = productSnap.docs.map((d) => deleteDoc(doc(db, "products", d.id)));
        await Promise.all(deletePromises);

        showToast("Batch and linked products deleted");
        fetchAll();
      } catch (error) {
        console.error(error);
        showToast("Failed to delete batch", "error");
      }
    },
    [fetchAll, showToast]
  );

  const approveCompany = useCallback(
    async (id) => {
      try {
        await updateDoc(doc(db, "companies", id), { isApproved: true });
        showToast("Company approved successfully");
        fetchAll();
      } catch (error) {
        console.error(error);
        showToast("Failed to approve company", "error");
      }
    },
    [fetchAll, showToast]
  );

  const deleteCompany = useCallback(
    async (id) => {
      try {
        await deleteDoc(doc(db, "companies", id));
        showToast("Company deleted successfully");
        fetchAll();
      } catch (error) {
        console.error(error);
        showToast("Failed to delete company", "error");
      }
    },
    [fetchAll, showToast]
  );

  const markInquiryRead = useCallback(
    async (inquiryId) => {
      try {
        await updateDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), {
          isRead: true,
          inquiryStatus: "Contacted",
        });
        showToast("Inquiry marked as contacted");
        fetchAll();
      } catch (error) {
        console.error(error);
        showToast("Failed to update inquiry", "error");
      }
    },
    [fetchAll, showToast]
  );

  const updateInquiryStatus = useCallback(
    async (inquiryId, status) => {
      try {
        await updateDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), {
          inquiryStatus: status,
          isRead: status !== "New",
        });
        showToast(`Inquiry marked as ${status}`);
        fetchAll();
      } catch (error) {
        console.error(error);
        showToast("Failed to update inquiry status", "error");
      }
    },
    [fetchAll, showToast]
  );

  const deleteInquiry = useCallback(
    async (inquiryId) => {
      try {
        await deleteDoc(doc(db, INQUIRIES_COLLECTION, inquiryId));
        showToast("Inquiry deleted successfully");
        fetchAll();
      } catch (error) {
        console.error(error);
        showToast("Failed to delete inquiry", "error");
      }
    },
    [fetchAll, showToast]
  );

  const handleSearch = useCallback(() => {
    setSearch(searchInput.trim());
  }, [searchInput]);

  const resetAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setFilter("all");
    setBatchDateFrom("");
    setBatchDateTo("");
    setInquiryDateFrom("");
    setInquiryDateTo("");
  }, []);

  const handleBackClick = useCallback(() => {
    if (location.state?.from) navigate(location.state.from, { replace: true });
    else navigate(-1);
  }, [navigate, location.state]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      showToast("Logged out successfully");
      navigate("/login/admin");
    } catch (error) {
      console.error(error);
      showToast("Logout failed", "error");
    }
  }, [navigate, showToast]);

  const viewCompanyDetails = useCallback((company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  }, []);

  const viewInquiryDetails = useCallback((inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
  }, []);

  const viewProductDetails = useCallback((product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  }, []);

  const viewScanDetails = useCallback((scan) => {
    setSelectedScan(scan);
    setShowScanModal(true);
  }, []);

  const escapeCSVValue = useCallback((value) => {
    if (value === null || value === undefined) return "";
    let finalValue = value;
    if (typeof finalValue === "object") finalValue = JSON.stringify(finalValue);
    return `"${String(finalValue).replace(/"/g, '""')}"`;
  }, []);

  const downloadApprovedCompaniesCSV = useCallback(() => {
    const approvedCompanies = companies.filter((c) => c.isApproved);

    if (!approvedCompanies.length) {
      showToast("No approved companies found", "warning");
      return;
    }

    const allCompanyKeys = Array.from(
      new Set(approvedCompanies.flatMap((company) => Object.keys(company)))
    );

    const priorityKeys = [
      "id",
      "name",
      "email",
      "phone",
      "gst",
      "license",
      "type",
      "address",
      "createdAt",
      "isApproved",
    ];

    const orderedCompanyKeys = [
      ...priorityKeys.filter((key) => allCompanyKeys.includes(key)),
      ...allCompanyKeys.filter((key) => !priorityKeys.includes(key)),
    ];

    const extraKeys = ["status", "totalProducts", "fraud", "risk"];
    const headers = [...orderedCompanyKeys, ...extraKeys];

    const rows = approvedCompanies.map((company) => {
      const stats = getStats(company.id);
      const rowData = {
        ...company,
        status: company.isApproved ? "Approved" : "Pending",
        totalProducts: stats.totalProducts,
        fraud: stats.fraud,
        risk: stats.risk,
      };

      return headers.map((header) => escapeCSVValue(rowData[header])).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approved-companies-full-details.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast("Approved companies CSV downloaded");
  }, [companies, showToast, getStats, escapeCSVValue]);

  const downloadInquiriesCSV = useCallback(() => {
    if (!inquiries.length) {
      showToast("No inquiries found", "warning");
      return;
    }

    const headers = [
      "id",
      "name",
      "email",
      "number",
      "company",
      "companyType",
      "gst",
      "message",
      "isRead",
      "inquiryStatus",
      "createdAt",
    ];

    const rows = inquiries.map((inquiry) =>
      headers.map((header) => escapeCSVValue(inquiry[header])).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inquiries-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast("Inquiries CSV downloaded");
  }, [inquiries, showToast, escapeCSVValue]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.type?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ||
        (filter === "approved" && c.isApproved) ||
        (filter === "pending" && !c.isApproved);

      return matchSearch && matchFilter;
    });
  }, [companies, search, filter]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch =
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.batch?.toLowerCase().includes(search.toLowerCase()) ||
        b.type?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ||
        (filter === "pending" && b.status === "pending") ||
        (filter === "approved" && b.status === "approved");

      const matchDate = isDateWithinRange(b.createdAt, batchDateFrom, batchDateTo);
      return matchSearch && matchFilter && matchDate;
    });
  }, [batches, search, filter, batchDateFrom, batchDateTo]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.productId?.toLowerCase().includes(search.toLowerCase()) ||
        p.batch?.toLowerCase().includes(search.toLowerCase()) ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.type?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ||
        (filter === "approved" && p.status === "approved") ||
        (filter === "pending" && p.status !== "approved");

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const matchSearch =
        s.productId?.toLowerCase().includes(search.toLowerCase()) ||
        s.scratchCode?.toLowerCase().includes(search.toLowerCase()) ||
        s.result?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ||
        (filter === "approved" && (s.result === "valid" || s.status === "valid")) ||
        (filter === "pending" && (s.result === "invalid" || s.status === "invalid"));

      return matchSearch && matchFilter;
    });
  }, [scans, search, filter]);

  const filteredFraudRows = useMemo(() => {
    return duplicateScanRows.filter((row) => {
      const matchSearch = row.productId?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [duplicateScanRows, search]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchSearch =
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.email?.toLowerCase().includes(search.toLowerCase()) ||
        i.company?.toLowerCase().includes(search.toLowerCase()) ||
        i.companyType?.toLowerCase().includes(search.toLowerCase());

      const normalizedStatus = i.inquiryStatus || (i.isRead ? "Contacted" : "New");

      const matchFilter =
        filter === "all" ||
        (filter === "unread" && !i.isRead) ||
        (filter === "read" && i.isRead) ||
        (filter === "new" && normalizedStatus === "New") ||
        (filter === "contacted" && normalizedStatus === "Contacted") ||
        (filter === "closed" && normalizedStatus === "Closed");

      const matchDate = isDateWithinRange(i.createdAt, inquiryDateFrom, inquiryDateTo);

      return matchSearch && matchFilter && matchDate;
    });
  }, [inquiries, search, filter, inquiryDateFrom, inquiryDateTo]);

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: <FaChartLine />, count: null, color: "from-cyan-500 to-blue-600" },
    { key: "companies", label: "Companies", icon: <FaBuilding />, count: companies.length, color: "from-blue-500 to-indigo-600" },
    { key: "batches", label: "Batches", icon: <FaBoxes />, count: batches.filter((b) => b.status === "pending").length, color: "from-emerald-500 to-teal-600" },
    { key: "products", label: "Products", icon: <FaBoxOpen />, count: products.length, color: "from-violet-500 to-purple-600" },
    { key: "scanlogs", label: "Scan Logs", icon: <FaHistory />, count: scans.length, color: "from-slate-500 to-slate-700" },
    { key: "fraud", label: "Fraud Monitor", icon: <FaUserShield />, count: duplicateScanRows.length, color: "from-rose-500 to-red-600" },
    { key: "inquiries", label: "Inquiries", icon: <FaEnvelopeOpenText />, count: inquiries.filter((i) => !i.isRead).length, color: "from-purple-500 to-pink-600" },
  ];

  const statCards = [
    { label: "Total Companies", value: globalMetrics.totalCompanies, icon: <FaBuilding />, tone: "blue" },
    { label: "Pending Batches", value: globalMetrics.pendingBatches, icon: <FaBoxes />, tone: "emerald" },
    { label: "Products", value: globalMetrics.totalProducts, icon: <FaBoxOpen />, tone: "violet" },
    { label: "Scans", value: globalMetrics.totalScans, icon: <FaHistory />, tone: "slate" },
    { label: "Duplicate Products", value: globalMetrics.duplicateProducts, icon: <FaExclamationTriangle />, tone: "red" },
    { label: "Unread Inquiries", value: globalMetrics.unreadInquiries, icon: <FaEnvelopeOpenText />, tone: "purple" },
  ];

  const getToneClass = (tone) => {
    const tones = {
      blue: "from-blue-500/20 to-indigo-500/10 border-blue-900/40 text-blue-400",
      emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-900/40 text-emerald-400",
      violet: "from-violet-500/20 to-purple-500/10 border-violet-900/40 text-violet-400",
      slate: "from-slate-500/20 to-slate-700/10 border-slate-800 text-slate-300",
      red: "from-rose-500/20 to-red-500/10 border-red-900/40 text-red-400",
      purple: "from-purple-500/20 to-pink-500/10 border-purple-900/40 text-purple-400",
      amber: "from-amber-500/20 to-orange-500/10 border-amber-900/40 text-amber-400",
    };
    return tones[tone] || tones.slate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#111827",
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            padding: "14px 16px",
            border: "1px solid #374151",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />

      <aside className="lg:fixed lg:left-0 lg:top-0 lg:h-full w-full lg:w-72 bg-gray-900/95 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-gray-800 z-40 shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-xs text-gray-400">Future-ready dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setFilter("all");
                setSearch("");
                setSearchInput("");
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-200 text-left ${
                activeTab === item.key
                  ? `bg-gradient-to-r ${item.color} text-white shadow-xl`
                  : "text-gray-300 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              {item.count !== null && (
                <span
                  className={`min-w-[34px] h-8 px-2 rounded-xl text-xs flex items-center justify-center ${
                    activeTab === item.key ? "bg-white/15 text-white" : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 lg:absolute lg:bottom-6 lg:left-6 lg:right-6 space-y-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`w-full py-3 px-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${
              refreshing ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh All Data"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm bg-red-500 text-white hover:bg-red-600"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={handleBackClick}
                  className="p-2 rounded-2xl bg-gray-800/50 hover:bg-gray-700 transition-all text-gray-300 hover:text-white"
                  title="Go Back"
                >
                  <FaArrowLeft />
                </button>

                <div className="hidden sm:flex w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">A</span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Admin Super Dashboard
                  </h1>
                  <p className="text-sm text-gray-400">
                    Manage companies, products, fraud, scans and customer inquiries
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadApprovedCompaniesCSV}
                  className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all text-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaDownload />
                    Export Companies CSV
                  </span>
                </button>

                <button
                  onClick={downloadInquiriesCSV}
                  className="bg-purple-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg hover:bg-purple-600 transition-all text-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaDownload />
                    Export Inquiries CSV
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <section className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-3xl border bg-gradient-to-br ${getToneClass(card.tone)} p-5 shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{card.icon}</div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">{card.value}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-300">{card.label}</p>
              </div>
            ))}
          </section>

          {activeTab !== "overview" && (
            <section className="bg-gray-900/70 backdrop-blur-md rounded-3xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-800">
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Search {activeTab === "batches"
                      ? "batches"
                      : activeTab === "inquiries"
                      ? "inquiries"
                      : activeTab === "products"
                      ? "products"
                      : activeTab === "scanlogs"
                      ? "scan logs"
                      : activeTab === "fraud"
                      ? "fraud rows"
                      : "companies"}
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder={
                        activeTab === "batches"
                          ? "Search by batch, product name or type..."
                          : activeTab === "inquiries"
                          ? "Search by name, email, company or type..."
                          : activeTab === "products"
                          ? "Search by product ID, batch or type..."
                          : activeTab === "scanlogs"
                          ? "Search by product ID, scratch code or result..."
                          : activeTab === "fraud"
                          ? "Search duplicate product ID..."
                          : "Search companies..."
                      }
                      className="flex-1 p-4 border-2 border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-950 text-white placeholder:text-gray-500"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />

                    <button
                      onClick={handleSearch}
                      className="bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FaSearch />
                        Search
                      </span>
                    </button>

                    <button
                      onClick={resetAllFilters}
                      className="bg-gray-800 text-gray-200 px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-700 transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {activeTab === "inquiries"
                    ? [
                        { val: "all", label: "All" },
                        { val: "unread", label: "Unread" },
                        { val: "read", label: "Read" },
                        { val: "new", label: "New" },
                        { val: "contacted", label: "Contacted" },
                        { val: "closed", label: "Closed" },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => setFilter(val)}
                          className={`px-4 sm:px-6 py-3 rounded-2xl font-semibold shadow-md transition-all ${
                            filter === val
                              ? val === "unread"
                                ? "bg-purple-500 text-white"
                                : val === "read"
                                ? "bg-emerald-500 text-white"
                                : val === "new"
                                ? "bg-amber-500 text-slate-950"
                                : val === "contacted"
                                ? "bg-blue-500 text-white"
                                : val === "closed"
                                ? "bg-rose-500 text-white"
                                : "bg-blue-500 text-white"
                              : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                          }`}
                        >
                          {label}
                        </button>
                      ))
                    : activeTab === "fraud"
                    ? null
                    : [
                        { val: "all", label: "All" },
                        { val: "pending", label: "Pending" },
                        { val: "approved", label: "Approved" },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => setFilter(val)}
                          className={`px-4 sm:px-6 py-3 rounded-2xl font-semibold shadow-md transition-all ${
                            filter === val
                              ? val === "pending"
                                ? "bg-yellow-500 text-white"
                                : val === "approved"
                                ? "bg-green-500 text-white"
                                : "bg-blue-500 text-white"
                              : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                </div>

                {(activeTab === "batches" || activeTab === "inquiries") && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeTab === "batches" && (
                      <>
                        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Batch Date From
                          </label>
                          <input
                            type="date"
                            value={batchDateFrom}
                            onChange={(e) => setBatchDateFrom(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white outline-none"
                          />
                        </div>
                        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Batch Date To
                          </label>
                          <input
                            type="date"
                            value={batchDateTo}
                            onChange={(e) => setBatchDateTo(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white outline-none"
                          />
                        </div>
                      </>
                    )}

                    {activeTab === "inquiries" && (
                      <>
                        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Inquiry Date From
                          </label>
                          <input
                            type="date"
                            value={inquiryDateFrom}
                            onChange={(e) => setInquiryDateFrom(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white outline-none"
                          />
                        </div>
                        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Inquiry Date To
                          </label>
                          <input
                            type="date"
                            value={inquiryDateTo}
                            onChange={(e) => setInquiryDateTo(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="space-y-4">
            {activeTab === "overview" && (
              <>
                <section className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900/70 border border-gray-800 rounded-3xl p-6">
                    <h2 className="text-2xl font-black text-white mb-5">Quick snapshot</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/30">
                        <div className="text-sm text-gray-400">Approved Companies</div>
                        <div className="text-3xl font-black text-blue-400 mt-2">{globalMetrics.approvedCompanies}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-yellow-950/30 border border-yellow-900/30">
                        <div className="text-sm text-gray-400">Pending Companies</div>
                        <div className="text-3xl font-black text-yellow-400 mt-2">{globalMetrics.pendingCompanies}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/30">
                        <div className="text-sm text-gray-400">Approved Batches</div>
                        <div className="text-3xl font-black text-emerald-400 mt-2">{globalMetrics.approvedBatches}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/30">
                        <div className="text-sm text-gray-400">Closed Inquiries</div>
                        <div className="text-3xl font-black text-purple-400 mt-2">{globalMetrics.closedInquiries}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/70 border border-gray-800 rounded-3xl p-6">
                    <h2 className="text-2xl font-black text-white mb-5">Sidebar future ideas</h2>
                    <div className="space-y-3 text-sm">
                      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                        Add role-based admin access for super admin and support staff.
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                        Add notifications center for unread inquiries and duplicate scan spikes.
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                        Add charts for daily scans, batch approvals and inquiry trends.
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                        Add bulk actions for products, batches and inquiries.
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "companies" &&
              filteredCompanies.map((c) => {
                const stats = getStats(c.id);
                return (
                  <div
                    key={c.id}
                    className="bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl border border-gray-800 hover:border-blue-500/40 px-4 sm:px-5 py-4 transition-all duration-300"
                  >
                    <div className="flex flex-col xl:grid xl:grid-cols-[auto_1fr_auto_auto] gap-4 items-start xl:items-center">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow flex-shrink-0">
                        <span className="text-base font-bold text-white">
                          {c.name?.charAt(0)?.toUpperCase() || "C"}
                        </span>
                      </div>

                      <div className="min-w-0 w-full">
                        <p className="text-sm font-bold text-white truncate leading-tight">{c.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              c.isApproved ? "bg-green-900/40 text-green-400" : "bg-amber-900/40 text-amber-400"
                            }`}
                          >
                            {c.isApproved ? "Approved" : "Pending"}
                          </span>
                          {c.type && <span className="text-xs text-gray-400">{c.type}</span>}
                          {c.email && <span className="text-xs text-gray-500 truncate">{c.email}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm w-full xl:w-auto">
                        <div className="text-center min-w-[52px]">
                          <div className="font-black text-blue-400 text-base leading-none">{stats.totalProducts}</div>
                          <div className="text-gray-500 text-xs mt-0.5">Products</div>
                        </div>
                        <div className="text-center min-w-[52px]">
                          <div className="font-black text-red-400 text-base leading-none">{stats.fraud}</div>
                          <div className="text-gray-500 text-xs mt-0.5">Fraud</div>
                        </div>
                        <div className="text-center min-w-[52px]">
                          <div
                            className={`font-black text-base leading-none ${
                              stats.risk === "High"
                                ? "text-red-400"
                                : stats.risk === "Medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {stats.risk}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5">Risk</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                        {!c.isApproved && (
                          <button
                            onClick={() => approveCompany(c.id)}
                            className="bg-green-500 text-white px-3 py-2 rounded-xl font-semibold shadow hover:bg-green-600 transition-all text-xs whitespace-nowrap"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => viewCompanyDetails(c)}
                          className="bg-blue-500 text-white px-3 py-2 rounded-xl font-semibold shadow hover:bg-blue-600 transition-all text-xs whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => deleteCompany(c.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-xl font-semibold shadow hover:bg-red-600 transition-all text-xs whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {activeTab === "batches" && (
              <>
                <div className="bg-gradient-to-r from-emerald-950/50 to-blue-950/30 p-4 sm:p-6 rounded-3xl border border-emerald-800 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
                    Pending Batches {batches.filter((b) => b.status === "pending").length}
                  </h2>
                </div>

                {filteredBatches.map((b) => (
                  <div
                    key={b.id}
                    className="group bg-gray-900/70 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl border border-gray-800 hover:border-emerald-500/40 p-5 sm:p-8 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 mt-1">
                          <span className="text-xl sm:text-2xl font-bold text-white">
                            {b.type?.charAt(0)?.toUpperCase() || "B"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-2xl sm:text-3xl font-black text-white break-words">{b.name}</h2>
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-2 text-sm text-gray-300">
                            <span className="font-mono bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 break-all">
                              Batch {b.batch}
                            </span>
                            <span>Type {b.type}</span>
                            <span className="text-xl sm:text-2xl font-bold text-purple-400">
                              Qty {b.quantity}
                            </span>
                            <span className="text-gray-500">{formatDate(b.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`px-6 py-3 rounded-2xl font-bold shadow-lg flex-shrink-0 self-start ${
                          b.status === "approved"
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            : "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900"
                        }`}
                      >
                        {b.status === "approved" ? "Approved" : "Pending"}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-800">
                      {b.status === "pending" && (
                        <button
                          onClick={() => approveBatch(b)}
                          disabled={loading && approvingBatchId === b.id}
                          className={`flex-1 py-4 px-6 sm:px-8 rounded-2xl font-bold shadow-lg transition-all duration-200 ${
                            loading && approvingBatchId === b.id
                              ? "bg-emerald-400 cursor-not-allowed text-white"
                              : "bg-emerald-500 text-white hover:bg-emerald-600"
                          }`}
                        >
                          {loading && approvingBatchId === b.id ? "Generating..." : "Approve & Generate Products"}
                        </button>
                      )}

                      <button
                        onClick={() => deleteBatch(b.id, b.batch)}
                        className="flex-1 bg-red-500 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all"
                      >
                        Delete Batch
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "products" &&
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-900/75 border border-gray-800 rounded-3xl p-5 sm:p-6 hover:border-violet-500/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <h3 className="text-xl font-black text-white break-all">{p.productId}</h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">{p.name || "N/A"}</span>
                        <span className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">{p.type || "N/A"}</span>
                        <span className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">Batch {p.batch || "N/A"}</span>
                        <span className={`rounded-xl px-3 py-1.5 border ${p.isUsed ? "bg-amber-900/30 text-amber-400 border-amber-900/40" : "bg-emerald-900/30 text-emerald-400 border-emerald-900/40"}`}>
                          {p.isUsed ? "Used" : "Unused"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                    </div>

                    <button
                      onClick={() => viewProductDetails(p)}
                      className="bg-violet-500 text-white px-4 py-3 rounded-2xl font-bold hover:bg-violet-600 transition-all"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "scanlogs" &&
              filteredScans.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-900/75 border border-gray-800 rounded-3xl p-5 sm:p-6 hover:border-slate-500/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <h3 className="text-xl font-black text-white break-all">{s.productId || "Unknown Product"}</h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {s.result && (
                          <span
                            className={`rounded-xl px-3 py-1.5 border ${
                              s.result === "valid"
                                ? "bg-emerald-900/30 text-emerald-400 border-emerald-900/40"
                                : "bg-red-900/30 text-red-400 border-red-900/40"
                            }`}
                          >
                            {s.result}
                          </span>
                        )}
                        {s.scratchCode && (
                          <span className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 break-all">
                            {s.scratchCode}
                          </span>
                        )}
                        <span className="text-gray-500">{formatDate(s.createdAt || s.scannedAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => viewScanDetails(s)}
                      className="bg-slate-600 text-white px-4 py-3 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                    >
                      View Scan
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "fraud" && (
              <>
                <div className="bg-gradient-to-r from-red-950/50 to-rose-950/30 p-4 sm:p-6 rounded-3xl border border-red-900/40 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-red-400">
                    Fraud Monitor {duplicateScanRows.length}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    Products scanned more than once from scans collection
                  </p>
                </div>

                {filteredFraudRows.map((row) => (
                  <div
                    key={row.productId}
                    className="bg-gray-900/75 border border-gray-800 rounded-3xl p-5 sm:p-6 hover:border-red-500/40 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-white break-all">{row.productId}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-red-900/30 text-red-400 border border-red-900/40 rounded-xl px-3 py-1.5 text-sm">
                            Total scans: {row.totalScans}
                          </span>
                          <span className="bg-gray-800 text-gray-300 border border-gray-700 rounded-xl px-3 py-1.5 text-sm">
                            Latest: {formatDate(row.latestScanAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-red-400 font-bold">
                        Duplicate scan detected
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "inquiries" && (
              <>
                <div className="bg-gradient-to-r from-purple-950/50 to-pink-950/30 p-4 sm:p-6 rounded-3xl border border-purple-800 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-purple-400">
                    Customer Inquiries {inquiries.length}
                  </h2>
                </div>

                {filteredInquiries.map((i) => {
                  const inquiryStatus = i.inquiryStatus || (i.isRead ? "Contacted" : "New");

                  return (
                    <div
                      key={i.id}
                      className="group bg-gray-900/70 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl border border-gray-800 hover:border-purple-500/40 p-5 sm:p-8 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 mt-1">
                            <span className="text-xl sm:text-2xl font-bold text-white">
                              {i.name?.charAt(0)?.toUpperCase() || "I"}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h2 className="text-xl sm:text-2xl font-black text-white truncate">{i.name}</h2>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-300">
                              <span className="font-mono bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700 text-xs break-all">
                                {i.email}
                              </span>
                              <span className="font-mono bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700 text-xs break-all">
                                {i.company}
                              </span>
                              {i.companyType && (
                                <span className="text-base sm:text-lg font-bold text-emerald-400">
                                  {i.companyType}
                                </span>
                              )}
                            </div>

                            {i.gst && (
                              <div className="mt-2 text-xs text-gray-500 break-all">
                                GST: {i.gst}
                              </div>
                            )}

                            <div className="mt-2 text-xs text-gray-500">
                              {formatDate(i.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 self-start">
                          <div
                            className={`px-4 py-2 rounded-xl font-bold shadow-lg text-sm ${
                              i.isRead
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                : "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900"
                            }`}
                          >
                            {i.isRead ? "Read" : "Unread"}
                          </div>

                          <div
                            className={`px-4 py-2 rounded-xl font-bold text-sm text-center ${
                              inquiryStatus === "New"
                                ? "bg-amber-900/40 text-amber-400"
                                : inquiryStatus === "Contacted"
                                ? "bg-blue-900/40 text-blue-400"
                                : "bg-rose-900/40 text-rose-400"
                            }`}
                          >
                            {inquiryStatus}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-800">
                        {!i.isRead && (
                          <button
                            onClick={() => markInquiryRead(i.id)}
                            className="flex-1 py-3 px-6 rounded-xl font-bold shadow-lg transition-all bg-purple-500 text-white hover:bg-purple-600"
                          >
                            Mark as Contacted
                          </button>
                        )}

                        <button
                          onClick={() => updateInquiryStatus(i.id, "New")}
                          className="flex-1 bg-amber-500 text-slate-950 py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-amber-400 transition-all"
                        >
                          Set New
                        </button>

                        <button
                          onClick={() => updateInquiryStatus(i.id, "Contacted")}
                          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all"
                        >
                          Set Contacted
                        </button>

                        <button
                          onClick={() => updateInquiryStatus(i.id, "Closed")}
                          className="flex-1 bg-rose-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-rose-600 transition-all"
                        >
                          Close
                        </button>

                        <button
                          onClick={() => viewInquiryDetails(i)}
                          className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => deleteInquiry(i.id)}
                          className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {((activeTab === "companies" && !filteredCompanies.length) ||
              (activeTab === "batches" && !filteredBatches.length) ||
              (activeTab === "products" && !filteredProducts.length) ||
              (activeTab === "scanlogs" && !filteredScans.length) ||
              (activeTab === "fraud" && !filteredFraudRows.length) ||
              (activeTab === "inquiries" && !filteredInquiries.length)) && (
              <div className="text-center py-16 sm:py-24 bg-gray-900/50 backdrop-blur-md rounded-3xl border-2 border-dashed border-gray-700">
                <div className="text-6xl sm:text-8xl mb-8">
                  {activeTab === "inquiries"
                    ? "📩"
                    : activeTab === "fraud"
                    ? "🚨"
                    : activeTab === "products"
                    ? "📦"
                    : activeTab === "scanlogs"
                    ? "🧾"
                    : activeTab === "companies"
                    ? "🏢"
                    : "📭"}
                </div>
                <h3 className="text-2xl sm:text-4xl font-bold text-gray-300 mb-6">
                  No {activeTab} items found
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-blue-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* COMPANAY MODAL */}
      {showCompanyModal && selectedCompany && (() => {
        const stats = getStats(selectedCompany.id);

        const fields = [
          { icon: <FaBuilding />, label: "Company Name", value: selectedCompany.name },
          { icon: <FaEnvelope />, label: "Email", value: selectedCompany.email },
          { icon: <FaPhone />, label: "Phone", value: selectedCompany.phone },
          { icon: <FaIdCard />, label: "GST Number", value: selectedCompany.gst },
          { icon: <FaClipboardList />, label: "Licence No.", value: selectedCompany.license },
          { icon: <FaIndustry />, label: "Industry Type", value: selectedCompany.type },
          { icon: <FaMapMarkerAlt />, label: "Address", value: selectedCompany.address },
          { icon: <FaLayerGroup />, label: "Registered On", value: formatDate(selectedCompany.createdAt) },
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCompanyModal(false)} />
            <div className="relative bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-800">
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 sm:px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
                    <span className="text-lg font-bold text-white">
                      {selectedCompany.name?.charAt(0)?.toUpperCase() || "C"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">{selectedCompany.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedCompany.isApproved ? "bg-green-900/40 text-green-400" : "bg-amber-900/40 text-amber-400"
                      }`}
                    >
                      {selectedCompany.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCompanyModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-2xl font-bold leading-none"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="px-4 sm:px-6 py-5 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-950/40 rounded-2xl border border-blue-900/40">
                    <div className="text-2xl font-black text-blue-400">{stats.totalProducts}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Products</div>
                  </div>
                  <div className="text-center p-3 bg-red-950/40 rounded-2xl border border-red-900/40">
                    <div className="text-2xl font-black text-red-400">{stats.fraud}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Fraud Alerts</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-2xl border border-gray-700">
                    <div
                      className={`text-2xl font-black ${
                        stats.risk === "High"
                          ? "text-red-400"
                          : stats.risk === "Medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {stats.risk}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Risk Level</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {fields.map(
                    ({ icon, label, value }) =>
                      value && (
                        <div
                          key={label}
                          className="flex items-start gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700"
                        >
                          <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
                            <div className="text-sm font-medium text-white break-all mt-0.5">{value}</div>
                          </div>
                        </div>
                      )
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-800">
                  {!selectedCompany.isApproved && (
                    <button
                      onClick={() => {
                        approveCompany(selectedCompany.id);
                        setShowCompanyModal(false);
                      }}
                      className="flex-1 bg-green-500 text-white py-3 px-5 rounded-2xl font-bold shadow hover:bg-green-600 transition-all text-sm"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      deleteCompany(selectedCompany.id);
                      setShowCompanyModal(false);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 px-5 rounded-2xl font-bold shadow hover:bg-red-600 transition-all text-sm"
                  >
                    Delete Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* INQUIRY MODAL */}
      {showInquiryModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowInquiryModal(false)} />
          <div className="relative bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 sm:px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow">
                  <span className="text-lg font-bold text-white">
                    {selectedInquiry.name?.charAt(0)?.toUpperCase() || "I"}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">{selectedInquiry.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedInquiry.isRead ? "bg-emerald-900/40 text-emerald-400" : "bg-amber-900/40 text-amber-400"
                    }`}
                  >
                    {selectedInquiry.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowInquiryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-2xl font-bold leading-none"
              >
                <FaTimes />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <span className="text-lg mt-0.5"><FaEnvelope /></span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</div>
                      <div className="text-sm font-medium text-white break-all">{selectedInquiry.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <span className="text-lg mt-0.5"><FaPhone /></span>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</div>
                      <div className="text-sm font-medium text-white">{selectedInquiry.number}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <span className="text-lg mt-0.5"><FaBuilding /></span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Company</div>
                      <div className="text-sm font-medium text-white break-all">{selectedInquiry.company}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <span className="text-lg mt-0.5"><FaIndustry /></span>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Company Type</div>
                      <div className="text-sm font-medium text-white">{selectedInquiry.companyType || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedInquiry.gst && (
                    <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg"><FaIdCard /></span>
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">GST Number</h3>
                      </div>
                      <div className="font-mono text-white bg-gray-900 px-4 py-2 rounded-xl border border-gray-600 break-all">
                        {selectedInquiry.gst}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Inquiry Status
                    </div>
                    <div className="text-sm font-bold text-white">
                      {selectedInquiry.inquiryStatus || (selectedInquiry.isRead ? "Contacted" : "New")}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Created At
                    </div>
                    <div className="text-sm font-medium text-white">
                      {formatDate(selectedInquiry.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl"><FaClipboardList /></span>
                  <h3 className="text-lg font-bold text-white">Message</h3>
                </div>
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto break-words">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
                {!selectedInquiry.isRead && (
                  <button
                    onClick={() => {
                      markInquiryRead(selectedInquiry.id);
                      setShowInquiryModal(false);
                    }}
                    className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-xl font-bold shadow hover:bg-emerald-600 transition-all"
                  >
                    Mark as Contacted
                  </button>
                )}

                <button
                  onClick={() => {
                    updateInquiryStatus(selectedInquiry.id, "Closed");
                    setShowInquiryModal(false);
                  }}
                  className="flex-1 bg-rose-500 text-white py-3 px-6 rounded-xl font-bold shadow hover:bg-rose-600 transition-all"
                >
                  Close Inquiry
                </button>

                <button
                  onClick={() => {
                    deleteInquiry(selectedInquiry.id);
                    setShowInquiryModal(false);
                  }}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-bold shadow hover:bg-red-600 transition-all"
                >
                  Delete Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-black text-white">Product Details</h2>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ["Product ID", selectedProduct.productId],
                ["Batch", selectedProduct.batch],
                ["Name", selectedProduct.name],
                ["Type", selectedProduct.type],
                ["Scratch Code", selectedProduct.scratchCode],
                ["Status", selectedProduct.status],
                ["Used", selectedProduct.isUsed ? "Yes" : "No"],
                ["Created At", formatDate(selectedProduct.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className="text-sm text-white mt-1 break-all">{value || "N/A"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCAN MODAL */}
      {showScanModal && selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowScanModal(false)} />
          <div className="relative bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-black text-white">Scan Details</h2>
              <button onClick={() => setShowScanModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {Object.entries(selectedScan).map(([key, value]) => (
                <div key={key} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{key}</div>
                  <div className="text-sm text-white mt-1 break-all">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;