import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import API from "../../services/api";

const INITIAL_STATE = {
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
};

const CreateTaskModal = ({
  open,
  onClose,
  onTaskCreated,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_STATE);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener(
        "keydown",
        handleEsc,
      );
    }

    return () =>
      window.removeEventListener(
        "keydown",
        handleEsc,
      );
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setFormData(INITIAL_STATE);
      setError("");
      setSuccess(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        projectName:
          formData.projectName.trim(),

        description:
          formData.description.trim(),

        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00.000Z`
          : null,

        endDate: formData.endDate
          ? `${formData.endDate}T00:00:00.000Z`
          : null,
      };

      const response = await API.post(
        "/api/manager/tasks",
        payload,
      );

      if (response?.data?.success) {
        setSuccess(true);

        setTimeout(() => {
          onTaskCreated(response.data.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create project",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900">
              Create Project
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Add a new project task
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition"
          >
            <X
              size={18}
              className="text-slate-500"
            />
          </button>
        </div>

        {/* SUCCESS */}
        {success ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Project Created
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Your project has been added
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >
            {/* PROJECT NAME */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Project Name
              </label>

              <input
                type="text"
                name="projectName"
                required
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
                className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* DATES */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  required
                  min={today}
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  required
                  min={
                    formData.startDate || today
                  }
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400 transition"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Description
              </label>

              <textarea
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Write project details"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm outline-none resize-none focus:border-slate-400 transition"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-11 px-6 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Creating
                  </span>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateTaskModal;