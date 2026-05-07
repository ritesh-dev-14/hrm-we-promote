import { Calendar, Clock, AlertCircle, CircleDot } from "lucide-react";

export default function AttendanceView({ stats, records }) {
  const getIcon = (label) => {
    if (label.includes("Present")) return <Calendar size={20} />;
    if (label.includes("Late")) return <AlertCircle size={20} />;
    return <Clock size={20} />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-[#1E293B]">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Attendance Log</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Detailed history of your work sessions and punctuality.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <CircleDot size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-700">Period: May 2026</span>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-100 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
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

      {/* HISTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Check In</th>
                <th className="px-6 py-5">Check Out</th>
                <th className="px-6 py-5">Work Duration</th>
                <th className="px-6 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records?.length ? (
                records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-700">{r.date}</td>
                    <td className="px-6 py-4 text-slate-600">{r.in}</td>
                    <td className="px-6 py-4 text-slate-600">{r.out}</td>
                    <td className="px-6 py-4">
                       <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                         {r.hours}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-50 text-green-600 border border-green-100 uppercase">
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-20 text-center" colSpan="5">
                    <p className="text-slate-400 font-medium text-sm">No records for this month yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}