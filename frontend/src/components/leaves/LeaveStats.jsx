import { Thermometer, Umbrella, TreePalm } from "lucide-react";

export default function LeaveStats({ stats }) {
  const leaveStats = [
    {
      label: "Sick Leave",
      count: stats?.sick || 0,
      icon: Thermometer,
      accentColor: "border-slate-700",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      label: "Casual Leave",
      count: stats?.casual || 0,
      icon: Umbrella,
      accentColor: "border-slate-600",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
    {
      label: "Leave Balance",
      count: stats?.annual || 0,
      icon: TreePalm,
      accentColor: "border-slate-700",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 font-sans">
      {leaveStats.map((stat, i) => (
        <div
          key={i}
          className="relative flex items-center p-5 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          {/* Vertical Accent Border */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${stat.accentColor}`}
          />

          {/* Icon Container */}
          <div
            className={`w-11 h-11 rounded-lg ${stat.iconBg} flex items-center justify-center mr-3 flex-shrink-0`}
          >
            <stat.icon size={20} className={stat.iconColor} />
          </div>

          {/* Text Content */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {stat.count}
              </span>

              <span className="text-xs text-slate-400 font-semibold uppercase tracking-tighter">
                Days
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
