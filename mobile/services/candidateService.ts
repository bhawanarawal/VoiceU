import api from "./api";

export const getApprovedCandidatesByElection = (electionId: number) => {
  return api.get(`/candidates/approved/by-election/${electionId}`);
};

export const voteForCandidate = (data: { candidate_id: number; election_id: number }) => {
  return api.post("/votes/", data);
};
