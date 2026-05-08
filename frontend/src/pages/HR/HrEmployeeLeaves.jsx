// import { useEffect, useMemo, useState } from "react";
// import {
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Calendar,
//   Search,
//   Filter,
// } from "lucide-react";

// import API from "../../services/api";

// const HrLeaveManagement = () => {
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");

//   // FETCH LEAVES
//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);

//       const res = await API.get("/api/hr/leaves");

//       setLeaveRequests(res.data?.data || []);
//     } catch (err) {
//       console.error(
//         "Error fetching HR leaves:",
//         err?.response?.data || err.message,
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // APPROVE / REJECT
//   const updateLeaveStatus = async (
//     leaveId,
//     status,
//     reviewNote = "",
//   ) => {
//     try {
//       const payload =
//         status === "REJECTED"
//           ? {
//               status,
//               reviewNote,
//             }
//           : {
//               status,
//             };

//       await API.put(`/api/hr/leave/${leaveId}`, payload);

//       setLeaveRequests((prev) =>
//         prev.map((leave) =>
//           leave.id === leaveId
//             ? {
//                 ...leave,
//                 status,
//                 reviewNote,
//               }
//             : leave,
//         ),
//       );
//     } catch (err) {
//       console.error(
//         "Error updating leave:",
//         err?.response?.data || err.message,
//       );
//     }
//   };

//   // APPROVE
//   const handleApprove = async (leaveId) => {
//     await updateLeaveStatus(leaveId, "APPROVED");
//   };

//   // REJECT
//   const handleReject = async (leaveId) => {
//     const note = prompt("Enter rejection reason");

//     if (!note || note.trim().length < 3) {
//       return alert("Rejection reason is required");
//     }

//     await updateLeaveStatus(
//       leaveId,
//       "REJECTED",
//       note,
//     );
//   };

//   // FILTERED DATA
//   const filteredLeaves = useMemo(() => {
//     return leaveRequests.filter((leave) => {
//       const matchesSearch =
//         leave.user?.name
//           ?.toLowerCase()
//           .includes(search.toLowerCase()) ||
//         leave.user?.employeeId
//           ?.toLowerCase()
//           .includes(search.toLowerCase());

//       const matchesStatus =
//         statusFilter === "ALL"
//           ? true
//           : leave.status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });
//   }, [leaveRequests, search, statusFilter]);

//   // STATS
//   const stats = useMemo(() => {
//     return {
//       pending: leaveRequests.filter(
//         (l) => l.status === "PENDING",
//       ).length,

//       approved: leaveRequests.filter(
//         (l) => l.status === "APPROVED",
//       ).length,

//       rejected: leaveRequests.filter(
//         (l) => l.status === "REJECTED",
//       ).length,
//     };
//   }, [leaveRequests]);

//   const statCards = [
//     {
//       label: "Pending Requests",
//       count: stats.pending,
//       icon: (
//         <Clock className="text-amber-500" />
//       ),
//       color: "border-amber-500",
//     },
//     {
//       label: "Approved Leaves",
//       count: stats.approved,
//       icon: (
//         <CheckCircle2 className="text-emerald-500" />
//       ),
//       color: "border-emerald-500",
//     },
//     {
//       label: "Rejected Leaves",
//       count: stats.rejected,
//       icon: (
//         <XCircle className="text-rose-500" />
//       ),
//       color: "border-rose-500",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
//       {/* HEADER */}
//       <div className="mb-10">
//         <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F172A] tracking-tight">
//           Leave Management
//         </h1>

//         <p className="text-[#64748B] text-sm md:text-base font-medium mt-1">
//           Review and manage employee time-off
//           requests
//         </p>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {statCards.map((stat, index) => (
//           <div
//             key={index}
//             className={`bg-white border-l-4 ${stat.color} rounded-2xl p-6 shadow-sm flex items-center justify-between`}
//           >
//             <div>
//               <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
//                 {stat.label}
//               </p>

//               <h3 className="text-3xl font-black text-slate-900 mt-1">
//                 {stat.count}
//               </h3>
//             </div>

//             <div className="p-4 bg-slate-50 rounded-2xl">
//               {stat.icon}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* FILTERS */}
//       <div className="flex flex-col md:flex-row gap-4 mb-8">
//         {/* SEARCH */}
//         <div className="flex-1 relative">
//           <Search
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
//             size={20}
//           />

//           <input
//             type="text"
//             placeholder="Search by employee name or ID..."
//             value={search}
//             onChange={(e) =>
//               setSearch(e.target.value)
//             }
//             className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#6366F1] transition-all font-medium"
//           />
//         </div>

