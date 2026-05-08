// import { useEffect, useMemo, useState } from "react";
// import {
//   Thermometer,
//   Umbrella,
//   TreePalm,
//   Plus,
// } from "lucide-react";

// import API from "../../services/api";
// import LeaveModal from "./LeaveModel";
// import LeaveTable from "./LeaveTable";

// export default function LeavePage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [leaves, setLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);

//       const res = await API.get("/api/employee/leaves");

//       setLeaves(res.data?.data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   const leaveStats = useMemo(() => {
//     return [
//       {
//         label: "Sick Leave",
//         count: leaves.filter((l) =>
//           l.reason?.toLowerCase().includes("sick")
//         ).length,
//         icon: Thermometer,
//         color: "border-blue-500",
//       },
//       {
//         label: "Casual Leave",
//         count: leaves.filter((l) =>
//           l.reason?.toLowerCase().includes("casual")
//         ).length,
//         icon: Umbrella,
//         color: "border-slate-400",
//       },
//       {
//         label: "Annual Leave",
//         count: leaves.filter((l) =>
//           l.reason?.toLowerCase().includes("annual")
//         ).length,
//         icon: TreePalm,
//         color: "border-emerald-500",
//       },
//     ];
//   }, [leaves]);

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
//       {/* HEADER */}
//       <div className="flex justify-between items-start mb-10">
//         <div>
//           <h1 className="text-3xl font-extrabold text-[#0F172A]">
//             Leave Management
//           </h1>

//           <p className="text-sm text-slate-500 mt-1">
//             Manage leave requests and history
//           </p>
//         </div>

//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all"
//         >
//           <Plus size={18} />
//           Apply Leave
//         </button>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {leaveStats.map((stat, i) => (
//           <div
//             key={i}
//             className="bg-white border rounded-3xl p-6 shadow-sm"
//           >
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
//                 <stat.icon size={24} />
//               </div>

//               <div>
//                 <p className="text-sm text-slate-500 font-medium">
//                   {stat.label}
//                 </p>

//                 <h3 className="text-3xl font-extrabold">
//                   {stat.count}
//                 </h3>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* TABLE */}
//       <LeaveTable leaves={leaves} loading={loading} />

//       {/* MODAL */}
//       <LeaveModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSuccess={fetchLeaves}
//       />
//     </div>
//   );
// }
import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import LeaveModal from "./LeaveModel";
import LeaveStats from "./LeaveStats";
import LeaveTable from "./LeaveTable";
import useLeaves from "./leaveUtils";

export default function LeaveManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    leaves,
    stats,
    loading,
    applyLeave,
    fetchLeaves,
  } = useLeaves();

  const handleSubmit = async (formData) => {
    const success = await applyLeave(formData);

    if (success) {
      setIsModalOpen(false);
      fetchLeaves();
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-[#1F2937]">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
            Leave Management
          </h1>

          <p className="text-[#64748B] text-sm mt-1">
            Your leave history and requests
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Apply for Leave
        </button>
      </div>

      {/* STATS */}
      <LeaveStats stats={stats} />

      {/* TABLE */}
      <LeaveTable leaves={leaves} loading={loading} />

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <LeaveModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}