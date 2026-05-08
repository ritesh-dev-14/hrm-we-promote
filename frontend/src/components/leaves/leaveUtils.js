import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

export default function useLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH LEAVES
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/employee/leaves");

      setLeaves(res.data?.data || []);
    } catch (err) {
      console.error(
        "Error fetching leaves:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // STATS
  const stats = useMemo(() => {
    return {
      sick: leaves.filter((l) => l.type === "SICK" && l.status === "APPROVED")
        .length,

      casual: leaves.filter(
        (l) => l.type === "CASUAL" && l.status === "APPROVED",
      ).length,

      annual: leaves.filter(
        (l) => l.type === "ANNUAL" && l.status === "APPROVED",
      ).length,
    };
  }, [leaves]);

  // APPLY LEAVE
  const applyLeave = async (formData) => {
    try {
      await API.post("/api/employee/leave", {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
        type: formData.type,
      });

      await fetchLeaves();

      return true;
    } catch (err) {
      console.error(
        "Error applying leave:",
        err?.response?.data || err.message,
      );

      alert(err?.response?.data?.message || "Failed to apply leave");

      return false;
    }
  };

  return {
    leaves,
    stats,
    loading,
    applyLeave,
    fetchLeaves,
  };
}
