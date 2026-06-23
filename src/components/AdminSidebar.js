import React from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  LayoutDashboard,
  Building2,
  PackageCheck,
  ShieldCheck,
  History,
  BarChart3,
  Map,
  LogOut,
  ChevronRight,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";

  const menuSections = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
        { name: "Companies", icon: Building2, tab: "companies" },
        { name: "Batches", icon: PackageCheck, tab: "batches" },
        { name: "Products", icon: ShieldCheck, tab: "products" },
      ],
    },
    {
      title: "Monitoring",
      items: [
        { name: "Scan Logs", icon: History, tab: "scans" },
        { name: "Fraud Monitor", icon: AlertTriangle, tab: "fraud" },
        { name: "Inquiries", icon: FileText, tab: "inquiries" },
      ],
    },
    {
      title: "Reports",
      items: [
        { name: "Analytics", icon: BarChart3, tab: "analytics" },
        { name: "Scan Map", icon: Map, tab: "map" },
      ],
    },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const isActive = (tab) => activeTab === tab;

  const navigateToTab = (tab) => {
    navigate(`/admin?tab=${tab}`);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0b1220] border-r border-white/10 text-white shadow-2xl z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-black">A</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-wide">Admin Panel</h2>
              <p className="text-sm text-slate-400">Product Auth System</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold">
                {section.title}
              </p>

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.tab);

                  return (
                    <button
                      key={item.tab}
                      onClick={() => navigateToTab(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 border ${
                        active
                          ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border-cyan-400/30 shadow-lg"
                          : "border-transparent hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          active
                            ? "bg-cyan-400/15 text-cyan-300"
                            : "bg-white/5 text-slate-300"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 text-left">
                        <p
                          className={`text-sm font-semibold ${
                            active ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className={`transition-all ${
                          active ? "text-cyan-300" : "text-slate-500"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm font-semibold text-white">Administrator</p>
            <p className="text-xs text-slate-400 mt-1">Secure control access enabled</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all shadow-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;