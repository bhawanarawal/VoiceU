import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const roles = (
    JSON.parse(localStorage.getItem("roles") || "[]") as string[]
  ).map((r) => r.toLowerCase());

  if (!token) return <Navigate to="/signin" replace />;

  if (!roles.includes("admin") && !roles.includes("superadmin")) {
    return <Navigate to="/Home" replace />;
  }

  return <Outlet />;
}
