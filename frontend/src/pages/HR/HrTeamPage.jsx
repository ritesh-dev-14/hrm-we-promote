import { useState, useMemo, useCallback } from "react";

import {
  Search,
  Edit3,
  Trash2,
  Plus,
  ShieldCheck,
  Users,
  UserPlus,
  Briefcase,
  ArrowRight,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { useTeamData } from "./hooks/useTeamData";

import HrAddEmployee from "./HrAddEmployee";
import HrAddManager from "./HrAddManager";
import HrAddDepartment from "./HrAddDepartment.jsx";

const CARD_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  visible: {
    opacity: 1,
    y: 0,
  },

  exit: {
    opacity: 0,
    scale: 0.96,
  },
};

export default function HrTeamPage() {
  const navigate = useNavigate();

  const { staff, loading, error, refresh } = useTeamData();

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({
    type: null,
    data: null,
  });

  const closeModal = useCallback(() => {
    setModal({
      type: null,
      data: null,
    });
  }, []);

  const filteredStaff = useMemo(() => {
    const term = search.toLowerCase().trim();

    return term
      ? staff.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.department?.toLowerCase().includes(term) ||
            p.role?.toLowerCase().includes(term),
        )
      : staff;
  }, [staff, search]);

  const handleAction = useCallback((e, type, data = null) => {
    e.stopPropagation();

    setModal({
      type,
      data,
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">
              HR Management
            </p>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Team Directory
            </h1>

            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Manage employees, managers, and internal team structure.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <button
              onClick={(e) => handleAction(e, "DEPARTMENT")}
              className="w-full sm:w-auto h-12 px-5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Briefcase size={17} />
              Add Department
            </button>

            <button
              onClick={(e) => handleAction(e, "MANAGER")}
              className="w-full sm:w-auto h-12 px-5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <UserPlus size={17} />
              Add Manager
            </button>

            <button
              onClick={(e) => handleAction(e, "EMPLOYEE")}
              className="w-full sm:w-auto h-12 px-5 rounded-2xl bg-black hover:bg-slate-800 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
            >
              <Plus size={17} />
              Add Employee
            </button>
          </div>
        </header>

        {/* SEARCH */}
        <div className="relative w-full sm:max-w-md mb-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search employee, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 sm:h-13 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all"
          />
        </div>

        {/* CONTENT */}
        <main>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-60 rounded-3xl bg-white border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 rounded-3xl p-10 text-center">
              <p className="text-red-500 font-semibold">{error}</p>

              <button
                onClick={refresh}
                className="mt-4 text-sm font-semibold text-black underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredStaff.map((person) => (
                  <motion.div
                    key={person.id}
                    variants={CARD_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    whileHover={{
                      y: -3,
                    }}
                    onClick={() =>
                      navigate(`/hr/team/${person.employeeId || person.id}`)
                    }
                    className="group relative bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6 cursor-pointer hover:border-slate-300 hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-300 overflow-hidden"
                  >
                    {/* TOP ACTIONS */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => handleAction(e, "EMPLOYEE", person)}
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-black transition-all"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-100 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* PROFILE */}
                    <div className="flex flex-col items-start">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black mb-5 shadow-sm
                        ${
                          person.role === "MANAGER"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {person.name?.substring(0, 2)?.toUpperCase()}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">
                        {person.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${
                            person.role === "MANAGER"
                              ? "bg-black text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {person.role === "MANAGER" ? (
                            <ShieldCheck size={11} />
                          ) : (
                            <Users size={11} />
                          )}

                          {person.role}
                        </span>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-1">
                          Department
                        </p>

                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {person.department || "General"}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shrink-0">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* EMPTY */}
          {!loading && filteredStaff.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-[32px] py-20 px-6 text-center mt-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase size={22} className="text-slate-400" />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No Employees Found
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Try changing your search keywords.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <HrAddDepartment
        isOpen={modal.type === "DEPARTMENT"}
        onClose={closeModal}
        onSave={refresh}
      />
      
      <HrAddEmployee
        isOpen={modal.type === "EMPLOYEE"}
        initialData={modal.data}
        onClose={closeModal}
        onSave={refresh}
      />

      <HrAddManager
        isOpen={modal.type === "MANAGER"}
        onClose={closeModal}
        onSave={refresh}
      />
    </div>
  );
}
