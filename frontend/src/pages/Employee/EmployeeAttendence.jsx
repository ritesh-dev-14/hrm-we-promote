import { useState, useEffect } from "react";
import AttendanceView from "../../components/attendece/AttendenceView";

export default function EmployeeAttendance() {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval;
    if (status === "working") {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const stats = [
    { label: "Days Present", value: "18/22" },
    { label: "Late Arrivals", value: "2" },
    { label: "Avg. Daily Hours", value: "8h 15m" },
  ];

  // Mock data to see the UI in a "Production" state
  const records = [
    { date: "May 06, 2026", in: "09:00 AM", out: "06:05 PM", hours: "9h 05m" },
    { date: "May 05, 2026", in: "09:12 AM", out: "06:00 PM", hours: "8h 48m" },
    { date: "May 04, 2026", in: "08:55 AM", out: "05:30 PM", hours: "8h 35m" },
  ];

  const handleClockIn = () => setStatus("working");
  const handleClockOut = () => {
    setStatus("idle");
    setSeconds(0);
  };
  const handleBreak = () => setStatus(status === "working" ? "break" : "working");

  return (
    <AttendanceView
      stats={stats}
      records={records}
      status={status}
      seconds={seconds}
      onClockIn={handleClockIn}
      onClockOut={handleClockOut}
      onBreakToggle={handleBreak}
    />
  );
}