export default function LeaveTable({ leaves, loading }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";

      case "REJECTED":
        return "text-rose-700 bg-rose-50 border-rose-200";

      default:
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] uppercase text-[11px] tracking-[0.15em] font-bold text-[#64748B]">
              <th className="px-6 py-4">Type</th>

              <th className="px-6 py-4">Dates</th>

              <th className="px-6 py-4">Reason</th>

              <th className="px-6 py-4 text-center">Days</th>

              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-16 text-center text-slate-400"
                >
                  Loading leaves...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-16 text-center text-[#94A3B8] text-sm font-medium"
                >
                  No leave applications found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <>
                  <tr
                    key={leave.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-all"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {leave.type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-800">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </span>

                        <span className="text-xs text-slate-400">
                          to {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {leave.reason}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-700">
                        {leave.days || 1}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(
                          leave.status,
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>

                  {/* REJECTION REASON ROW */}
                  {leave.status === "REJECTED" && leave.reviewNote && (
                    <tr className="bg-rose-50/30 border-t border-rose-100">
                      <td colSpan="5" className="px-6 py-3">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-1 bg-rose-500 rounded-full" />
                          <div>
                            <p className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-0.5">
                              Rejection Reason
                            </p>
                            <p className="text-sm text-rose-600">
                              {leave.reviewNote}
                            </p>
                            
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
