import API from "../../../services/api";

export const fetchTaskById = async (id) => {
  try {
    const response = await API.get(
      `/api/manager/tasks/${id}`
    );

    if (response.data?.success) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error(
      "Error fetching task:",
      error?.response?.data?.message ||
        error.message
    );

    throw error;
  }
};