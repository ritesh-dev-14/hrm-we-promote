import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ClipboardList, CheckCircle2, Flame, FolderGit, Users } from "lucide-react";

import AttendanceCard from "../../components/attendece/AttendenceCard";
import DashboardHero from "../../components/dashboard/DashBoardHero";
import QuickActions from "../../components/dashboard/QuickActions";
import StatsCards from "../../components/dashboard/StatsCard";

import { employeeActions } from "../../components/dashboard/dashboardData.js";
import API from "../../services/api";

const ManagerHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || { name: "Manager" };
  const firstName = user.name.split(" ")[0];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await API.get("/api/manager/dashboard");
        
        if (response?.data?.success) {
          const apiData = response.data.data;

          // Transform backend schema into the structural array format your UI expects
          const transformedStats = [
            {
              title: "Total Tasks",
              value: apiData.totalTasks || 0,
              icon: ClipboardList,
              variant: "slate",
            },
            {
              title: "Completed",
              value: apiData.completedTasks || 0,
              icon: CheckCircle2,
              variant: "emerald",
            },
            {
              title: "Active Tracks",
              value: apiData.inProgressTasks || 0,
              icon: Flame,
              variant: "blue",
            },
            {
              title: "Draft Boards",
              value: apiData.draftTasks || 0,
              icon: FolderGit,
              variant: "orange",
            },
            {
              title: "Managed Roster",
              value: apiData.totalEmployees || 0,
              icon: Users,
              variant: "purple",
            },
          ];

          setStats(transformedStats);
        }
      } catch (error) {
        console.error("Error loading manager dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HERO HEADER */}
        <DashboardHero
          name={firstName}
          title="Welcome back"
          description="Here's an overview of your team metrics, active project scope allocations, and tracking statistics."
          buttonText="Open Attendance"
          onClick={() => navigate("/attendance")}
        />

{loading ? (
          <div className="w-full bg-white border border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-400 gap-2 shadow-sm">
            <Loader2 className="animate-spin text-black" size={24} />
            <p className="text-xs font-bold tracking-wide uppercase text-gray-400">Syncing Matrix Metrics...</p>
          </div>
        ) : (
          <StatsCards stats={stats} />
        )}
        {/* ATTENDANCE AND QUICK ACTIONS LAYOUT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-6">
          <div className="xl:col-span-7">
            <div className="bg-white border border-slate-200 rounded-4xl p-6 h-full shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <AttendanceCard />
            </div>
          </div>

          <QuickActions actions={employeeActions} />
        </div>

        {/* DYNAMIC STATS RENDERING LAYER */}
        
        
      </div>
    </div>
  );
};

export default ManagerHomePage;