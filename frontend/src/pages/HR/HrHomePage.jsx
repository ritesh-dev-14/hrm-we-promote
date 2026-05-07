import { useState } from "react";
import {
  Users,
  Building2,
  Calendar,
  FileText,
  Plus,
} from "lucide-react";

import { motion } from "framer-motion";

import HrAddEmployee from "./HrAddEmployee";
import AttendanceCard from "../../components/attendece/AttendenceCard";

const HrHomePage = () => {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  const stats = [
    {
      title: "Employees",
      value: "48",
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Departments",
      value: "10",
      icon: Building2,
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      title: "Attendance",
      value: "42",
      icon: Calendar,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "Leaves",
      value: "03",
      icon: FileText,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ];

  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-white border border-slate-200/80 rounded-[34px] p-6 lg:p-8 mb-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]"
        >
          {/* BLUR EFFECT */}
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-indigo-100/60 blur-3xl rounded-full" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* LEFT */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-500 mb-3">
                HR PANEL
              </p>

              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                Welcome Back 👋
              </h1>

              <p className="mt-3 text-slate-500 text-sm lg:text-[15px] max-w-xl leading-relaxed">
                Manage employee attendance and daily HR operations with a clean
                and modern workspace.
              </p>
            </div>

            {/* BUTTON */}
            <motion.button
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddEmployeeOpen(true)}
              className="group flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-lg hover:bg-slate-800 transition-all duration-300"
            >
              <Plus
                size={18}
                className="group-hover:rotate-90 transition-all duration-300"
              />
              Add Employee
            </motion.button>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="group bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                    {stat.title}
                  </p>

                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </h2>
                </div>

                <motion.div
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center`}
                >
                  <stat.icon size={24} strokeWidth={2} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* ATTENDANCE */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="xl:col-span-7"
          >
            <div className="bg-white border border-slate-200/80 rounded-[34px] p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)] h-full">
              <AttendanceCard />
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="xl:col-span-5 flex flex-col gap-5"
          >
            {/* QUICK ACTIONS */}
            <div className="bg-white border border-slate-200/80 rounded-[34px] p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-3">
                QUICK ACTIONS
              </p>

              <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-6">
                HR Controls
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Add Employee",
                  "Attendance",
                  "Departments",
                  "Leave Requests",
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="h-24 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 transition-all duration-300 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md"
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* OVERVIEW */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[34px] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              {/* GLOW */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/20 blur-3xl rounded-full" />

              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">
                  TODAY STATUS
                </p>

                <h3 className="text-3xl font-black tracking-tight mb-6">
                  Workforce Overview
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      label: "Present Employees",
                      value: "42",
                    },
                    {
                      label: "On Leave",
                      value: "03",
                    },
                    {
                      label: "Departments Active",
                      value: "10",
                    },
                    {
                      label: "Attendance Rate",
                      value: "92%",
                      active: true,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 2 }}
                      className="flex items-center justify-between border-b border-white/10 pb-3 last:border-none"
                    >
                      <span className="text-slate-300 text-sm">
                        {item.label}
                      </span>

                      <span
                        className={`font-bold text-lg ${
                          item.active ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* MODAL */}
        <HrAddEmployee
          isOpen={isAddEmployeeOpen}
          onClose={() => setIsAddEmployeeOpen(false)}
          onSave={handleAddEmployee}
        />
      </div>
    </div>
  );
};

export default HrHomePage;