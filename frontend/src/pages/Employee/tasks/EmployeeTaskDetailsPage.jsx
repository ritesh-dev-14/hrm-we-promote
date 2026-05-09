import { useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import {
  CalendarDays,
  User2,
  CheckCircle2,
} from "lucide-react";

import { employeeTasks } from "./employeeTasks";

const EmployeeTaskDetailsPage = () => {
  const { id } = useParams();

  const task = useMemo(() => {
    return employeeTasks.find((item) => item.id === id);
  }, [id]);

  const [progress, setProgress] = useState(task?.progress || 0);

  const [status, setStatus] = useState(
    task?.status || "pending"
  );

  const [qualityNote, setQualityNote] = useState("");

  if (!task) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Task Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 lg:p-7">
      <div className="max-w-5xl mx-auto">
        {/* TOP CARD */}
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 lg:p-8 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {task.priority}
                </span>

                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold capitalize">
                  {status.replace("_", " ")}
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {task.title}
              </h1>

              <p className="mt-4 text-slate-500 leading-relaxed max-w-3xl">
                {task.description}
              </p>
            </div>
          </div>

          {/* TASK INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-500">
                  Deadline
                </span>
              </div>

              <h3 className="font-semibold text-slate-900">
                {task.deadline}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User2
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-500">
                  Assigned By
                </span>
              </div>

              <h3 className="font-semibold text-slate-900">
                {task.assignedBy.name}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-500">
                  Parent Task
                </span>
              </div>

              <h3 className="font-semibold text-slate-900">
                {task.parentTask.title}
              </h3>
            </div>
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Task Actions
          </h2>

          {/* PROGRESS */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">
                Progress
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {progress}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full accent-slate-900"
            />
          </div>

          {/* STATUS */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Update Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="pending">Pending</option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="review">Review</option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          {/* QUALITY CHECK */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Quality Check Notes
            </label>

            <textarea
              rows="6"
              value={qualityNote}
              onChange={(e) =>
                setQualityNote(e.target.value)
              }
              placeholder="Add quality notes, completion details, or important updates for manager review..."
              className="w-full rounded-3xl border border-slate-200 p-4 outline-none resize-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-semibold">
              Update Progress
            </button>

            <button className="h-12 px-6 rounded-2xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all">
              Submit For Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskDetailsPage;