import React, { useState } from "react";
import { Users, Building2, Calendar, FileText, Plus } from "lucide-react";
import HrAddEmployee from "./HrAddEmployee";

/**
 * HR Dashboard with employee management
 */
const HrHomePage = () => {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  const stats = [
    { title: "Total Employees", value: "5", icon: Users },
    { title: "Departments", value: "10", icon: Building2 },
    { title: "Today's Attendance", value: "0", icon: Calendar },
    { title: "Pending Leaves", value: "0", icon: FileText },
  ];

  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  return (
    // Changed py-16 to responsive padding to avoid mobile clipping
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6 lg:px-6 lg:py-8 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section with Add Button */}
        <header className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-[#0F172A] tracking-tight">
              HR Dashboard
            </h1>
            <p className="text-slate-500 font-medium mt-0.5 text-xs lg:text-sm">
              Manage employees and team operations
            </p>
          </div>
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </header>

        {/* Stats Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-200"
            >
              {/* Left Accent Bar - Matching HR design */}
              <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] bg-slate-200 rounded-r-full group-hover:bg-slate-700 transition-all duration-300" />

              <div className="pl-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">
                    {stat.value}
                  </h3>
                </div>
              </div>

              {/* Icon Container with dynamic interaction */}
              <div className="relative">
                {/* Subtle pulse effect on hover */}
                <div className="absolute inset-0 bg-slate-500/0 group-hover:bg-slate-500/5 rounded-2xl scale-150 transition-all duration-500" />

                <div className="relative p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-100 group-hover:text-slate-600 transition-all duration-300">
                  <stat.icon size={22} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Employee Modal */}
        <HrAddEmployee
          isOpen={isAddEmployeeOpen}
          onClose={() => setIsAddEmployeeOpen(false)}
          onSave={handleAddEmployee}
        />

        {/* Placeholder for future content */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="h-[300px] w-full border-2 border-dashed border-slate-200 rounded-[20px] flex items-center justify-center text-slate-400 font-medium text-sm">
            Employee list and recent activity will appear here...
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrHomePage;
