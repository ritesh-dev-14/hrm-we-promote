import { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Send,
} from "lucide-react";

import { motion } from "framer-motion";

export default function LeaveModal({
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />

      {/* MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Apply for Leave
              </h2>

              <p className="text-sm text-[#64748B] mt-1">
                Submit your leave request for approval
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#64748B]"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* DATES */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-2 text-[13px] font-bold text-[#475569] uppercase tracking-wide">
                <CalendarIcon
                  size={14}
                  className="text-slate-400"
                />

                Duration
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1 ml-1">
                  From
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1 ml-1">
                  To
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm"
                />
              </div>
            </div>

            {/* REASON */}
            <div>
              <label className="block text-[13px] font-bold text-[#475569] mb-2 uppercase tracking-wide">
                Reason
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                placeholder="Briefly describe why you need this leave..."
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm h-28 resize-none"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#475569] font-bold rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] py-3"
              >
                <Send size={16} />

                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}