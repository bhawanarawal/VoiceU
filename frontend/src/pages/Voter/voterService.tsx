import api from "../../utils/api";

export const getVoters = () => api.get("/voters/");
export const getVoterById = (id: number) => api.get(`/voters/${id}/`);
export const createVoter = (data: any) => api.post("/voters/", data);
export const updateVoter = (id: number, data: any) =>
  api.put(`/voters/${id}/`, data);
export const deleteVoter = (id: number) => api.delete(`/voters/${id}/`);
