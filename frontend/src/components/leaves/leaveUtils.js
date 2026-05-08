import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

export default function useLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/employee/leaves");

      setLeaves(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
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
      sick: leaves.filter((l) => l.type === "SICK").length,

      casual: leaves.filter((l) => l.type === "CASUAL").length,
    };
  }, [leaves]);

  // APPLY LEAVE
  // const applyLeave = async (formData) => {
  //   try {
  //     await API.post("/api/employee/leave", {
  //       startDate: formData.startDate,
  //       endDate: formData.endDate,
  //       reason: formData.reason,
  //       type: formData.type,
  //     });

  //     await fetchLeaves();

  //     return true;
  //   } catch (err) {
  //     console.error("Error applying leave:", err);

  //     return false;
  //   }
  // };

  const applyLeave = async (formData) => {
  try {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    // calculate total leave days
    const timeDiff = end.getTime() - start.getTime();

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    await API.post("/api/employee/leave", {
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      type: formData.type,
      days,
    });

    await fetchLeaves();

    return true;
  } catch (err) {
    console.error(
      "Error applying leave:",
      err?.response?.data || err.message
    );

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