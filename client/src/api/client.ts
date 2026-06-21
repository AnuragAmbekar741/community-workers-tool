import axios from "axios";

import { clearAuthToken, getAuthToken } from "@/lib/auth-token";
import { toApiError } from "@/lib/api-error";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      if (!url.endsWith("/auth/login")) {
        clearAuthToken();
      }
    }
    return Promise.reject(toApiError(error));
  },
);
