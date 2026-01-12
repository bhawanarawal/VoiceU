import api from "../../utils/api";

export const getAffiliations = () => api.get("/affiliations");

export const getAffiliationById = (id: number) =>
  api.get(`/affiliations/${id}`);

export const getAffiliationWithgroups = (id: number) =>
  api.get(`/affiliations/${id}/with-details`);

export const createAffiliation = (data: any) => api.post("/affiliations", data);

export const updateAffiliation = (id: number, data: any) =>
  api.put(`/affiliations/${id}`, data);

export const deleteAffiliation = (id: number) =>
  api.delete(`/affiliations/${id}`);
