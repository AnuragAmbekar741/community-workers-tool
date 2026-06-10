import axios from "axios";

import { toApiError } from "@/lib/api-error";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);
