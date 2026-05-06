import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  CalendarDays,
  FileText,
  CircleDollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ShieldCheck,
} from "lucide-react";

// Assuming your authContext is in this path
import { useAuth } from "../context/AuthContext";
import MainLogo from "../assets/logo.jpeg";

const NAV_CONFIG = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutGrid, 
    path: "/dashboard", 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] 
  },
  { 
    id: "attendance", 
    label: "Attendance", 
    icon: CalendarDays, 
    path: "/attendance", 
    roles: ["EMPLOYEE", "MANAGER"] 
  },
  { 
    id: "team", 
    label: "Team Management", 
    icon: Users, 
    path: "/hr/team", 
    roles: ["HR", "ADMIN"] 
  },
  { 
    id: "leave", 
    label: "Leave", 
    icon: FileText, 
    path: "/leave", 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] 
  },
  { 
    id: "payslips", 
    label: "Payslips", 
    icon: CircleDollarSign, 
    path: "/payslips", 
    roles: ["EMPLOYEE", "MANAGER", "HR"] 
  },
  { 
    id: "admin-panel", 
    label: "Admin Controls", 
    icon: ShieldCheck, 
    path: "/admin/settings", 
    roles: ["ADMIN"] 
  },
  { 
    id: "settings", 
    label: "Settings", 
    icon: Settings, 
    path: "/settings", 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] 
  },
];

export default function ProfessionalSidebar({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role, logout } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 2. Filter Nav Items based on Role
   * useMemo prevents recalculating on every re-render.
   */
  const allowedNavItems = useMemo(() => {
    return NAV_CONFIG.filter((item) => item.roles.includes(role));
  }, [role]);

  const activeTab = useMemo(() => {
    return allowedNavItems.find((item) => location.pathname.startsWith(item.path))?.id || "dashboard";
  }, [location.pathname, allowedNavItems]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1120] text-white">
      {/* BRANDING */}
      <div className="py-10 flex flex-col items-center border-b border-white/[0.03]">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-colors" />
          <div className="relative w-20 h-20 rounded-full border-[3px] border-white/10 p-1 shadow-2xl bg-[#1C2539]">
            <img 
              src={MainLogo} 
              alt="Company Logo" 
              className="w-full h-full rounded-full object-cover transition-all" 
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center">
          <h2 className="text-[14px] font-bold text-white tracking-wide">Portal</h2>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-black uppercase tracking-tighter">
            {role} Access
          </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Main Menu</p>
        <nav className="flex flex-col gap-2">
          {allowedNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill-bg"
                    className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon 
                  size={20} 
                  className={`relative z-10 transition-colors ${isActive ? "text-indigo-400" : "group-hover:text-slate-200"}`} 
                />
                <span className="relative z-10 text-[14px] font-bold tracking-tight">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/[0.03]">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all rounded-xl group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[14px] font-bold">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 border-r border-black/[0.05] z-30 shrink-0">
        <SidebarContent />
      </aside>

      {/* MOBILE TRIGGER */}
      <div className="lg:hidden fixed top-5 left-5 z-40">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2.5 p-1.5 pr-4 bg-[#0B1120] border border-white/10 rounded-full shadow-2xl"
        >
          <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden">
            <img src={MainLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <Menu size={20} className="text-indigo-400" />
        </motion.button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] shadow-2xl"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}