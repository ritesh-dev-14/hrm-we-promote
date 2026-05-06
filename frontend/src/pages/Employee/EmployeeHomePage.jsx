import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, DollarSign, ArrowRight } from "lucide-react";

const EmployeeHomePage = () => {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Days Present",
      value: "20",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Leaves",
      value: "2",
      icon: FileText,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Latest Payslip",
      value: "₹12,000",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-6 ">
      <div className="max-w-6xl ">
        
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, Ritesh!
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Web Developer <span className="mx-2 text-gray-300">|</span> IT Department
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </h2>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            <p className="text-gray-500 text-sm">Manage your attendance and time-off requests.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/employee/attendance')}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              Mark Attendance
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-95">
              Apply for Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHomePage;