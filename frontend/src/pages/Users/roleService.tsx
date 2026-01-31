import api from "../../utils/api";

export const createRole = (data: { name: string }) => {
  return api.post("/auth/roles", data);
};

export const getRoles = () => {
  return api.get("/auth/roles");
};

export const deleteRole = (id: number) => {
  return api.delete(`/auth/roles/${id}`);
};
