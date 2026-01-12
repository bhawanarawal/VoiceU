import api from "../../utils/api";

const BASE_URL = "/groups";

export const getgroups = () => api.get(BASE_URL);
export const getgroupById = (id: number) => api.get(`${BASE_URL}/${id}`);
export const creategroup = (data: any) => api.post(BASE_URL, data);
export const updategroup = (id: number, data: any) =>
  api.put(`${BASE_URL}/${id}`, data);
export const deletegroup = (id: number) => api.delete(`${BASE_URL}/${id}`);
