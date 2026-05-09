import { useState } from "react";

import TaskStats from "../../components/taskCreation/TaskStats";
import TaskGrid from "../../components/taskCreation/TaskGrid";
import CreateTaskButton from "../../components/taskCreation/CreateTaskButton";

import { dummyTasks } from "../../components/taskCreation/tasks";

const AdminTaskCreation = () => {
  const [tasks, setTasks] = useState(dummyTasks);

  const handleCreateTask = () => {
    console.log("Create Task");
  };

  const handleTaskClick = (task) => {
    console.log(task);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 lg:p-7">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Admin Tasks
            </h1>

            <p className="text-slate-500 mt-2">
              Create and manage company workflow tasks.
            </p>
          </div>

          <CreateTaskButton
            title="Create Task"
            onClick={handleCreateTask}
          />
        </div>

        {/* STATS */}
        <TaskStats tasks={tasks} />

        {/* TASK GRID */}
        <TaskGrid
          tasks={tasks}
          onTaskClick={handleTaskClick}
        />
      </div>
    </div>
  );
};

export default AdminTaskCreation;