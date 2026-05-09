import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TaskStats from "../../components/taskCreation/TaskStats";
import TaskGrid from "../../components/taskCreation/TaskGrid";

import { managerTasks } from "./tasks/managerTask";

const ManagerTaskPage = () => {
  const [tasks] = useState(managerTasks);

  const navigate = useNavigate();

  const handleTaskClick = (task) => {
    navigate(`/manager/tasks/${task.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 lg:p-7">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Assigned Tasks
          </h1>

          <p className="text-slate-500 mt-2">
            Manage team workflow and assign subtasks to employees.
          </p>
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

export default ManagerTaskPage;