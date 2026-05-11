import { useState } from "react";

import TaskStats from "../../components/taskCreation/TaskStats";
import TaskGrid from "../../components/taskCreation/TaskGrid";
import CreateTaskButton from "../../components/taskCreation/CreateTaskButton.jsx";
import CreateTaskModal from "../../components/taskCreation/CreateTaskModal";

import { dummyTasks } from "../../components/taskCreation/tasks";

const AdminTaskCreation = () => {
  const [tasks, setTasks] = useState(dummyTasks);

  const [openModal, setOpenModal] =
    useState(false);

  const handleTaskClick = (task) => {
    console.log(task);
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
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
              Assign production workflow tasks to managers.
            </p>
          </div>

          <CreateTaskButton
            title="Create HR Task"
            onClick={() => setOpenModal(true)}
          />
        </div>

        {/* STATS */}
        <TaskStats tasks={tasks} />

        {/* TASK GRID */}
        <TaskGrid
          tasks={tasks}
          onTaskClick={handleTaskClick}
        />

        {/* MODAL */}
        <CreateTaskModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default AdminTaskCreation;