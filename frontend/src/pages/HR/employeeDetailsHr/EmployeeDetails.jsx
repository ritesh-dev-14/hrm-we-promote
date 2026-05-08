import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../../services/api";
import {
  Edit3,
  Save,
  X,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Briefcase,
} from "lucide-react";

export default function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaveData, setLeaveData] = useState(null);

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

        const [empRes, attRes, leaveRes] = await Promise.all([
          API.get(`/api/hr/employee/${id}`),
          API.get(`/api/attendance/${id}`),
          API.get(`/api/hr/leave/employee/${id}`),
        ]);

        const empData = empRes?.data?.data || null;

        const attData =
          attRes?.data?.data?.records || [];

        const leaveStats =
          leaveRes?.data?.data || null;

        setEmployee(empData);
        setAttendance(attData);
        setLeaveData(leaveStats);

        setForm({
          name: empData?.name || "",
          email: empData?.email || "",
          department:
            empData?.department || "",
          position: empData?.position || "",
        });
      } catch (err) {
        console.log(err);

        setError(
          "Failed to load employee details",
        );
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

      const res = await API.put(
        endpoint,
        payload,
      );

      setEmployee(res.data.data);

      setIsEditing(false);
    } catch (err) {
      console.log(
        "UPDATE ERROR:",
        err.response?.data || err.message,
      );

      alert(
        err.response?.data?.message ||
          "Update failed",
      );
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />

          <p className="text-sm text-slate-500 font-medium">
            Loading employee details...
          </p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );

  if (!employee)
    return (
      <div className="p-6">
        Employee not found
      </div>
    );

  // ---------------- UI ----------------
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* HEADER CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {employee.name}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wide">
                {employee.role}
              </span>

              {employee.department && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                  {employee.department}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              setIsEditing(!isEditing)
            }
            className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
          >
            {isEditing ? (
              <X size={18} />
            ) : (
              <Edit3 size={18} />
            )}
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          <Input
            label="Name"
            value={form.name}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Input
            label="Email"
            value={form.email}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <Input
            label="Department"
            value={form.department}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({
                ...form,
                department: e.target.value,
              })
            }
          />

          <Input
            label="Position"
            value={form.position}
            disabled={!isEditing}
            onChange={(e) =>
              setForm({
                ...form,
                position: e.target.value,
              })
            }
          />
        </div>

        {/* SAVE */}
        {isEditing && (
          <button
            onClick={handleSave}
            className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-100"
          >
            <Save size={16} />
            Save Changes
          </button>
        )}
      </div>

      {/* LEAVE OVERVIEW */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Briefcase
              size={20}
              className="text-indigo-600"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Leave Overview
            </h2>

            <p className="text-sm text-slate-500">
              Employee leave summary &
              balance
            </p>
          </div>
        </div>

        {leaveData ? (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <LeaveCard
                title="Total Leaves"
                value={leaveData.totalLeaves}
                icon={
                  <CalendarDays
                    size={20}
                    className="text-slate-700"
                  />
                }
                bg="bg-slate-100"
              />

              <LeaveCard
                title="Approved"
                value={leaveData.approved}
                icon={
                  <CheckCircle2
                    size={20}
                    className="text-emerald-600"
                  />
                }
                bg="bg-emerald-50"
              />

              <LeaveCard
                title="Pending"
                value={leaveData.pending}
                icon={
                  <Clock3
                    size={20}
                    className="text-amber-600"
                  />
                }
                bg="bg-amber-50"
              />

              <LeaveCard
                title="Rejected"
                value={leaveData.rejected}
                icon={
                  <XCircle
                    size={20}
                    className="text-rose-600"
                  />
                }
                bg="bg-rose-50"
              />
            </div>

            {/* BALANCE */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Casual Leave Left
                    </p>

                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                      {
                        leaveData.balance
                          ?.casualLeft
                      }
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <CalendarDays className="text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Sick Leave Left
                    </p>

                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                      {
                        leaveData.balance
                          ?.sickLeft
                      }
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-sm">
            No leave data available
          </div>
        )}
      </div>

      {/* ATTENDANCE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold mb-5 text-slate-900">
          Attendance History
        </h2>

        <div className="space-y-4">
          {attendance.length > 0 ? (
            attendance.map((a) => (
              <div
                key={a.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border border-slate-200 p-5 rounded-2xl hover:bg-slate-50 transition-all duration-200"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {a.status}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(
                      a.date,
                    ).toDateString()}
                  </p>
                </div>

                <div className="text-sm text-slate-600 mt-3 md:mt-0">
                  <p>
                    <span className="font-semibold">
                      IN:
                    </span>{" "}
                    {a.startTime
                      ? new Date(
                          a.startTime,
                        ).toLocaleTimeString()
                      : "-"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      OUT:
                    </span>{" "}
                    {a.endTime
                      ? new Date(
                          a.endTime,
                        ).toLocaleTimeString()
                      : "-"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400">
              No attendance records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- LEAVE CARD ----------------
function LeaveCard({
  title,
  value,
  icon,
  bg,
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white hover:shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-black text-slate-900 mt-2">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ---------------- INPUT COMPONENT ----------------
function Input({
  label,
  value,
  onChange,
  disabled,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {label}
      </p>

      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
      />
    </div>
  );
}