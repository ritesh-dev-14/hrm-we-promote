import TaskCard from "./TaskCard";
import {
  Loader2,
  ClipboardList,
} from "lucide-react";

const TaskGrid = ({
  tasks = [],
  loading = false,
  onTaskClick,
}) => {

  // LOADING STATE
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[420px] flex flex-col items-center justify-center">

        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <Loader2
            size={30}
            className="animate-spin text-slate-500"
          />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          Loading Tasks
        </h3>

        <p className="text-sm text-slate-500">
          Please wait while we fetch tasks...
        </p>
      </div>
    );
  }

  // EMPTY STATE
  if (!tasks?.length) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm min-h-[420px] flex flex-col items-center justify-center px-6 text-center">

        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <ClipboardList
            size={28}
            className="text-slate-400"
          />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          No Tasks Yet
        </h2>

        <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed">
          Start by creating a new task and assign work to employees or managers.
        </p>
      </div>
    );
  }

  // TASK GRID
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <TaskCard
            task={task}
            onClick={() =>
              onTaskClick?.(task)
            }
          />
        </div>
      ))}
    </div>
  );
};

export default TaskGrid;