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
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
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
    id: "tasks",
    label: "Tasks",
    icon: BriefcaseBusiness,
    path: "/tasks",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: CalendarDays,
    path: "/attendance",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
  },
  {
    id: "employee-attendance",
    label: "Employee Attendance",
    icon: CalendarDays,
    path: "/hr/employees-attendance",
    roles: ["HR"],
  },
  {
    id: "employee-leaves",
    label: "Employee Leaves",
    icon: FileText,
    path: "/hr/employees-leaves",
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

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const { role, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  // SAVE COLLAPSE STATE
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed);
  }, [isCollapsed]);

  // BODY SCROLL LOCK
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  const SidebarContent = ({ mobile = false }) => (
    <motion.div
      animate={{
        width: mobile ? 280 : isCollapsed ? 92 : 280,
      }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full bg-[#07111F] border-r border-white/5 flex flex-col relative overflow-hidden"
    >
      {/* COLLAPSE BUTTON */}
      {!mobile && (
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute top-80 -right-4 z-50 group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-[#0F172A] border border-white/10 shadow-2xl hover:border-indigo-500/30 hover:bg-[#131D31] transition-all duration-300">
            {/* glow */}
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300" />

            {isCollapsed ? (
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronRight
                  size={18}
                  className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronLeft
                  size={18}
                  className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                />
              </motion.div>
            )}
          </div>
        </button>
      )}

      {/* LOGO */}
      <div
        className={`border-b border-white/[0.05] transition-all duration-300 ${
          isCollapsed && !mobile ? "px-3 py-6" : "px-6 py-8"
        }`}
      >
        <div
          className={`flex items-center ${
            isCollapsed && !mobile ? "justify-center" : "gap-4"
          }`}
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl" />

            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <img
                src={MainLogo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <h2 className="text-lg font-black tracking-tight text-white">
                  WorkFlow
                </h2>

                <p className="text-xs text-slate-400 mt-1">Team Management</p>

                <span className="inline-flex mt-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                  {role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-5 custom-scrollbar">
        <div className="space-y-2">
          {allowedNavItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                key={item.id}
                onClick={() => {
                  navigate(item.path);

                  if (mobile) {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`group relative w-full flex items-center rounded-2xl transition-all duration-300 overflow-hidden ${
                  isCollapsed && !mobile
                    ? "justify-center px-0 py-3"
                    : "gap-3 px-4 py-3"
                }
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 border border-indigo-500/10 text-white shadow-lg shadow-indigo-500/10"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-indigo-400"
                  />
                )}

                <div
                  className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                  }`}
                >
                  <item.icon size={18} />
                </div>

                <AnimatePresence>
                  {(!isCollapsed || mobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-semibold whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-white/[0.05]">
        <button
          onClick={handleLogout}
          className={`group w-full flex items-center rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 ${
            isCollapsed && !mobile
              ? "justify-center px-0 py-3"
              : "gap-3 px-4 py-3"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
          </div>

          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-semibold"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* DESKTOP */}
      <aside className="hidden lg:block sticky top-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img
            src={MainLogo}
            alt="Logo"
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />

          <div>
            <h2 className="text-sm font-black text-slate-900">WorkFlow</h2>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {role}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-11 h-11 rounded-2xl bg-[#0B1120] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* SIDEBAR */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 260,
              }}
              className="absolute left-0 top-0 h-full"
            >
              <SidebarContent mobile />

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
      <main className="flex-1 min-w-0 lg:ml-0 pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
