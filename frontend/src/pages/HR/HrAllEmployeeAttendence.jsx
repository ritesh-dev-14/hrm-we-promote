import { useEffect, useMemo, useState } from "react";

import {
  Search,
  CalendarDays,
  Clock3,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

import api from "../../services/api";

export default function HrAttendance() {
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/attendance");

      setAttendance(res.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // FILTERED DATA

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const employeeName =
        item.user?.name?.toLowerCase() || "";

      const employeeId =
        item.user?.employeeId?.toLowerCase() || "";

      const department =
        item.user?.department?.toLowerCase() || "";

      const searchValue = search.toLowerCase();

      return (
        employeeName.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        department.includes(searchValue)
      );
    });
  }, [attendance, search]);

  // STATS

  const stats = useMemo(() => {
    const totalEmployees = attendance.length;

    const presentEmployees = attendance.filter(
      (item) => item.status === "PRESENT",
    ).length;

    const absentEmployees = attendance.filter(
      (item) => item.status === "ABSENT",
    ).length;

    return {
      totalEmployees,
      presentEmployees,
      absentEmployees,
    };
  }, [attendance]);

  // FORMAT DATE

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // FORMAT TIME

  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FORMAT HOURS

  const formatHours = (hours) => {
    if (!hours) return "--";

    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">
              HR Attendance
            </p>

            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Employees Attendance
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Monitor daily attendance records across teams.
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-[320px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400 transition-all"
            />
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            {
              label: "Total Employees",
              value: stats.totalEmployees,
              icon: Users,
            },

            {
              label: "Present Today",
              value: stats.presentEmployees,
              icon: CalendarDays,
            },

            {
              label: "Absent Today",
              value: stats.absentEmployees,
              icon: Clock3,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-2">
                    {item.label}
                  </p>

                  <h2 className="text-3xl font-black text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <item.icon size={22} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TABLE */}

        <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-5 text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Employee
                  </th>

                  <th className="px-6 py-5 text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Department
                  </th>

                  <th className="px-6 py-5 text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Check In
                  </th>

                  <th className="px-6 py-5 text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Check Out
                  </th>

                  <th className="px-6 py-5 text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Hours
                  </th>

                  <th className="px-6 py-5 text-right text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading &&
                filteredAttendance.length > 0 ? (
                  filteredAttendance.map(
                    (item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay: index * 0.02,
                        }}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* EMPLOYEE */}

                        <td className="px-6 py-5">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {item.user?.name ||
                                "Unknown"}
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">
                              {item.user
                                ?.employeeId ||
                                "--"}
                            </p>
                          </div>
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {item.user?.department ||
                            "--"}
                        </td>

                        {/* CHECK IN */}

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatTime(
                            item.startTime,
                          )}
                        </td>

                        {/* CHECK OUT */}

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatTime(item.endTime)}
                        </td>

                        {/* HOURS */}

                        <td className="px-6 py-5">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                            {formatHours(
                              item.totalHours,
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase
                            
                            ${
                              item.status ===
                              "PRESENT"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : item.status ===
                                    "HALF_DAY"
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                  : "bg-red-50 text-red-700 border border-red-100"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </motion.tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-20 text-center"
                    >
                      <p className="text-sm text-slate-400 font-medium">
                        {loading
                          ? "Loading attendance..."
                          : "No attendance records found."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}