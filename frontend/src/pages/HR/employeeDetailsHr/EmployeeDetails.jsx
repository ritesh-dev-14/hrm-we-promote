import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../../services/api";
import { Edit3, Save, X } from "lucide-react";

export default function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [empRes, attRes] = await Promise.all([
          API.get(`/api/hr/employee/${id}`),
          API.get(`/api/attendance/${id}`),
        ]);

        const empData = empRes?.data?.data || null;
        const attData = attRes?.data?.data?.records || [];

        setEmployee(empData);
        setAttendance(attData);

        setForm({
          name: empData?.name || "",
          email: empData?.email || "",
          department: empData?.department || "",
          position: empData?.position || "",
        });
      } catch (err) {
        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ---------------- SAVE ----------------
const handleSave = async () => {
  try {
    const endpoint =
      employee.role === "MANAGER"
        ? `/api/hr/manager/${id}`
        : `/api/hr/employee/${id}`;

    let payload = {};

    if (employee.role === "MANAGER") {
      payload = {
        name: form.name,
        email: form.email,
        department: form.department,
      };
    } else {
      payload = {
        name: form.name,
      };
    }

    const res = await API.put(endpoint, payload);

    setEmployee(res.data.data);
    setIsEditing(false);
  } catch (err) {
    console.log("UPDATE ERROR:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Update failed");
  }
};

  // ---------------- LOADING ----------------
  if (loading)
    return <div className="p-6 text-gray-500">Loading...</div>;

  if (error)
    return <div className="p-6 text-red-500">{error}</div>;

  if (!employee)
    return <div className="p-6">Employee not found</div>;

  // ---------------- UI ----------------
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* HEADER CARD */}
      <div className="bg-white rounded-3xl shadow p-6 border">
        <div className="flex justify-between items-start">

          <div>
            <h1 className="text-2xl font-bold">
              {employee.name}
            </h1>
            <p className="text-gray-500">
              {employee.role}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 border rounded-xl"
          >
            {isEditing ? <X /> : <Edit3 />}
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Input label="Name" value={form.name}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input label="Email" value={form.email}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input label="Department" value={form.department}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
          />

          <Input label="Position" value={form.position}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({ ...form, position: e.target.value })
            }
          />
        </div>

        {/* SAVE */}
        {isEditing && (
          <button
            onClick={handleSave}
            className="mt-5 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl"
          >
            <Save size={16} />
            Save Changes
          </button>
        )}
      </div>

      {/* ATTENDANCE */}
      <div className="bg-white rounded-3xl shadow p-6 border">
        <h2 className="text-xl font-bold mb-4">
          Attendance History
        </h2>

        <div className="space-y-4">
          {attendance.map((a) => (
            <div
              key={a.id}
              className="flex justify-between border p-4 rounded-2xl"
            >
              <div>
                <p className="font-semibold">{a.status}</p>
                <p className="text-sm text-gray-500">
                  {new Date(a.date).toDateString()}
                </p>
              </div>

              <div className="text-right text-sm text-gray-600">
                <p>
                  IN:{" "}
                  {a.startTime
                    ? new Date(a.startTime).toLocaleTimeString()
                    : "-"}
                </p>
                <p>
                  OUT:{" "}
                  {a.endTime
                    ? new Date(a.endTime).toLocaleTimeString()
                    : "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- INPUT COMPONENT ----------------
function Input({ label, value, onChange, disabled }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border rounded-xl px-3 py-2 disabled:bg-gray-100"
      />
    </div>
  );
}