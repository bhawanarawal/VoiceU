import api from "../../utils/api";

export const getVoters = () => {
  return api.get("/voters/");
};

export const getMyVoter = () => {
  return api.get("/voters/me");
};

export const getVoterById = (id: number) => {
  return api.get(`/voters/${id}/`);
};

export const createVoter = (data: any) => {
  return api.post("/voters/", data);
};

export const updateVoter = (id: number, data: any) => {
  return api.put(`/voters/${id}/`, data);
};

export const deleteVoter = (id: number) => {
  return api.delete(`/voters/${id}/`);
};

export const getOrganizations = () => {
  return api.get("/organizations/");
};

export const getgroupsByOrg = (org_id: number) => {
  return api.get(`/groups?org_id=${org_id}`);
};

export const getSemestersBygroup = (group_id: number) => {
  return api.get(`/semesters/group/${group_id}`);
};

export const getAffiliations = () => {
  return api.get("/affiliations/");
};
export const getAffiliationsByOrg = (orgId: number) => {
  return api.get(`/affiliations?org_id=${orgId}`);
};
