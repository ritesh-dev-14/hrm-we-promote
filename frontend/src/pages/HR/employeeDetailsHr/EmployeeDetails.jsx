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
  User,
  Mail,
  Building2,
  Award
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
        const attData = attRes?.data?.data?.records || [];
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
  const handleSave = async () => {
    try {
      let endpoint = "";
      let payload = {};

      if (employee.role === "MANAGER") {
        endpoint = `/api/hr/manager/${employee.employeeId}`;
        payload = {
          name: form.name,
          email: form.email,
          department: form.department,
        };
      } else {
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
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Loading profile analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-rose-500 font-medium">{error}</div>;
  if (!employee) return <div className="p-8 text-center text-slate-500 font-medium">Employee not found</div>;

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/40 p-4 md:p-8 antialiased selection:bg-slate-900 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER & GENERAL INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-slate-700 via-slate-900 to-slate-800" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {employee.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded-md tracking-wider uppercase">
                  {employee.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {employee.department && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200/60">
                    <Building2 size={12} className="text-slate-400" />
                    {employee.department}
                  </span>
                )}
                {employee.position && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200/60">
                    <Award size={12} className="text-slate-400" />
                    {employee.position}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 ${
                isEditing 
                ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100" 
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }`}
            >
              {isEditing ? (
                <>
                  <X size={15} /> Cancel
                </>
              ) : (
                <>
                  <Edit3 size={15} /> Edit Profile
                </>
              )}
            </button>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Input
              label="Full Name"
              value={form.name}
              disabled={!isEditing}
              icon={<User size={15} />}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              label="Email Address"
              value={form.email}
              disabled={!isEditing}
              icon={<Mail size={15} />}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              label="Department"
              value={form.department}
              disabled={!isEditing}
              icon={<Building2 size={15} />}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />

            <Input
              label="Position"
              value={form.position}
              disabled={!isEditing}
              icon={<Award size={15} />}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>

          {/* SAVE BUTTON */}
          {isEditing && (
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
              >
                <Save size={15} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* LEAVE OVERVIEW */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-6 md:p-8">
          <SectionHeader
            title="Leave Management"
            subtitle="Overview of leave balances and pending counters"
            icon={<Briefcase size={18} className="text-slate-700" />}
            bg="bg-slate-100"
          />

          {leaveData ? (
            <>
              {/* STATS COUNTERS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <StatCard
                  title="Total Leaves"
                  value={leaveData.totalLeaves}
                  icon={<CalendarDays size={18} />}
                  theme="slate"
                />
                <StatCard
                  title="Approved"
                  value={leaveData.approved}
                  icon={<CheckCircle2 size={18} />}
                  theme="emerald"
                />
                <StatCard
                  title="Pending"
                  value={leaveData.pending}
                  icon={<Clock3 size={18} />}
                  theme="amber"
                />
                <StatCard
                  title="Rejected"
                  value={leaveData.rejected}
                  icon={<XCircle size={18} />}
                  theme="rose"
                />
              </div>

              {/* LEAVE BALANCES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <BalanceCard
                  title="Casual Leave Balance"
                  value={leaveData.balance?.casualLeft}
                  theme="slate"
                />
                <BalanceCard
                  title="Sick Leave Balance"
                  value={leaveData.balance?.sickLeft}
                  theme="emerald"
                />
              </div>
            </>
          ) : (
            <EmptyState text="No active leave data streams available" />
          )}
        </div>

        {/* ATTENDANCE HISTORY */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-6 md:p-8">
          <SectionHeader
            title="Attendance Logs"
            subtitle="Detailed history of timekeeping and daily check logs"
            icon={<TimerReset size={18} className="text-slate-700" />}
            bg="bg-slate-100"
          />

          {/* ATTENDANCE SUMMARY COUNTERS */}
          <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
            <StatCard
              title="Present"
              value={attendanceStats.present}
              icon={<CheckCircle2 size={18} />}
              theme="emerald"
            />
            <StatCard
              title="On Leave"
              value={attendanceStats.leave}
              icon={<CalendarDays size={18} />}
              theme="amber"
            />
            <StatCard
              title="Absent"
              value={attendanceStats.absent}
              icon={<XCircle size={18} />}
              theme="rose"
            />
          </div>

          {/* ATTENDANCE LOG LIST */}
          <div className="space-y-3">
            {attendance.length > 0 ? (
              attendance.map((record) => (
                <div
                  key={record.id}
                  className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 hover:bg-slate-50 transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* LOG LEFT METADATA */}
                    <div className="flex items-center gap-4">
                      <StatusBadge status={record.status} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {new Date(record.date).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Logged at {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* LOG RIGHT TIMEBOXES */}
                    <div className="flex gap-3 sm:justify-end">
                      <TimeBox
                        label="Check In"
                        value={
                          record.startTime
                            ? new Date(record.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : "-- : --"
                        }
                        icon={<LogIn size={14} className="text-emerald-600" />}
                      />

                      <TimeBox
                        label="Check Out"
                        value={
                          record.endTime
                            ? new Date(record.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : "-- : --"
                        }
                        icon={<LogOut size={14} className="text-rose-600" />}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No historic attendance timelines found" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ---------------- PREMIUM SECTION HEADER ----------------
function SectionHeader({ title, subtitle, icon, bg }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/60 ${bg}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------------- PREMIUM STAT CARD ----------------
function StatCard({ title, value, icon, theme }) {
  const themes = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50/50 text-amber-600 border-amber-100",
    rose: "bg-rose-50/50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-200/80">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${themes[theme]}`}>
        {icon}
      </div>
    </div>
  );
}

// ---------------- PREMIUM BALANCE CARD ----------------
function BalanceCard({ title, value, theme }) {
  const themes = {
    slate: "bg-slate-900 text-white",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
  };

  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 tracking-wide">
          {title}
        </p>
        <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{value} <span className="text-xs font-medium text-slate-400">Days</span></h3>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${themes[theme] || "bg-slate-100"}`}>
        <CalendarDays size={16} />
      </div>
    </div>
  );
}

// ---------------- PREMIUM STATUS BADGE ----------------
function StatusBadge({ status }) {
  const styles = {
    PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    LEAVE: "bg-amber-50 text-amber-700 border-amber-200/60",
    ABSENT: "bg-rose-50 text-rose-700 border-rose-200/60",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'PRESENT' ? 'bg-emerald-500' : status === 'LEAVE' ? 'bg-amber-500' : 'bg-rose-500'
      }`} />
      {status}
    </span>
  );
}

// ---------------- PREMIUM TIME BOX ----------------
function TimeBox({ label, value, icon }) {
  return (
    <div className="min-w-[120px] rounded-lg bg-white border border-slate-200/60 px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
      <h4 className="text-xs font-bold text-slate-800 tracking-tight">{value}</h4>
    </div>
  );
}

// ---------------- PREMIUM EMPTY STATE ----------------
function EmptyState({ text }) {
  return (
    <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 text-slate-400 text-xs font-medium tracking-wide">
      {text}
    </div>
  );
}

// ---------------- PREMIUM INPUT WITH INLINE ICON ----------------
function Input({ label, value, onChange, disabled, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full text-sm border border-slate-200 rounded-xl py-2.5 transition-all outline-none
            ${icon ? "pl-10 pr-4" : "px-4"}
            ${disabled 
              ? "bg-slate-50 text-slate-500 font-medium cursor-not-allowed border-slate-100" 
              : "bg-white text-slate-800 font-normal focus:ring-4 focus:ring-slate-100 focus:border-slate-900 shadow-sm"
            }
          `}
        />
      </div>
    </div>
  );
}