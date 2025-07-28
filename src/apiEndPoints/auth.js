import axiosApi from "../services/axios";

export const login = async (credentials) => {
  return await axiosApi.post("/auth/login", credentials);
};

export const register = async (userData) => {
  return await axiosApi.post("/auth/register", userData);
};
