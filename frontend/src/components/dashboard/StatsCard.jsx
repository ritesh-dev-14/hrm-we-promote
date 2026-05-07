export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative overflow-hidden bg-white p-6 rounded-[28px] border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500"
        >
          <div
            className={`absolute inset-0 bg-linear-to-br ${stat.accent} pointer-events-none`}
          />

          <div className="relative flex items-start justify-between mb-5">
            <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <stat.icon size={18} className={stat.iconColor} />
            </div>

            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              Monthly
            </span>
          </div>

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              {stat.label}
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
              {stat.value}
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full w-2/3 ${stat.progress} rounded-full`}
                />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                66%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}