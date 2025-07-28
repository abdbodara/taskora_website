import axiosApi from "../services/axios";

export const getTechnicians = async (params = {}) => {
  // Set default values
  const { 
    page = 1, 
    limit = 10, 
    status = 'all',
    search = ''
  } = params;
  
  // Build query string
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...(status !== 'all' && { status })
  });
  
  // Add search query if provided
  if (search) {
    queryParams.append('search', search);
  }
  
  return await axiosApi.get(`/technicians?${queryParams.toString()}`, {
    withCredentials: true,
  });
};

export const deleteTechnician = async (id) => {
  return await axiosApi.delete(`/technicians/${id}`, {
    withCredentials: true,
  });
};

export const technicianData = async (data) => {
  return await axiosApi.post("/technicians", data, {
    withCredentials: true,
  });
};

export const updateTechnician = async (id, data) => {
  return await axiosApi.put(`/technicians/${id}`, data, {
    withCredentials: true,
  });
};

export const changePassword = async (userId, newPassword) => {
  return await axiosApi.put(
    `/technicians/change-password/${userId}`,
    { newPassword },
    {
      withCredentials: true,
    }
  );
};
