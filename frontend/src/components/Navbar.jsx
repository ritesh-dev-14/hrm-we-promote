import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  BellRing,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import MainLogo from "../assets/logo.jpeg";

const NAV_CONFIG = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    path: "/dashboard",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "COORDINATOR"],
  },

  {
    id: "tasks",
    label: "Projects",
    icon: BriefcaseBusiness,
    path: "/tasks",
    roles: ["ADMIN", "HR", "MANAGER"],
  },

  {
    id: "tasks-emp",
    label: "Tasks",
    icon: BriefcaseBusiness,
    path: "/tasks",
    roles: ["EMPLOYEE", "COORDINATOR"],
  },

  {
    id: "priority-actions",
    label: "Priority Actions",
    icon: Zap,
    path: "/priority-actions",
    roles: ["COORDINATOR"],
    notificationCount: 4,
  },

  {
    id: "assigned-actions",
    label: "Assigned Actions",
    icon: BellRing,
    path: "/assigned-actions",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
  },

  {
    id: "attendance",
    label: "Attendance",
    icon: CalendarDays,
    path: "/attendance",
    roles: ["EMPLOYEE", "MANAGER", "HR", "COORDINATOR"],
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
    label: "Team",
    icon: Users,
    path: "/hr/team",
    roles: ["HR", "ADMIN"],
  },

  {
    id: "leave",
    label: "Leave",
    icon: FileText,
    path: "/leave",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "COORDINATOR"],
  },

  {
    id: "payslips",
    label: "Payslips",
    icon: CircleDollarSign,
    path: "/payslips",
    roles: ["EMPLOYEE", "MANAGER", "HR", "COORDINATOR"],
  },

  {
    id: "admin-panel",
    label: "Admin",
    icon: ShieldCheck,
    path: "/admin/settings",
    roles: ["ADMIN"],
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "COORDINATOR"],
  },
];

const WIDE = 260;
const COLLAPSED = 78;

export default function ProfessionalSidebar({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar") === "collapsed",
  );

  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [assignedActionsCount, setAssignedActionsCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let interval;

    const fetchAssignedActionsCount = async () => {
      try {
        if (role !== "EMPLOYEE" && role !== "MANAGER" && role !== "HR") {
          return;
        }

        if (!user?.id) return;

        const res = await API.get(
          `/api/coordinator-assignments/assigned-to/${user.id}`,
        );

        const assignments = res?.data?.data?.data || [];

        // ONLY NEW ASSIGNED
        const assignedOnly = assignments.filter(
          (item) => item.status === "ASSIGNED",
        );

        setAssignedActionsCount(assignedOnly.length);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAssignedActionsCount();

    interval = setInterval(() => {
      fetchAssignedActionsCount();
    }, 3000);

    return () => clearInterval(interval);
  }, [role, user?.id]);

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed ? "collapsed" : "open");
  }, [collapsed]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  const allowedNav = useMemo(
    () => NAV_CONFIG.filter((i) => i.roles.includes(role)),
    [role],
  );

  const activeId = useMemo(() => {
    const sortedRoutes = [...allowedNav].sort(
      (a, b) => b.path.length - a.path.length,
    );

    const matched = sortedRoutes.find((item) => {
      if (item.path === "/dashboard") {
        return location.pathname === "/dashboard";
      }

      return (
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
      );
    });

    return matched?.id || null;
  }, [location.pathname, allowedNav]);
  
  const Sidebar = ({ mobile = false }) => {
    const width = mobile ? WIDE : collapsed ? COLLAPSED : WIDE;

    return (
      <motion.div
        initial={false}
        animate={{ width }}
        transition={{ duration: 0 }}
        className="h-full bg-[#0B1220] text-white flex flex-col border-r border-white/5 relative"
      >
        {/* TOP */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <img src={MainLogo} className="w-9 h-9 rounded-lg " />

          {(!collapsed || mobile) && (
            <div>
              <p className="text-sm font-semibold">We-Promote</p>
              <p className="text-[11px] text-slate-400">{role}</p>
            </div>
          )}
        </div>

        {/* NAV */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allowedNav.map((item) => {
            // const active = activeId === item.id;
            const active = activeId !== null && activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition
${active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {(!collapsed || mobile) && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </div>

                {item.id === "assigned-actions" &&
                  assignedActionsCount > 0 &&
                  (!collapsed || mobile) && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                      {assignedActionsCount}
                    </span>
                  )}
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            {(!collapsed || mobile) && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {/* TOGGLE (FIXED EDGE BUTTON — NO POSITION BUG) */}
        {!mobile && (
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="absolute top-6 -right-3 w-7 h-7 bg-white text-black rounded-full shadow flex items-center justify-center border"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* DESKTOP */}
      <aside
        className="hidden lg:block h-screen sticky top-0 shrink-0"
        style={{
          width: collapsed ? COLLAPSED : WIDE,
        }}
      >
        <Sidebar />
      </aside>

      {/* MOBILE TOP */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img src={MainLogo} className="w-8 h-8 rounded-md" />
          <span className="text-sm font-semibold">We-Promote</span>
        </div>

        <button onClick={() => setMobileOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 h-full"
            >
              <Sidebar mobile />
            </motion.div>

            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
      <main className="flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
