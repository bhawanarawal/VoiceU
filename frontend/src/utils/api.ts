// src/utils/api.ts
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // <-- Replace with your FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: add interceptors for auth / error handling
// api.interceptors.request.use(config => { ... });
// api.interceptors.response.use(response => { ... });

export default api;
