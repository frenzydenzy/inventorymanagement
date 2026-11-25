import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FastApiValidationDetailItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface FastApiErrorBody {
  detail?: string | FastApiValidationDetailItem[];
}

function extractMessage(error: AxiosError<FastApiErrorBody>): string {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  if (error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<FastApiErrorBody>) => {
    const status = error.response?.status ?? null;
    const message = extractMessage(error);
    return Promise.reject(new ApiError(message, status));
  }
);
