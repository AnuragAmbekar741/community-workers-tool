import axios from "axios";

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : error.message || `Request failed: ${status}`;
    return new ApiError(message, status, body);
  }

  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    error instanceof Error ? error.message : "Unknown error",
    0,
  );
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
