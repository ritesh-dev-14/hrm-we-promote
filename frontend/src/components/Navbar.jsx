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
    roles: ["EMPLOYEE", "MANAGER"],
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

  // logout
  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  // filter menu based on role
  const allowedNavItems = useMemo(() => {
    return NAV_CONFIG.filter((item) => item.roles.includes(role));
  }, [role]);

  // active tab detection
  const activeTab = useMemo(() => {
    return (
      allowedNavItems.find((item) =>
        location.pathname.startsWith(item.path)
      )?.id || "dashboard"
    );
  }, [location.pathname, allowedNavItems]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1120] text-white">
      {/* LOGO */}
      <div className="py-10 flex flex-col items-center border-b border-white/[0.03]">
        <div className="w-20 h-20 rounded-full border-[3px] border-white/10 p-1 bg-[#1C2539]">
          <img
            src={MainLogo}
            alt="Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h2 className="text-[14px] font-bold mt-4">Portal</h2>
        <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 uppercase">
          {role}
        </span>
      </div>

      {/* NAV */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-indigo-600/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? "text-indigo-400" : ""}
                />
                <span className="text-sm font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t border-white/[0.03]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
        >
          <LogOut size={20} />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* DESKTOP */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* MOBILE BUTTON */}
      <div className="lg:hidden fixed top-5 left-5 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-[#0B1120] text-white rounded-full"
        >
          <Menu />
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="absolute left-0 top-0 w-[280px] h-full bg-[#0B1120]"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-white"
              >
                <X />
              </button>

              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}