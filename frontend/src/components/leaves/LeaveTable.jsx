export default function LeaveTable({ leaves, loading }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "REJECTED":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        // PENDING status
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                Leave Period
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                Reason & Category
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Synchronizing...
                    </span>
                  </div>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-500 font-semibold text-sm">
                      No leave applications found
                    </p>
                    <p className="text-slate-400 text-xs">
                      Your requested leaves will be listed here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="group hover:bg-slate-50 transition-all duration-300 cursor-default"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-sm">
                        {new Date(leave.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        to{" "}
                        {new Date(leave.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-slate-700">{leave.reason}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${getStatusStyle(
                        leave.status,
                      )}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          leave.status === "APPROVED"
                            ? "bg-emerald-600"
                            : leave.status === "REJECTED"
                              ? "bg-rose-600"
                              : "bg-amber-600"
                        }`}
                      />
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
