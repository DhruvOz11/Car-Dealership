import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is missing/expired — clear the session and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const extractErrorMessage = (error: unknown, fallback: string): string => {
  const axiosErr = error as { response?: { data?: { error?: unknown } } };
  const raw = axiosErr.response?.data?.error;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "formErrors" in raw) {
    const flat = raw as { formErrors: string[]; fieldErrors: Record<string, string[]> };
    const fieldMsg = Object.values(flat.fieldErrors ?? {}).flat()[0];
    return fieldMsg ?? flat.formErrors[0] ?? fallback;
  }
  return fallback;
};
