export default function LeaveTable({ leaves, loading }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-emerald-600 bg-emerald-50/50 border-emerald-100";
      case "REJECTED":
        return "text-rose-600 bg-rose-50/50 border-rose-100";
      default:
        // PENDING status uses a sophisticated amber/indigo mix
        return "text-amber-600 bg-amber-50/50 border-amber-100";
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/40">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                Leave Period
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                Reason & Category
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 text-right">
                Approval Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Synchronizing...</span>
                  </div>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-400 font-bold text-sm">No leave applications found</p>
                    <p className="text-slate-300 text-xs">Your requested leaves will be listed here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="group hover:bg-slate-50/30 transition-all duration-300 cursor-default"
                >
                  <td className="px-8 py-7">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-base tracking-tight leading-none mb-1.5">
                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        until {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-7">
                    <div className="max-w-md">
                      <p className="text-sm font-medium text-slate-600 leading-relaxed truncate">
                        {leave.reason}
                      </p>
                    </div>
                  </td>

                  <td className="px-8 py-7 text-right">
                    <span
                      className={`inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black tracking-[0.1em] border uppercase transition-all duration-300 group-hover:scale-105 ${getStatusStyle(
                        leave.status,
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        leave.status === 'APPROVED' ? 'bg-emerald-500' : 
                        leave.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}