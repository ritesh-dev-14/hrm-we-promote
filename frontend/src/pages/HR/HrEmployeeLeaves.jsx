import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Filter,
  ChevronDown,
  Check,
  CalendarDays,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// ---------------- STATUS FILTER ----------------
const CustomStatusFilter = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  const options = [
    { label: "All Requests", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative min-w-55">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full h-13.5 flex items-center justify-between px-5 rounded-2xl border bg-white transition-all
        ${
          open
            ? "border-slate-300 shadow-sm"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <Filter size={17} className="text-slate-400" />

          <span className="text-sm font-semibold text-slate-700">
            {options.find((o) => o.value === value)?.label}
          </span>
        </div>

        <ChevronDown
          size={17}
          className={`text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            {options.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-all
                ${
                  value === item.value
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                {item.label}

                {value === item.value && <Check size={16} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- MAIN PAGE ----------------
export default function HrLeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  // ---------------- FETCH ----------------
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/hr/leaves");

      setLeaveRequests(res.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ---------------- UPDATE STATUS ----------------
  const updateLeaveStatus = async (
    leaveId,
    status,
    reviewNote = "",
  ) => {
    try {
      const payload =
        status === "REJECTED"
          ? { status, reviewNote }
          : { status };

      await API.put(`/api/hr/leave/${leaveId}`, payload);

      setLeaveRequests((prev) =>
        prev.map((leave) =>
          leave.id === leaveId
            ? { ...leave, status, reviewNote }
            : leave,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = (id) => {
    updateLeaveStatus(id, "APPROVED");
  };

  const handleReject = (id) => {
    const note = prompt("Enter rejection reason");

    if (note?.trim()) {
      updateLeaveStatus(id, "REJECTED", note);
    }
  };

  // ---------------- FILTER ----------------
  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((leave) => {
      const matchesSearch =
        leave.user?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        leave.user?.employeeId
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : leave.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, search, statusFilter]);

  // ---------------- STATS ----------------
  const stats = useMemo(() => {
    return {
      pending: leaveRequests.filter(
        (l) => l.status === "PENDING",
      ).length,

      approved: leaveRequests.filter(
        (l) => l.status === "APPROVED",
      ).length,

      rejected: leaveRequests.filter(
        (l) => l.status === "REJECTED",
      ).length,
    };
  }, [leaveRequests]);

  const cards = [
    {
      label: "Pending",
      count: stats.pending,
      icon: Clock3,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Approved",
      count: stats.approved,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Rejected",
      count: stats.rejected,
      icon: XCircle,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Leave Management
          </h1>

          <p className="text-slate-500 mt-1 text-sm">
            Review and manage employee leave requests
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.label}
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    {card.count}
                  </h2>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
                >
                  <card.icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-13.5 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-slate-400 transition-all"
            />
          </div>

          <CustomStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Employee
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Leave
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Duration
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Status
                  </th>

                  <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center"
                    >
                      <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center"
                    >
                      <p className="text-sm font-medium text-slate-400">
                        No leave requests found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr
                      key={leave.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* EMPLOYEE */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">
                            {leave.user?.name
                              ?.split(" ")
                              ?.map((n) => n[0])
                              ?.join("")
                              ?.slice(0, 2)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {leave.user?.name}
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {leave.user?.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {leave.type}
                          </p>

                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {leave.reason}
                          </p>
                        </div>
                      </td>

                      {/* DURATION */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          <span>
                            {new Date(
                              leave.startDate,
                            ).toLocaleDateString()}
                          </span>

                          <span className="text-slate-300">
                            —
                          </span>

                          <span>
                            {new Date(
                              leave.endDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <StatusBadge status={leave.status} />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-8 py-5">
                        {leave.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleApprove(leave.id)
                              }
                              className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all"
                            >
                              <CheckCircle2 size={18} />
                            </button>

                            <button
                              onClick={() =>
                                handleReject(leave.id)
                              }
                              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">
                              Processed
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- STATUS BADGE ----------------
function StatusBadge({ status }) {
  const styles = {
    PENDING:
      "bg-amber-50 text-amber-700 border-amber-100",

    APPROVED:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    REJECTED:
      "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}