import axiosApi from "../services/axios";

export const getTasks = async (params) => {
  // If params is already a URLSearchParams object, use it directly
  const queryString =
    params instanceof URLSearchParams
      ? params.toString()
      : new URLSearchParams(params).toString();

  return await axiosApi.get(`/tasks?${queryString}`, {
    withCredentials: true,
  });
};

export const getTechnician = async () => {
  return await axiosApi.get(`/technicians`, {
    withCredentials: true,
  });
};

export const createTask = async (taskData) => {
  return await axiosApi.post("/tasks", taskData, {
    withCredentials: true,
  });
};

export const deleteTask = async (taskId) => {
  return await axiosApi.delete(`/tasks/${taskId}`, {
    withCredentials: true,
  });
};

export const updateTask = async (taskId, taskData) => {
  return await axiosApi.put(`/tasks/${taskId}`, taskData, {
    withCredentials: true,
  });
};

export const changePassword = async (userId, password) => {
  return await axiosApi.put(
    `/technicians/${userId}`,
    { password },
    {
      withCredentials: true,
    }
  );
};

export const getComments = async (taskId) => {
  return await axiosApi.get(`/tasks/${taskId}/comments`, {
    withCredentials: true,
  });
};
