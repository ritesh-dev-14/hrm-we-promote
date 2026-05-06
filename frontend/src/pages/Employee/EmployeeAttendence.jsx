import  { useState, useEffect } from "react";
import { 
  Calendar, 
  AlertCircle, 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  PlayCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendancePage() {
  const [status, setStatus] = useState("idle"); // idle, working, break
  const [seconds, setSeconds] = useState(0);

  // Timer logic for working hours
  useEffect(() => {
    let interval;
    if (status === "working") {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const stats = [
    { label: "Days Present", value: "0", icon: Calendar, color: "blue" },
    { label: "Late Arrivals", value: "0", icon: AlertCircle, color: "slate" },
    { label: "Avg. Work Hrs", value: "8.5 Hrs", icon: Clock, color: "indigo" },
  ];

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-[#1F2937] relative">
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">Attendance</h1>
        <p className="text-[#64748B] text-sm mt-1">Track your work hours and daily check-ins</p>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="relative flex items-center p-6 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            {/* Left Accent Border */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${stat.color}-500`} />
            
            <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] flex items-center justify-center mr-4">
              <stat.icon size={22} className="text-[#64748B]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#64748B]">{stat.label}</p>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-0.5">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#F1F5F9]">
          <h3 className="font-bold text-[#0F172A]">Recent Activity</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] uppercase text-[11px] tracking-widest font-bold text-[#64748B]">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Working Hours</th>
                <th className="px-6 py-4">Day Type</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#F1F5F9]">
                <td colSpan="6" className="px-6 py-12 text-center text-[#94A3B8] text-sm font-medium">
                  No records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING ACTION INTERFACE */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4">
        {/* LIVE TIMER BUBBLE */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-indigo-100 shadow-xl rounded-2xl px-6 py-3 flex items-center gap-3 mb-2"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Current Session</span>
                <span className="text-lg font-mono font-bold text-slate-800">{formatTime(seconds)}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${status === 'working' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MULTI-ACTION BUTTONS */}
        <div className="flex gap-3">
          {status !== "idle" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatus(status === "working" ? "break" : "working")}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-colors ${
                status === "working" ? "bg-amber-500 shadow-amber-200" : "bg-indigo-600 shadow-indigo-200"
              }`}
            >
              {status === "working" ? (
                <>
                  <Coffee size={20} /> Take a Break
                </>
              ) : (
                <>
                  <PlayCircle size={20} /> Resume Work
                </>
              )}
            </motion.button>
          )}

          <motion.button
            layout
            onClick={() => {
                if(status === "idle") setStatus("working");
                else { setStatus("idle"); setSeconds(0); }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`min-w-55 flex items-center justify-between p-2 pl-6 rounded-2xl text-white shadow-2xl transition-all duration-300 ${
              status === "idle" ? "bg-[#4F46E5]" : "bg-rose-500 shadow-rose-200"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold">{status === "idle" ? "Clock In" : "Clock Out"}</span>
              <span className="text-[11px] opacity-80 font-medium">
                {status === "idle" ? "start your work day" : "end your session"}
              </span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {status === "idle" ? <LogIn size={24} /> : <LogOut size={24} />}
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}