//         {/* FILTER */}
//         <div className="relative min-w-[200px] group">
//   {/* Left Icon (Optional, helps professional look) */}
//   <Filter 
//     size={16} 
//     className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" 
//   />

//   <select
//     value={statusFilter}
//     onChange={(e) => setStatusFilter(e.target.value)}
//     className="w-full appearance-none bg-white border border-slate-100 rounded-[22px] py-4 pl-12 pr-12 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-700 shadow-sm cursor-pointer hover:border-slate-200"
//   >
//     <option value="ALL">All Status</option>
//     <option value="PENDING">Pending Requests</option>
//     <option value="APPROVED">Approved Only</option>
//     <option value="REJECTED">Rejected Only</option>
//   </select>

//   {/* Custom Chevron (Standard browser arrows look cheap) */}
//   <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//     <svg 
//       width="12" 
//       height="12" 
//       viewBox="0 0 24 24" 
//       fill="none" 
//       stroke="currentColor" 
//       strokeWidth="3" 
//       strokeLinecap="round" 
//       strokeLinejoin="round"
//     >
//       <path d="m6 9 6 6 6-6"/>
//     </svg>
//   </div>
// </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-white rounded-[28px] border border-[#F1F5F9] shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
//                 <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Employee
//                 </th>

//                 <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Type
//                 </th>

//                 <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Dates
//                 </th>

//                 <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Reason
//                 </th>

//                 <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Status
//                 </th>

//                 <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">
//                   Actions
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-[#F1F5F9]">
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="py-20 text-center"
//                   >
//                     <div className="flex flex-col items-center gap-3">
//                       <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />

//                       <p className="text-slate-400 text-sm font-medium">
//                         Loading leave requests...
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredLeaves.length > 0 ? (
//                 filteredLeaves.map((req) => (
//                   <tr
//                     key={req.id}
//                     className="hover:bg-slate-50/50 transition-colors"
//                   >
//                     {/* EMPLOYEE */}
//                     <td className="px-8 py-5">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
//                           {req.user?.name
//                             ?.split(" ")
//                             ?.map((n) => n[0])
//                             ?.join("")
//                             ?.slice(0, 2) || "NA"}
//                         </div>

//                         <div>
//                           <p className="font-bold text-slate-900">
//                             {req.user?.name}
//                           </p>

//                           <p className="text-xs text-slate-500 mt-0.5">
//                             {req.user?.employeeId}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* TYPE */}
//                     <td className="px-6 py-5">
//                       <span className="font-semibold text-slate-700">
//                         {req.type === "CASUAL"
//                           ? "Casual Leave"
//                           : "Sick Leave"}
//                       </span>
//                     </td>

//                     {/* DATES */}
//                     <td className="px-6 py-5">
//                       <div className="flex items-center gap-2 text-slate-600 font-medium">
//                         <Calendar
//                           size={14}
//                           className="text-slate-400"
//                         />

//                         <div className="flex flex-col">
//                           <span>
//                             {new Date(
//                               req.startDate,
//                             ).toLocaleDateString(
//                               "en-US",
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                               },
//                             )}
//                           </span>

//                           <span className="text-xs text-slate-400">
//                             to{" "}
//                             {new Date(
//                               req.endDate,
//                             ).toLocaleDateString(
//                               "en-US",
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                               },
//                             )}
//                           </span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* REASON */}
//                     <td className="px-6 py-5">
//                       <div className="max-w-[260px]">
//                         <p className="text-slate-600 text-sm line-clamp-2">
//                           {req.reason}
//                         </p>

//                         {req.reviewNote && (
//                           <p className="text-rose-500 text-xs mt-1">
//                             Note:{" "}
//                             {req.reviewNote}
//                           </p>
//                         )}
//                       </div>
//                     </td>

//                     {/* STATUS */}
//                     <td className="px-6 py-5">
//                       <StatusBadge
//                         status={req.status}
//                       />
//                     </td>

//                     {/* ACTIONS */}
//                     <td className="px-8 py-5 text-right">
//                       {req.status ===
//                       "PENDING" ? (
//                         <div className="flex justify-end gap-2">
//                           <button
//                             onClick={() =>
//                               handleApprove(
//                                 req.id,
//                               )
//                             }
//                             className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors border border-transparent hover:border-emerald-100"
//                           >
//                             <CheckCircle2
//                               size={18}
//                             />
//                           </button>

