import React from "react";
import { 
  Users, 
  Building2, 
  Calendar, 
  FileText 
} from "lucide-react";

/**
 * Pixel-Perfect Admin Dashboard
 * Based on HRMS visual guidelines.
 */
const AdminDashboard = () => {
  const stats = [
    { title: "Total Employees", value: "5", icon: Users },
    { title: "Departments", value: "10", icon: Building2 },
    { title: "Today's Attendance", value: "0", icon: Calendar },
    { title: "Pending Leaves", value: "0", icon: FileText },
  ];

  return (
    // Changed py-16 to responsive padding to avoid mobile clipping
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-8 lg:p-12 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 lg:mb-12">
          <h1 className="text-2xl lg:text-[28px] font-bold text-[#0F172A] tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm lg:text-base">
            Welcome back, Admin — here's your overview
          </p>
        </header>

        {/* Stats Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-200"
            >
              {/* Left Accent Bar - Matching HR design */}
              <div className="absolute left-0 top-[25%] bottom-[25%] w-[4px] bg-slate-200 rounded-r-full group-hover:bg-indigo-500 transition-all duration-300" />
              
              <div className="pl-3">
                <p className="text-slate-500 text-xs lg:text-sm font-bold uppercase tracking-wider mb-2">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A]">
                    {stat.value}
                  </h3>
                </div>
              </div>

              {/* Icon Container with dynamic interaction */}
              <div className="relative">
                {/* Subtle pulse effect on hover */}
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-2xl scale-150 transition-all duration-500" />
                
                <div className="relative p-3.5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                  <stat.icon size={28} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for future charts/content to maintain layout balance */}
        <div className="mt-12 grid grid-cols-1 gap-6">
           <div className="h-[400px] w-full border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-center text-slate-400 font-medium italic">
             Overview charts and recent activity will appear here...
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;