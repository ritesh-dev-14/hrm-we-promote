import {
  Thermometer,
  Umbrella,
  TreePalm,
} from "lucide-react";

export default function LeaveStats({ stats }) {
  const leaveStats = [
    {
      label: "Sick Leave",
      count: stats?.sick || 0,
      icon: Thermometer,
      // Using professional indigo/slate tones for your project
      accentColor: "border-rose-500", 
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600"
    },
    {
      label: "Casual Leave",
      count: stats?.casual || 0,
      icon: Umbrella,
      accentColor: "border-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      label: "Annual Leave",
      count: stats?.annual || 0,
      icon: TreePalm,
      accentColor: "border-indigo-500",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-sans">
      {leaveStats.map((stat, i) => (
        <div
          key={i}
          className="relative flex items-center p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          {/* Vertical Accent Border */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-[4px] ${stat.accentColor} border-l-[4px]`}
          />

          {/* Icon Container */}
          <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mr-4`}>
            <stat.icon size={22} className={stat.iconColor} />
          </div>

          {/* Text Content */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-black text-[#0F172A] tracking-tight">
                {stat.count}
              </span>

              <span className="text-[12px] text-slate-400 font-bold uppercase tracking-tighter">
                Days Taken
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}