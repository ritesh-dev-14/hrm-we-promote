import API from "../../services/api";

export const fetchTaskById = async (id, endpoint = null) => {
  try {
    const url = endpoint || `/api/manager/tasks/${id}`;
    console.log(`Fetching task from: ${url}`);
    const response = await API.get(url);

    console.log("API Response:", response);

    if (response.data?.success) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to fetch task");
  } catch (error) {
    console.error("Fetch task error:", error);
    throw error;
  }
};
