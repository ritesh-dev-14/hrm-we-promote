// // ManagerTaskPage.jsx

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   ClipboardList,
//   Plus,
//   ArrowRight,
//   Loader2,
//   CalendarDays,
//   User2,
//   Link2,
//   CheckCircle2,
// } from "lucide-react";

// import TaskStats from "../../components/taskCreation/TaskStats";
// import TaskGrid from "../../components/taskCreation/TaskGrid";
// import CreateTaskButton from "../../components/taskCreation/CreateTaskButton";
// import CreateTaskModal from "../../components/taskCreation/CreateTaskModal";

// import { fetchAllTasks } from "../../components/taskCreation/tasks";

// import API from "../../services/api";

// const statusStyles = {
//   DRAFT: "bg-slate-100 text-slate-700",
//   ASSIGNED: "bg-blue-100 text-blue-700",
//   COMPLETED: "bg-emerald-100 text-emerald-700",
//   PENDING: "bg-orange-100 text-orange-700",
// };

// const ManagerTaskPage = () => {
//   const [tasks, setTasks] = useState([]);
//   const [assignedTasks, setAssignedTasks] = useState([]);

//   const [isLoading, setIsLoading] = useState(true);

//   const [openModal, setOpenModal] = useState(false);

//   const navigate = useNavigate();

//   const loadData = async () => {
//     try {
//       setIsLoading(true);

//       const [createdTasks, assignedResponse] = await Promise.all([
//         fetchAllTasks(),
//         API.get("/api/manager/tasks"),
//       ]);

//       setTasks(createdTasks || []);

//       setAssignedTasks(assignedResponse?.data?.data || []);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleTaskClick = (task) => {
//     navigate(`/manager/tasks/${task.id}`);
//   };

//   const handleTaskCreated = (newTask) => {
//     setTasks((prev) => [newTask, ...prev]);
//   };

//   return (
//     <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
//           <div>
//             <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
//               Manager Tasks
//             </h1>

//             <p className="text-slate-500 mt-2 text-sm md:text-base">
//               Manage assigned workflow and employee tasks.
//             </p>
//           </div>

//           <CreateTaskButton
//             title="Create Project"
//             onClick={() => setOpenModal(true)}
//           />
//         </div>

//         {/* STATS */}
//         <TaskStats tasks={tasks} />

//         {/* ASSIGNED TASKS */}
//         <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
//           <div className="flex items-center gap-3 mb-6">
//             <CheckCircle2 size={22} />

//             <div>
//               <h2 className="text-xl font-bold">My Assigned Tasks</h2>

//               <p className="text-sm text-gray-500">Tasks assigned to you</p>
//             </div>
//           </div>

//           {assignedTasks.length > 0 ? (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//               {assignedTasks.map((item) => {
//                 const task = item.task;

//                 return (
//                   <div
//                     key={item.assignmentId}
//                     className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
//                   >
//                     {/* TOP */}
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <h3 className="text-2xl font-bold text-gray-900">
//                           {task.title}
//                         </h3>

//                         <p className="text-sm text-gray-500 mt-2 leading-6">
//                           {task.description}
//                         </p>
//                       </div>

//                       <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold whitespace-nowrap">
//                         {item.status}
//                       </span>
//                     </div>

//                     {/* MAIN INFO */}
//                     <div className="grid grid-cols-2 gap-4 mt-6">
//                       <div className="bg-white border rounded-xl p-4">
//                         <p className="text-xs text-gray-500 mb-1">Setup Type</p>

//                         <p className="font-bold text-black">{task.setupType}</p>
//                       </div>

//                       <div className="bg-white border rounded-xl p-4">
//                         <p className="text-xs text-gray-500 mb-1">Location</p>

//                         <p className="font-semibold text-gray-800">
//                           {task.location}
//                         </p>
//                       </div>

//                       <div className="bg-white border rounded-xl p-4">
//                         <p className="text-xs text-gray-500 mb-1">Due Date</p>

//                         <p className="font-semibold text-gray-800">
//                           {new Date(task.date).toLocaleDateString()}
//                         </p>
//                       </div>

//                       <div className="bg-white border rounded-xl p-4">
//                         <p className="text-xs text-gray-500 mb-1">
//                           Task Status
//                         </p>

//                         <p className="font-semibold text-gray-800">
//                           {task.status}
//                         </p>
//                       </div>
//                     </div>

//                     {/* INSTRUCTIONS */}
//                     {task.instructions && (
//                       <div className="mt-5 bg-white border rounded-xl p-4">
//                         <p className="text-xs text-gray-500 mb-2">
//                           Instructions
//                         </p>

