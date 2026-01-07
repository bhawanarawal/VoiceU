import api from "../../utils/api";

export const getCandidates = () => {
  return api.get("/candidates/");
};

export const getCandidateById = (id: number) => {
  return api.get(`/candidates/${id}/`);
};

export const createCandidate = (data: FormData) => {
  return api.post("/candidates/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateCandidate = (id: number, data: FormData) => {
  return api.put(`/candidates/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteCandidate = (id: number) => {
  return api.delete(`/candidates/${id}/`);
};

export const updateCandidateApproval = (
  id: number,
  status: "approved" | "rejected"
) => {
  return api.patch(`/candidates/${id}/approval`, {
    approval_status: status,
  });
};

export const getApprovedCandidatesByElection = (electionId: number) => {
  return api.get(`/candidates/approved/by-election/${electionId}`);
};

export const voteForCandidate = (data: {
  voter_id: number;
  candidate_id: number;
  election_id: number;
}) => api.post("/api/votes", data);
