import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, Coffee, PlayCircle } from "lucide-react";

export default function AttendanceView({
  stats,
  records,
  onClockIn,
  onClockOut,
  onBreakToggle,
  status,
  seconds,
}) {
  const formatTime = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-white p-8 text-[#1F2937] relative">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 border rounded-xl bg-white shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h2 className="text-2xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <div className="p-4 border-b font-bold">Recent Activity</div>
        <table className="w-full text-sm">
          <tbody>
            {records?.length ? (
              records.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-4">{r.date}</td>
                  <td>{r.in}</td>
                  <td>{r.out}</td>
                  <td>{r.hours}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-10 text-center text-gray-400" colSpan="4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FLOATING ACTIONS */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-3">
        {/* TIMER */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div className="bg-white border shadow-xl px-5 py-2 rounded-xl">
              {formatTime(seconds)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BREAK */}
        {status !== "idle" && (
          <button
            onClick={onBreakToggle}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl"
          >
            {status === "working" ? "Break" : "Resume"}
          </button>
        )}

        {/* CLOCK */}
        <button
          onClick={status === "idle" ? onClockIn : onClockOut}
          className={`px-6 py-3 rounded-xl text-white ${
            status === "idle" ? "bg-indigo-600" : "bg-red-500"
          }`}
        >
          {status === "idle" ? "Clock In" : "Clock Out"}
        </button>
      </div>
    </div>
  );
}
