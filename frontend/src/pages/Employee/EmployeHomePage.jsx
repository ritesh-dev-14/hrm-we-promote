import { Calendar, FileText, DollarSign, ArrowRight } from "lucide-react";

export default function EmployeeHome() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] ">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1F2937]">
            Welcome, John!
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Software Engineer – Engineering
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          
          {/* CARD */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#6B7280]">Days Present</p>
              <h2 className="text-[28px] font-semibold text-[#111827] mt-1">20</h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
              <Calendar size={20} className="text-[#6B7280]" />
            </div>
          </div>

          {/* CARD */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#6B7280]">Pending Leaves</p>
              <h2 className="text-[28px] font-semibold text-[#111827] mt-1">2</h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
              <FileText size={20} className="text-[#6B7280]" />
            </div>
          </div>

          {/* CARD */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#6B7280]">Latest Payslip</p>
              <h2 className="text-[28px] font-semibold text-[#111827] mt-1">
                $2,000
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
              <DollarSign size={20} className="text-[#6B7280]" />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          
          {/* PRIMARY BUTTON */}
          <button className="flex items-center gap-2 px-6 h-[44px] rounded-lg text-white text-[14px] font-medium 
            bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md hover:opacity-95 transition">
            Mark Attendance
            <ArrowRight size={16} />
          </button>

          {/* SECONDARY BUTTON */}
          <button className="px-6 h-[44px] rounded-lg border border-[#D1D5DB] text-[14px] text-[#374151] bg-white hover:bg-[#F9FAFB] transition">
            Apply for Leave
          </button>
        </div>

      </div>
    </div>
  );
}