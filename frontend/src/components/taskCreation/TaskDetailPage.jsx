import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  ClipboardList,
} from "lucide-react";
import { fetchTaskById } from "./taskDetails";

/**
 * Unified Task Detail Page Component
 * Works for all roles: ADMIN, HR, MANAGER, EMPLOYEE
 * Supports both API-fetched data and locally-passed data
 */
const TaskDetailPage = ({ initialData = null, apiEndpoint = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const statusStyles = {
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  };

  useEffect(() => {
    // If data is provided as prop, don't fetch from API
    if (initialData) {
      setTask(initialData);
      setLoading(false);
      return;
    }

    // Fetch from API if ID is provided
    if (!id) {
      setError("No task ID provided");
      setLoading(false);
      return;
    }

    const loadTask = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = apiEndpoint || `/api/manager/tasks/${id}`;
        const data = await fetchTaskById(id, endpoint);

        if (!data) {
          setError("Task not found");
          return;
        }

        setTask(data);
      } catch (error) {
        console.error("Error loading task:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load task",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id, initialData, apiEndpoint]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-5"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="bg-red-50 rounded-[30px] border border-red-200 p-6 md:p-8">
            <p className="text-red-700 font-semibold">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!task) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-5"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="bg-yellow-50 rounded-[30px] border border-yellow-200 p-6 md:p-8">
            <p className="text-yellow-700">Task not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-5"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-[30px] border border-slate-200 p-6 md:p-8 shadow-sm">
          {/* Status Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {task.status && (
              <span
                className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                  statusStyles[task.status] ||
                  "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {task.status?.replace("_", " ")}
              </span>
            )}

            {task.priority && (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {task.priority}
              </span>
            )}

            {task.setupType && (
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                {task.setupType}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {task.title}
          </h1>

          {/* Description */}
          {task.description && (
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {task.description}
            </p>
          )}

          {/* Progress Bar */}
          {task.progress !== undefined && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">
                  Progress
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {task.progress}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${task.progress}%`,
                  }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-200">
            {/* Due Date */}
            {task.dueDate && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Due Date</p>
                </div>
                <p className="text-slate-900 font-medium">{task.dueDate}</p>
              </div>
            )}

            {/* Location */}
            {task.location && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Location</p>
                </div>
                <p className="text-slate-900 font-medium">{task.location}</p>
              </div>
            )}

            {/* Stage */}
            {task.stage && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Stage</p>
                </div>
                <p className="text-slate-900 font-medium capitalize">
                  {task.stage}
                </p>
              </div>
            )}

            {/* Team Members Count */}
            {task.employees && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Team Members</p>
                </div>
                <p className="text-slate-900 font-medium">
                  {task.employees.length} Members
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          {task.instructions && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                Instructions
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {task.instructions}
              </p>
            </div>
          )}

          {/* Reference Link */}
          {task.referenceLink && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link2 size={16} className="text-slate-400" />
                <p className="text-sm text-slate-500">Reference Link</p>
              </div>
              <a
                href={task.referenceLink}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 underline font-medium"
              >
                Open External Link
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
