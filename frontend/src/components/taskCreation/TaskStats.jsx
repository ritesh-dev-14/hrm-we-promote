import {
  BriefcaseBusiness,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const TaskStats = ({ tasks = [] }) => {
  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: BriefcaseBusiness,
    },
    {
      title: "Pending",
      value: pendingTasks,
      icon: Clock3,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <item.icon
                size={22}
                className="text-slate-700"
              />
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-1">
            {item.title}
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;