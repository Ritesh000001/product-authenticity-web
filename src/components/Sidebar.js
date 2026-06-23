import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

function Sidebar({ isOpen = false, setIsOpen = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [companyName, setCompanyName] = useState("Company Panel");
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const menuItems = useMemo(
    () => [
      { name: "Dashboard", icon: "📊", path: "/dashboard" },
      { name: "Add Product", icon: "➕", path: "/add-product" },
      { name: "Product List", icon: "📋", path: "/products" },
      { name: "Approved CSV", icon: "✅", path: "/approved-products" },
      { name: "Print Labels", icon: "🖨️", path: "/print-labels" },
      { name: "Verify Product", icon: "🔍", path: "/verify" },
      { name: "Scan History", icon: "📈", path: "/history", extraTopSpace: true },
      { name: "Batch PDF Print", icon: "📄", path: "/batch-print" }
    ],
    []
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user?.email) {
          setCompanyName("Company Panel");
          setLoadingCompany(false);
          return;
        }

        const q = query(
          collection(db, "companies"),
          where("email", "==", user.email)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const companyData = snapshot.docs[0].data();
          setCompanyName(companyData.name || "Company Panel");
        } else {
          setCompanyName("Company Panel");
        }
      } catch (error) {
        console.error("Company fetch error:", error);
        setCompanyName("Company Panel");
      } finally {
        setLoadingCompany(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-slate-200/10 bg-[#0F172A] text-white shadow-2xl transition-transform duration-300 ${
          isDesktop ? "translate-x-0" : isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Menu
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F766E] shadow-lg ring-1 ring-white/10">
              <span className="text-2xl">🏢</span>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-white">
                {loadingCompany ? "Loading..." : companyName}
              </h2>
              <p className="mt-1 text-sm text-slate-300">Product Management</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 overscroll-contain">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    "border border-transparent",
                    isActive
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-200 hover:bg-white/8 hover:text-white hover:translate-x-1",
                    item.extraTopSpace ? "mt-5" : ""
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-200",
                      isActive
                        ? "bg-slate-100"
                        : "bg-white/5 group-hover:bg-white/10"
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.name}</span>

                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-all duration-200",
                      isActive
                        ? "bg-[#0F766E] opacity-100"
                        : "bg-[#0F766E] opacity-0 group-hover:opacity-100"
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-4 pb-6 pt-5">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[#991B1B] bg-[#7F1D1D] px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#991B1B] hover:shadow-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg transition-transform duration-200 group-hover:scale-105">
              🚪
            </span>

            <span className="flex-1 text-left">Logout</span>

            <svg
              className="h-5 w-5 opacity-70 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7"
              />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;