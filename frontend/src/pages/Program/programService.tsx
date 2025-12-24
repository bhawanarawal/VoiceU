import api from "../../utils/api";

const BASE_URL = "/programs";

export const getPrograms = () => api.get(BASE_URL);
export const getProgramById = (id: number) => api.get(`${BASE_URL}/${id}`);
export const createProgram = (data: any) => api.post(BASE_URL, data);
export const updateProgram = (id: number, data: any) =>
  api.put(`${BASE_URL}/${id}`, data);
export const deleteProgram = (id: number) => api.delete(`${BASE_URL}/${id}`);
