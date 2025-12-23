import api from "../../utils/api";

const BASE_URL = "/organizations";

export const getOrganizations = () => api.get(BASE_URL);
export const getOrganizationById = (id: number) => api.get(`${BASE_URL}/${id}`);
export const createOrganization = (data: any) => api.post(BASE_URL, data);
export const updateOrganization = (id: number, data: any) =>
  api.put(`${BASE_URL}/${id}`, data);
export const deleteOrganization = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);
