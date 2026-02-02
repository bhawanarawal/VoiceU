import api from "./api";

export const getMyVoter = () => api.get("/voters/me");

export const createVoter = (data: {
  org_id: number;
  group_ids: number[];
}) => api.post("/voters/", data);

export const getOrganizations = () => api.get("/organizations/");

export const getGroupsByOrg = (org_id: number) =>
  api.get(`/groups?org_id=${org_id}`);
