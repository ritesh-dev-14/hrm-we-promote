import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  CircleDot 
} from "lucide-react";

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
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Maps icons to the stats for a professional look
  const getIcon = (label) => {
    if (label.includes("Present")) return <Calendar size={20} />;
    if (label.includes("Late")) return <AlertCircle size={20} />;
    return <Clock size={20} />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-[#1E293B]">
      {/* HEADER section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">My Attendance</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Monitor your daily logs and work duration.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                {getIcon(stat.label)}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CircleDot size={16} className="text-indigo-500" />
            Recent Activity
          </h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">May 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Clock In</th>
                <th className="px-6 py-4">Clock Out</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records?.length ? (
                records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{r.date}</td>
                    <td className="px-6 py-4 text-slate-600">{r.in}</td>
                    <td className="px-6 py-4 text-slate-600">{r.out}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{r.hours}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 uppercase">On Time</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-20 text-center" colSpan="5">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Clock size={24} />
                       </div>
                       <p className="text-slate-400 font-medium text-sm">No attendance logs found for this period.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING ACTION INTERFACE - THE "DOCK" */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 flex flex-col items-center md:items-end gap-4 z-50">
        
        {/* TIMER DISPLAY */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">
                  {status === "working" ? "Working Session" : "On Break"}
                </span>
                <span className="text-xl font-mono font-bold tracking-tighter tabular-nums">
                  {formatTime(seconds)}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${status === 'working' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200">
          {/* BREAK TOGGLE */}
          {status !== "idle" && (
            <button
              onClick={onBreakToggle}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                status === "working" 
                ? "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-600" 
                : "bg-amber-500 text-white shadow-lg shadow-amber-200"
              }`}
            >
              {status === "working" ? <Coffee size={18} /> : <Play size={18} />}
              <span className="hidden md:inline">{status === "working" ? "Take Break" : "Resume"}</span>
            </button>
          )}

          {/* MAIN CLOCK ACTION */}
          <button
            onClick={status === "idle" ? onClockIn : onClockOut}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-bold text-white transition-all transform active:scale-95 ${
              status === "idle" 
              ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" 
              : "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200"
            }`}
          >
            {status === "idle" ? <LogIn size={20} /> : <LogOut size={20} />}
            <span>{status === "idle" ? "Clock In" : "Clock Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}