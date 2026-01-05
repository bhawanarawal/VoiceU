import api from "../../utils/api";

// ✅ Get all candidates (admin)
export const getCandidates = () => {
  return api.get("/candidates/");
};

// ✅ Get single candidate by ID
export const getCandidateById = (id: number) => {
  return api.get(`/candidates/${id}/`);
};

// ✅ Apply / Create candidate
export const createCandidate = (data: FormData) => {
  return api.post("/candidates/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Update candidate (position, manifesto, photo)
export const updateCandidate = (id: number, data: FormData) => {
  return api.put(`/candidates/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Soft delete candidate (admin)
export const deleteCandidate = (id: number) => {
  return api.delete(`/candidates/${id}/`);
};

// ✅ Approve or reject candidate (admin)
export const updateCandidateApproval = (
  id: number,
  status: "approved" | "rejected"
) => {
  return api.patch(`/candidates/${id}/approval`, {
    approval_status: status,
  });
};
