import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import LeaveModal from "./LeaveModel";
import LeaveStats from "./LeaveStats";
import LeaveTable from "./LeaveTable";
import useLeaves from "./leaveUtils";

export default function LeaveManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { leaves, stats, loading, applyLeave, fetchLeaves } = useLeaves();

  const handleSubmit = async (formData) => {
    const success = await applyLeave(formData);

    if (success) {
      setIsModalOpen(false);
      fetchLeaves();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#0F172A]">
            Leave Management
          </h1>

          <p className="text-slate-500 text-xs lg:text-sm mt-1">
            Your leave history and requests
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          Apply Leave
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
