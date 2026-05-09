import { useState } from "react";
import {
  Users,
  Building2,
  Calendar,
  FileText,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

import HrAddEmployee from "./HrAddEmployee";
import AttendanceCard from "../../components/attendece/AttendenceCard";
import {useAuth} from "../../context/AuthContext"

const HrHomePage = () => {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const {user} = useAuth()
  const Hrfirstname = user.name.split(' ')[0]

  

  const stats = [
    { title: "Employees", value: "48", icon: Users, accent: "text-blue-600", dot: "bg-blue-500" },
    { title: "Departments", value: "10", icon: Building2, accent: "text-violet-600", dot: "bg-violet-500" },
    { title: "Attendance", value: "42", icon: Calendar, accent: "text-emerald-600", dot: "bg-emerald-500" },
    { title: "Leaves", value: "03", icon: FileText, accent: "text-amber-600", dot: "bg-amber-500" },
  ];

  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3"> 
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                Welcome Back, {Hrfirstname}
              </h1>

              <p className="mt-2 text-slate-500 text-sm lg:text-base max-w-xl">
                Monitor teams, manage operations, and keep workflows running smoothly.
              </p>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddEmployeeOpen(true)}
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:bg-slate-800 transition-all duration-200"
            >
              <Plus
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
              Add Employee
            </motion.button>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -3 }}
              className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Subtle accent line on hover */}
              <span className={`absolute top-0 left-0 h-0.5 w-0 ${stat.dot} group-hover:w-full transition-all duration-500`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 ${stat.accent} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <stat.icon size={20} strokeWidth={2} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-slate-300 group-hover:text-slate-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
                />
              </div>

              <p className="text-xs font-medium text-slate-500 mb-1">{stat.title}</p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* ATTENDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="xl:col-span-7"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full">
              <AttendanceCard />
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="xl:col-span-5 flex flex-col gap-4"
          >
            {/* QUICK ACTIONS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  HR Controls
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Add Employee", icon: Users },
                  { label: "Attendance", icon: Calendar },
                  { label: "Departments", icon: Building2 },
                  { label: "Leave Requests", icon: FileText },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative h-24 rounded-xl border border-slate-200 bg-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 p-4 text-left overflow-hidden"
                  >
                    <item.icon
                      size={18}
                      className="text-slate-400 group-hover:text-white transition-colors duration-300 mb-2"
                    />
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">
                      {item.label}
                    </p>
                    <ArrowUpRight
                      size={14}
                      className="absolute top-3 right-3 text-slate-300 group-hover:text-white opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* OVERVIEW */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">Workforce Overview</h3>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Today
                </span>
              </div>

              <div className="space-y-1">
                {[
                  { label: "Present Employees", value: "42" },
                  { label: "On Leave", value: "03" },
                  { label: "Departments Active", value: "10" },
                  { label: "Attendance Rate", value: "92%", active: true },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between border-b border-white/10 py-3 last:border-none cursor-pointer group"
                  >
                    <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">
                      {item.label}
                    </span>
                    <span
                      className={`font-semibold text-lg ${
                        item.active ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {item.value}
                    </span>
                  </motion.div>
                ))}
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