//                           <button
//                             onClick={() =>
//                               handleReject(
//                                 req.id,
//                               )
//                             }
//                             className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors border border-transparent hover:border-rose-100"
//                           >
//                             <XCircle
//                               size={18}
//                             />
//                           </button>
//                         </div>
//                       ) : (
//                         <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
//                           Reviewed
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="py-20 text-center text-slate-400 font-medium"
//                   >
//                     No leave applications found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatusBadge = ({ status }) => {
//   const styles = {
//     PENDING:
//       "bg-amber-50 text-amber-600 border-amber-100",
//     APPROVED:
//       "bg-emerald-50 text-emerald-600 border-emerald-100",
//     REJECTED:
//       "bg-rose-50 text-rose-600 border-rose-100",
//   };

//   return (
//     <span
//       className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}
//     >
//       {status}
//     </span>
//   );
// };

// export default HrLeaveManagement;

import { useEffect, useMemo, useState, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// --- CUSTOM DROPDOWN COMPONENT ---
const CustomStatusFilter = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const options = [
    { label: "All Status", value: "ALL" },
    { label: "Pending Requests", value: "PENDING" },
    { label: "Approved Only", value: "APPROVED" },
    { label: "Rejected Only", value: "REJECTED" },
  ];

  const currentLabel = options.find((opt) => opt.value === value)?.label;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[220px]" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-[22px] py-4 px-6 outline-none transition-all duration-300 shadow-sm
          ${isOpen ? "border-indigo-500 ring-4 ring-indigo-500/5" : "border-slate-100 hover:border-slate-200"}`}
      >
        <div className="flex items-center gap-3">
          <Filter size={18} className={isOpen ? "text-indigo-600" : "text-slate-400"} />
          <span className="font-bold text-slate-700 tracking-tight">{currentLabel}</span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 w-full bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-[26px] shadow-2xl overflow-hidden p-2 mt-1"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-[18px] text-sm font-semibold transition-all
                  ${value === opt.value 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                {opt.label}
                {value === opt.value && <Check size={16} strokeWidth={3} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const HrLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/hr/leaves");
      setLeaveRequests(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching HR leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const updateLeaveStatus = async (leaveId, status, reviewNote = "") => {
    try {
      const payload = status === "REJECTED" ? { status, reviewNote } : { status };
      await API.put(`/api/hr/leave/${leaveId}`, payload);
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, status, reviewNote } : l))
      );
    } catch (err) { console.error(err); }
  };

  const handleApprove = (id) => updateLeaveStatus(id, "APPROVED");
  const handleReject = (id) => {
    const note = prompt("Enter rejection reason");
    if (note?.trim().length >= 3) updateLeaveStatus(id, "REJECTED", note);
  };

  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((leave) => {
      const matchesSearch = leave.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
                           leave.user?.employeeId?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" ? true : leave.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, search, statusFilter]);

  const stats = useMemo(() => ({
    pending: leaveRequests.filter((l) => l.status === "PENDING").length,
    approved: leaveRequests.filter((l) => l.status === "APPROVED").length,
    rejected: leaveRequests.filter((l) => l.status === "REJECTED").length,
  }), [leaveRequests]);

  const statCards = [
    { label: "Pending Requests", count: stats.pending, icon: <Clock />, theme: "amber" },
    { label: "Approved Leaves", count: stats.approved, icon: <CheckCircle2 />, theme: "emerald" },
    { label: "Rejected Leaves", count: stats.rejected, icon: <XCircle />, theme: "rose" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage employee time-off requests</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {statCards.map((stat, i) => (
            <div key={i} className="group bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-bold text-slate-900 tracking-tighter">{stat.count}</h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform
                  ${stat.theme === 'amber' ? 'bg-amber-50 text-amber-500' : 
                    stat.theme === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[22px] py-5 pl-14 pr-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-semibold text-slate-700 shadow-sm"
            />
          </div>
          <CustomStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Employee</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Duration</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="4" className="py-24 text-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-10 py-6 font-bold text-slate-900">{req.user?.name}</td>
                    <td className="px-6 py-6 text-sm font-medium text-slate-500">
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-6"><StatusBadge status={req.status} /></td>
                    <td className="px-10 py-6 text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleApprove(req.id)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"><CheckCircle2 size={18} /></button>
                          <button onClick={() => handleReject(req.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"><XCircle size={18} /></button>
                        </div>
                      ) : <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Processed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>{status}</span>;
};

export default HrLeaveManagement;