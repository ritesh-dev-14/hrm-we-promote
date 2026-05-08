import { useEffect, useState } from "react";
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyLeave = async (data) => {
    try {
      await API.post("/api/employee/leave", data);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const stats = {
    sick: leaves.filter((l) =>
      l.reason?.toLowerCase().includes("sick"),
    ).length,

    casual: leaves.filter((l) =>
      l.reason?.toLowerCase().includes("casual"),
    ).length,

    annual: leaves.filter((l) =>
      l.reason?.toLowerCase().includes("annual"),
    ).length,
  };

  return {
    leaves,
    loading,
    stats,
    fetchLeaves,
    applyLeave,
  };
}