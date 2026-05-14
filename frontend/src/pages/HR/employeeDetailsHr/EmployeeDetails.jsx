import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  TimerReset,
  LogIn,
  LogOut,
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

          // ATTENDANCE API
          API.get(`/api/attendance/${id}`),

          // LEAVE STATS API
          API.get(`/api/hr/leave/employee/${id}`),
        ]);

        const empData = empRes?.data?.data || null;

        // Attendance Records
        const attData = attRes?.data?.data?.records || [];

        // Leave Stats
        const leaveStats = leaveRes?.data?.data || null;

        setEmployee(empData);
        setAttendance(attData);
        setLeaveData(leaveStats);

        setForm({
          name: empData?.name || "",
          email: empData?.email || "",
          department: empData?.department || "",
          position: empData?.position || "",
        });
      } catch (err) {
        console.log(err);

        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ---------------- SAVE ----------------
  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {
      let endpoint = "";
      let payload = {};

      // ================= MANAGER UPDATE =================
      if (employee.role === "MANAGER") {
        endpoint = `/api/hr/manager/${employee.employeeId}`;

        payload = {
          name: form.name,
          email: form.email,
          department: form.department,
        };
      }

      // ================= EMPLOYEE UPDATE =================
      else {
        endpoint = `/api/hr/employee/${employee.employeeId}`;

        payload = {
          name: form.name,
        };
      }

      const res = await API.put(endpoint, payload);

      setEmployee(res.data.data);

      setForm({
        name: res.data.data?.name || "",
        email: res.data.data?.email || "",
        department: res.data.data?.department || "",
        position: res.data.data?.position || "",
      });

      setIsEditing(false);
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data || err.message);

      alert(err.response?.data?.message || "Update failed");
    }
  };

  // ---------------- ATTENDANCE STATS ----------------
  const attendanceStats = useMemo(() => {
    return {
      present: attendance.filter((a) => a.status === "PRESENT").length,

      leave: attendance.filter((a) => a.status === "LEAVE").length,

      absent: attendance.filter((a) => a.status === "ABSENT").length,
    };
  }, [attendance]);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin" />

          <p className="text-sm text-slate-500 font-medium">
            Loading employee details...
          </p>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  if (!employee) return <div className="p-6">Employee not found</div>;

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 transition-all duration-0 hover:shadow-md">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {employee.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wide">
                  {employee.role}
                </span>

                {employee.department && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                    {employee.department}
                  </span>
                )}

                {employee.position && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                    {employee.position}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
            >
              {isEditing ? <X size={18} /> : <Edit3 size={18} />}
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

          {/* SAVE BUTTON */}
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
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
          <SectionHeader
            title="Leave Overview"
            subtitle="Employee leave summary & balances"
            icon={<Briefcase className="text-indigo-600" />}
            bg="bg-indigo-50"
          />

          {leaveData ? (
            <>
              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
                <StatCard
                  title="Total Leaves"
                  value={leaveData.totalLeaves}
                  icon={<CalendarDays size={20} />}
                  theme="slate"
                />

                <StatCard
                  title="Approved"
                  value={leaveData.approved}
                  icon={<CheckCircle2 size={20} />}
                  theme="emerald"
                />

                <StatCard
                  title="Pending"
                  value={leaveData.pending}
                  icon={<Clock3 size={20} />}
                  theme="amber"
                />

                <StatCard
                  title="Rejected"
                  value={leaveData.rejected}
                  icon={<XCircle size={20} />}
                  theme="rose"
                />
              </div>

              {/* BALANCE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <BalanceCard
                  title="Casual Leave Left"
                  value={leaveData.balance?.casualLeft}
                  theme="indigo"
                />

                <BalanceCard
                  title="Sick Leave Left"
                  value={leaveData.balance?.sickLeft}
                  theme="emerald"
                />
              </div>
            </>
          ) : (
            <EmptyState text="No leave data available" />
          )}
        </div>

        {/* ATTENDANCE */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
          <SectionHeader
            title="Attendance History"
            subtitle="Track employee daily attendance records"
            icon={<TimerReset className="text-indigo-600" />}
            bg="bg-indigo-50"
          />

          {/* ATTENDANCE STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 mb-8">
            <StatCard
              title="Present Days"
              value={attendanceStats.present}
              icon={<CheckCircle2 size={20} />}
              theme="emerald"
            />

            <StatCard
              title="Leave Days"
              value={attendanceStats.leave}
              icon={<CalendarDays size={20} />}
              theme="amber"
            />

            <StatCard
              title="Absent Days"
              value={attendanceStats.absent}
              icon={<XCircle size={20} />}
              theme="rose"
            />
          </div>

          {/* ATTENDANCE LIST */}
          <div className="space-y-4">
            {attendance.length > 0 ? (
              attendance.map((record) => (
                <div
                  key={record.id}
                  className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    {/* LEFT */}
                    <div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={record.status} />

                        <p className="text-sm font-semibold text-slate-500">
                          {new Date(record.date).toDateString()}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 mt-2">
                        Record created on{" "}
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="grid grid-cols-2 gap-5">
                      <TimeBox
                        label="Check In"
                        value={
                          record.startTime
                            ? new Date(record.startTime).toLocaleTimeString()
                            : "-- : --"
                        }
                        icon={<LogIn size={16} className="text-emerald-600" />}
                      />

                      <TimeBox
                        label="Check Out"
                        value={
                          record.endTime
                            ? new Date(record.endTime).toLocaleTimeString()
                            : "-- : --"
                        }
                        icon={<LogOut size={16} className="text-rose-600" />}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No attendance records found" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- SECTION HEADER ----------------
function SectionHeader({ title, subtitle, icon, bg }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------------- STAT CARD ----------------
function StatCard({ title, value, icon, theme }) {
  const themes = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${themes[theme]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ---------------- BALANCE CARD ----------------
function BalanceCard({ title, value, theme }) {
  const themes = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </p>

          <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${themes[theme]}`}
        >
          <CalendarDays size={22} />
        </div>
      </div>
    </div>
  );
}

// ---------------- STATUS BADGE ----------------
function StatusBadge({ status }) {
  const styles = {
    PRESENT: "bg-emerald-50 text-emerald-600 border-emerald-100",
    LEAVE: "bg-amber-50 text-amber-600 border-amber-100",
    ABSENT: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ---------------- TIME BOX ----------------
function TimeBox({ label, value, icon }) {
  return (
    <div className="min-w-37.5 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <h4 className="text-sm font-bold text-slate-900">{value}</h4>
    </div>
  );
}

// ---------------- EMPTY STATE ----------------
function EmptyState({ text }) {
  return (
    <div className="text-center py-10 text-slate-400 text-sm font-medium">
      {text}
    </div>
  );
}

// ---------------- INPUT ----------------
function Input({ label, value, onChange, disabled }) {
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
