import TaskCard from "./TaskCard";

const TaskGrid = ({
  tasks = [],
  onTaskClick,
}) => {
  if (!tasks.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-14 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No Tasks Found
        </h3>

        <p className="text-slate-500 text-sm">
          Create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={onTaskClick}
        />
      ))}
    </div>
  );
};

export default TaskGrid;