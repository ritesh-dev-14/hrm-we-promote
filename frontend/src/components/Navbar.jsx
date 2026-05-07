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

import { useAuth } from "../context/AuthContext";
import MainLogo from "../assets/logo.jpeg";

const NAV_CONFIG = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    path: "/dashboard",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: CalendarDays,
    path: "/attendance",
    roles: ["EMPLOYEE", "MANAGER","HR"],
  },
    {

    id: "employee-attendance",

    label: "Employee Attendance",

    icon: CalendarDays,

    path: "/hr/employees-attendance",

    roles: ["HR"],

  },
  {
    id: "team",
    label: "Team Management",
    icon: Users,
    path: "/hr/team",
    roles: ["HR", "ADMIN"],
  },
  {
    id: "leave",
    label: "Leave",
    icon: FileText,
    path: "/leave",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    id: "payslips",
    label: "Payslips",
    icon: CircleDollarSign,
    path: "/payslips",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
  },
  {
    id: "admin-panel",
    label: "Admin Controls",
    icon: ShieldCheck,
    path: "/admin/settings",
    roles: ["ADMIN"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
];

export default function ProfessionalSidebar({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const allowedNavItems = useMemo(() => {
    return NAV_CONFIG.filter((item) => item.roles.includes(role));
  }, [role]);

  const activeTab = useMemo(() => {
    return (
      allowedNavItems.find((item) => location.pathname.startsWith(item.path))
        ?.id || "dashboard"
    );
  }, [location.pathname, allowedNavItems]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-full bg-[#0B1120] text-white">
      {/* LOGO */}
      <div className="flex flex-col items-center justify-center px-6 py-8 border-b border-white/[0.05] shrink-0">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />

          <div className="relative w-20 h-20 rounded-full border border-white/10 p-1 bg-[#111827] shadow-lg">
            <img
              src={MainLogo}
              alt="Logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <span className="mt-5 text-[11px] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
          {role}
        </span>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-2">
          {allowedNavItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-indigo-500/5 border border-indigo-500/10 text-white shadow-lg shadow-indigo-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-indigo-400" />
                )}

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-300"
                      : "bg-white/[0.03] text-slate-400 group-hover:bg-white/[0.06] group-hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                </div>

                <span className="text-sm font-medium tracking-[0.01em]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/[0.05] shrink-0">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-red-500/10 transition-all duration-300">
            <LogOut size={18} />
          </div>

          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-[280px] lg:min-w-[280px] lg:max-w-70 h-screen sticky top-0 border-r border-slate-200/80 bg-[#0B1120]">
        <SidebarContent />
      </aside>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-5 left-5 z-40 w-11 h-11 rounded-xl bg-[#0B1120] text-white flex items-center justify-center shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* SIDEBAR */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-70 bg-[#0B1120] border-r border-white/5 shadow-2xl"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-5 right-5 z-50 w-9 h-9 rounded-lg bg-white/4 text-white flex items-center justify-center hover:bg-white/8 transition-all"
              >
                <X size={18} />
              </button>

              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
