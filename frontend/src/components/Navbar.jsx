import { useState } from "react";
import {
  LayoutGrid,
  CalendarDays,
  FileText,
  CircleDollarSign,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
// 1. Import motion and AnimatePresence
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "leave", label: "Leave", icon: FileText },
  { id: "payslips", label: "Payslips", icon: CircleDollarSign },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function PixelPerfectSidebar({
  user = { name: "Ritesh Sharma", role: "Employee" },
}) {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="w-62 h-screen bg-[#0E1628] flex flex-col font-sans overflow-hidden">
      {/* 1. BRANDING SECTION */}
      <div className="p-6 border-b border-dashed border-blue-400/30">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 flex items-center justify-center text-white">
            <User size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-[14px] font-bold leading-tight">
              Employee MS
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-medium uppercase tracking-tight">
              Management System
            </p>
          </div>
        </motion.div>
      </div>

      {/* 2. USER PROFILE CARD */}
      <div className="p-4 border-b border-dashed border-blue-400/30">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-[#1C2539] rounded-xl p-3 flex items-center gap-3 border border-white/5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#2D3748] flex items-center justify-center text-[#8A94A6] text-xs font-bold border border-white/10">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-white text-[13px] font-bold truncate">
              {user.name}
            </span>
            <span className="text-[#8A94A6] text-[11px] font-medium">
              {user.role}
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. NAVIGATION LIST */}
      <div className="flex-1 px-3 py-6">
        <p className="px-4 text-[10px] font-bold text-[#4B5563] uppercase tracking-[0.15em] mb-4">
          Navigation
        </p>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`group w-full relative flex items-center gap-3.5 px-4 py-2.5 rounded-lg transition-colors duration-300 ${
                  isActive ? "text-white" : "text-[#8A94A6] hover:text-white"
                }`}
              >
                {/* SLIDING ACTIVE BACKGROUND */}
                {isActive && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-[#1C2539] rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <item.icon
                  size={18}
                  className={`transition-colors duration-300 ${isActive ? "text-white" : "text-[#8A94A6] group-hover:text-white"}`}
                />

                <span className="text-[13px] font-bold flex-1 text-left">
                  {item.label}
                </span>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <ChevronRight
                        size={14}
                        className="text-[#3F51B5]"
                        strokeWidth={3}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. LOGOUT FOOTER */}
      <div className="p-4 border-t border-dashed border-blue-400/30">
        <motion.button
          whileHover={{ x: 5 }}
          className="w-full flex items-center gap-3.5 px-4 py-2 text-[#8A94A6] hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="text-[13px] font-bold">Log out</span>
        </motion.button>
      </div>
    </aside>
  );
}
