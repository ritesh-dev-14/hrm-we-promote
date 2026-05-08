// import  { useState } from "react";
// import { 
//   CheckCircle2, 
//   XCircle, 
//   Clock, 
//   Calendar, 
//   Search, 
//   Filter,
// } from "lucide-react";

// const HrEmployeeLeaves = () => {
//   // Sample data following your existing "No leave applications found" structure
//   const [leaveRequests] = useState([
//     {
//       id: 1,
//       employee: "James Thomas",
//       initials: "JT",
//       type: "Sick Leave",
//       dates: "May 10 - May 12",
//       reason: "Feeling unwell, doctor recommended rest.",
//       status: "Pending"
//     },
//     {
//       id: 2,
//       employee: "Richard Robert",
//       initials: "RR",
//       type: "Annual Leave",
//       dates: "Jun 01 - Jun 15",
//       reason: "Family vacation.",
//       status: "Approved"
//     }
//   ]);

//   const stats = [
//     { label: "Pending Requests", count: 1, icon: <Clock className="text-amber-500" />, color: "border-amber-500" },
//     { label: "Approved Today", count: 0, icon: <CheckCircle2 className="text-emerald-500" />, color: "border-emerald-500" },
//     { label: "Rejected Today", count: 0, icon: <XCircle className="text-rose-500" />, color: "border-rose-500" }
//   ];

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] p-8">
//       {/* Header Section following Dashboard style */}
//       <div className="mb-10">
//         <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight">Leave Management</h1>
//         <p className="text-[#64748B] text-lg font-medium">Review and manage employee time-off requests</p>
//       </div>

//       {/* Quick Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//         {stats.map((stat, index) => (
//           <div key={index} className={`bg-white border-l-4 ${stat.color} rounded-2xl p-6 shadow-sm flex items-center justify-between`}>
//             <div>
//               <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
//               <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.count}</h3>
//             </div>
//             <div className="p-4 bg-slate-50 rounded-2xl">{stat.icon}</div>
//           </div>
//         ))}
//       </div>

//       {/* Filters & Search */}
//       <div className="flex flex-col md:flex-row gap-4 mb-8">
//         <div className="flex-1 relative group">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
//           <input 
//             type="text"
//             placeholder="Search by employee name..."
//             className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#6366F1] transition-all font-medium"
//           />
//         </div>
//         <div className="flex items-center bg-white border border-[#E2E8F0] rounded-2xl px-4 shadow-sm">
//           <Filter size={18} className="text-[#94A3B8] mr-2" />
//           <select className="py-4 outline-none text-[#1E293B] font-bold bg-transparent cursor-pointer">
//             <option>All Status</option>
//             <option>Pending</option>
//             <option>Approved</option>
//             <option>Rejected</option>
//           </select>
//         </div>
//       </div>

//       {/* Leave Table */}
//       <div className="bg-white rounded-4xl border border-[#F1F5F9] shadow-sm overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
//               <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Employee</th>
//               <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Type</th>
//               <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Dates</th>
//               <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Reason</th>
//               <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
//               <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-[#F1F5F9]">
//             {leaveRequests.length > 0 ? leaveRequests.map((req) => (
//               <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
//                 <td className="px-8 py-5">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
//                       {req.initials}
//                     </div>
//                     <span className="font-bold text-slate-900">{req.employee}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-5 font-medium text-slate-600">{req.type}</td>
//                 <td className="px-6 py-5">
//                   <div className="flex items-center gap-2 text-slate-600 font-medium">
//                     <Calendar size={14} className="text-slate-400" />
//                     {req.dates}
//                   </div>
//                 </td>
//                 <td className="px-6 py-5">
//                   <p className="text-slate-500 text-sm truncate max-w-50">{req.reason}</p>
//                 </td>
//                 <td className="px-6 py-5">
//                   <StatusBadge status={req.status} />
//                 </td>
//                 <td className="px-8 py-5 text-right">
//                   <div className="flex justify-end gap-2">
//                     <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors border border-transparent hover:border-emerald-100">
//                       <CheckCircle2 size={18} />
//                     </button>
//                     <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors border border-transparent hover:border-rose-100">
//                       <XCircle size={18} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             )) : (
//               <tr>
//                 <td colSpan="6" className="py-20 text-center text-slate-400 font-medium">
//                   No leave applications found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const StatusBadge = ({ status }) => {
//   const styles = {
//     Pending: "bg-amber-50 text-amber-600 border-amber-100",
//     Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
//     Rejected: "bg-rose-50 text-rose-600 border-rose-100"
//   };
//   return (
//     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
//       {status}
//     </span>
//   );
// };

// export default HrEmployeeLeaves;



import  { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Search, 
  Filter,
} from "lucide-react";

const HrLeaveManagement = () => {
  // Sample data following your existing "No leave applications found" structure
  const [leaveRequests] = useState([
    {
      id: 1,
      employee: "James Thomas",
      initials: "JT",
      type: "Sick Leave",
      dates: "May 10 - May 12",
      reason: "Feeling unwell, doctor recommended rest.",
      status: "Pending"
    },
    {
      id: 2,
      employee: "Richard Robert",
      initials: "RR",
      type: "Annual Leave",
      dates: "Jun 01 - Jun 15",
      reason: "Family vacation.",
      status: "Approved"
    }
  ]);

  const stats = [
    { label: "Pending Requests", count: 1, icon: <Clock className="text-amber-500" />, color: "border-amber-500" },
    { label: "Approved Today", count: 0, icon: <CheckCircle2 className="text-emerald-500" />, color: "border-emerald-500" },
    { label: "Rejected Today", count: 0, icon: <XCircle className="text-rose-500" />, color: "border-rose-500" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      {/* Header Section following Dashboard style */}
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight">Leave Management</h1>
        <p className="text-[#64748B] text-lg font-medium">Review and manage employee time-off requests</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white border-l-4 ${stat.color} rounded-2xl p-6 shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.count}</h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
          <input 
            type="text"
            placeholder="Search by employee name..."
            className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#6366F1] transition-all font-medium"
          />
        </div>
        <div className="flex items-center bg-white border border-[#E2E8F0] rounded-2xl px-4 shadow-sm">
          <Filter size={18} className="text-[#94A3B8] mr-2" />
          <select className="py-4 outline-none text-[#1E293B] font-bold bg-transparent cursor-pointer">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-4xl border border-[#F1F5F9] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Employee</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Type</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Dates</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Reason</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {leaveRequests.length > 0 ? leaveRequests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {req.initials}
                    </div>
                    <span className="font-bold text-slate-900">{req.employee}</span>
                  </div>
                </td>
                <td className="px-6 py-5 font-medium text-slate-600">{req.type}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {req.dates}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-slate-500 text-sm truncate max-w-50">{req.reason}</p>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors border border-transparent hover:border-emerald-100">
                      <CheckCircle2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors border border-transparent hover:border-rose-100">
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-20 text-center text-slate-400 font-medium">
                  No leave applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Rejected: "bg-rose-50 text-rose-600 border-rose-100"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default HrLeaveManagement;