import api from "../../utils/api";

const BASE_URL = "/positions";

export const getPositions = () => api.get(BASE_URL);

export const getPositionById = (id: number) => api.get(`${BASE_URL}/${id}`);

export const createPosition = (data: any) => api.post(BASE_URL, data);

export const updatePosition = (id: number, data: any) =>
  api.put(`${BASE_URL}/${id}`, data);

export const deletePosition = (id: number) => api.delete(`${BASE_URL}/${id}`);
