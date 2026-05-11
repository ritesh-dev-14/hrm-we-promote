import { useEffect, useState } from "react";
import { X, Loader2, ClipboardList } from "lucide-react";
import API from "../../services/api";

const initialState = {
  title: "",
  description: "",
  instructions: "",
  referenceLink: "",
  location: "",
  date: "",
  setupType: "PREMIUM",
  assignedToRole: "EMPLOYEE",
  isGroupTask: false,
};

const CreateTaskModal = ({ open, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData(initialState);
      setError("");
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        referenceLink: formData.referenceLink.trim(),
        location: formData.location.trim(),
        date: formData.date,
        setupType: formData.setupType,
        assignedToRole: formData.assignedToRole,
        isGroupTask: formData.isGroupTask,
      };

      const res = await API.post(
        "/api/manager/tasks",
        payload
      );

      if (res.data.success) {
        onTaskCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} />
            <h2 className="text-lg font-bold">
              Create Task
            </h2>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* TITLE */}
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Task title (e.g. Samsung Store Setup)"
            className="input"
          />

          {/* DATE */}
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input"
          />

          {/* LOCATION */}
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Google Maps link (store location)"
            className="input"
          />

          {/* SETUP TYPE */}
          <select
            name="setupType"
            value={formData.setupType}
            onChange={handleChange}
            className="input"
          >
            <option value="PREMIUM">
              Premium Setup
            </option>
            <option value="VERY_PREMIUM">
              Very Premium Setup
            </option>
            <option value="PHONE">
              Phone Setup
            </option>
          </select>

          {/* ROLE */}
          <select
            name="assignedToRole"
            value={formData.assignedToRole}
            onChange={handleChange}
            className="input"
          >
            <option value="EMPLOYEE">
              Employee
            </option>
            <option value="MANAGER">
              Manager
            </option>
          </select>

          {/* GROUP TASK */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isGroupTask"
              checked={formData.isGroupTask}
              onChange={handleChange}
            />
            Is Group Task
          </label>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe task clearly..."
            className="input h-24"
          />

          {/* INSTRUCTIONS */}
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            placeholder="Step-by-step instructions..."
            className="input h-28"
          />

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl flex justify-center gap-2"
          >
            {loading && (
              <Loader2 className="animate-spin" />
            )}
            Create Task
          </button>
        </form>
      </div>

      {/* STYLE */}
      <style>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          font-size: 14px;
          outline: none;
        }
        .input:focus {
          border-color: black;
          background: white;
        }
      `}</style>
    </div>
  );
};

export default CreateTaskModal;