import api from "../../utils/api";

export const getElections = () => {
  return api.get("/elections/");
};

export const getElectionById = (id: number) => {
  return api.get(`/elections/${id}/`);
};

export const createElection = (data: any) => {
  return api.post("/elections/", data);
};

export const updateElection = (id: number, data: any) => {
  return api.put(`/elections/${id}/`, data);
};

export const deleteElection = (id: number) => {
  return api.delete(`/elections/${id}/`);
};