//                         <p className="text-sm text-gray-700 leading-6">
//                           {task.instructions}
//                         </p>
//                       </div>
//                     )}

//                     {/* CREATED BY */}
//                     <div className="mt-5 flex items-center justify-between border-t pt-4">
//                       <div>
//                         <p className="text-xs text-gray-500">Assigned By</p>

//                         <p className="font-semibold text-gray-900">
//                           {task.createdBy?.name}
//                         </p>

//                         <p className="text-xs text-gray-500 mt-1">
//                           {task.createdBy?.employeeId}
//                         </p>
//                       </div>

//                     </div>

//                     {/* LINK */}
//                     {task.referenceLink && (
//                       <a
//                         href={task.referenceLink}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600"
//                       >
//                         <Link2 size={16} />
//                         Open Reference Link
//                       </a>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="border border-dashed rounded-xl p-10 text-center">
//               <ClipboardList size={34} className="mx-auto text-gray-400 mb-3" />

//               <h3 className="font-semibold">No Assigned Tasks</h3>

//               <p className="text-sm text-gray-500 mt-1">
//                 No tasks assigned yet
//               </p>
//             </div>
//           )}
//         </div>

//         {/* CREATED TASKS */}
//         <div className="mt-12">
//           <div className="mb-6">
//             <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
//               Created By Me
//             </h2>

//             <p className="text-sm text-slate-500 mt-1">
//               Tasks created for employees and teams
//             </p>
//           </div>

//           <TaskGrid
//             tasks={tasks}
//             loading={isLoading}
//             onTaskClick={handleTaskClick}
//           />
//         </div>

//         {/* MODAL */}
//         <CreateTaskModal
//           open={openModal}
//           onClose={() => setOpenModal(false)}
//           onTaskCreated={handleTaskCreated}
//         />
//       </div>
//     </div>
//   );
// };

// export default ManagerTaskPage;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  Plus,
  Loader2,
  CalendarDays,
  User2,
  CheckCircle2,
} from "lucide-react";

import TaskStats from "../../components/taskCreation/TaskStats";
import TaskGrid from "../../components/taskCreation/TaskGrid";
import CreateTaskButton from "../../components/taskCreation/CreateTaskButton";
import CreateTaskModal from "../../components/taskCreation/CreateTaskModal";

import API from "../../services/api";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-orange-50 text-orange-700 border-orange-200",
};

const ManagerTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get("/api/manager/tasks");

      // Sync tasks array directly from api schema data payload
      const fetchedTasks = response?.data?.data || [];
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching manager tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskClick = (task) => {
    navigate(`/manager/tasks/${task.id}`);
  };

  // Prepend newly created records to local view state seamlessly
  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Helper calculation helper to turn ISO string into clean UI reader formats
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-7">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Manager Tasks
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Manage assigned workflow and project scope allocations.
            </p>
          </div>

          <CreateTaskButton
            title="Create Project"
            onClick={() => setOpenModal(true)}
          />
        </div>

        {/* STATS PANELS */}
        <TaskStats tasks={tasks} />

        {/* ALL PROJECTS SECTION */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 mt-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Active Task Matrix
              </h2>
              <p className="text-sm text-gray-500">
                Overview of all operational tasks
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2 className="animate-spin text-black" size={28} />
              <p className="text-xs font-medium">
                Fetching active task schemas...
              </p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="group border border-gray-200 rounded-2xl p-5 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* TOP IDENTITY SEGMENT */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                          {task.projectName}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border tracking-wide uppercase whitespace-nowrap ${statusStyles[task.status] || statusStyles.DRAFT}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* METRIC TIMELINE MODULES */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                          <CalendarDays size={14} />
                          <span className="text-[11px] font-bold tracking-wider uppercase">
                            Start Date
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(task.startDate)}
                        </p>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                          <CalendarDays size={14} />
                          <span className="text-[11px] font-bold tracking-wider uppercase">
                            End Date
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(task.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNTABILITY FOOTER */}
                  {task.createdBy && (
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        <User2 size={14} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          Owner / Creator
                        </p>
                        <p className="text-xs font-semibold text-gray-800">
                          {task.createdBy.name}{" "}
                          <span className="text-gray-400 font-normal">
                            ({task.createdBy.employeeId})
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <ClipboardList size={38} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-800 text-lg">
                No Active Tasks Records
              </h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                No active projects or tasks were detected for your account
                management layer.
              </p>
            </div>
          )}
        </div>

        {/* CREATION LAYER MODAL */}
        <CreateTaskModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default ManagerTaskPage;
