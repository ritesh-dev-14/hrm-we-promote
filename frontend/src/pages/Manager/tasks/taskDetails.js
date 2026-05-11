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

export const createTaskItem = async (
  taskId,
  payload
) => {
  try {
    const response = await API.post(
      `/api/task-items/${taskId}`,
      payload
    );

    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const assignTaskItem = async (
  subtaskId,
  employeeIds = []
) => {
  try {
    const payload = {
      assignments:
        employeeIds.map((id) => ({
          employeeId: id,
        })),
    };

    const response = await API.post(
      `/api/task-items/${subtaskId}/assign`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const fetchTaskItems =
  async (taskId) => {
    const response = await API.get(
      `/api/task-items/${taskId}`
    );

    return response.data.data || [];
  };