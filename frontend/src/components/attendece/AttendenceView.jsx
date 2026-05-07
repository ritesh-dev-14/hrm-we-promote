import {
  Calendar,
  Clock,
  CircleDot,
} from "lucide-react";

import { motion } from "framer-motion";

export default function AttendanceView({
  stats,
  records,
  loading,
}) {
  const getIcon = (label) => {
    if (label.includes("Present")) {
      return <Calendar size={18} />;
    }

    if (label.includes("Absent")) {
      return <CircleDot size={18} />;
    }

    return <Clock size={18} />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHours = (hours) => {
    if (!hours) return "0h";

    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">
              Attendance
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Attendance History
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              View your attendance records and working hours.
            </p>
          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-2">
                    {stat.label}
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                  {getIcon(stat.label)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
        >
          {/* TABLE HEADER */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Attendance Records
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Daily check-in and working hours
              </p>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                    Clock In
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                    Clock Out
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                    Hours
                  </th>

                  <th className="px-6 py-4 text-right text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading && records?.length > 0 ? (
                  records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                        {formatDate(r.date)}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatTime(r.startTime)}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatTime(r.endTime)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          {formatHours(r.totalHours)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                          ${
                            r.status === "PRESENT"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center"
                    >
                      <p className="text-sm font-medium text-slate-400">
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
        </motion.div>
      </div>
    </div>
  );
}