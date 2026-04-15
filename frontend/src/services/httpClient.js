import axios from "axios";
import { STORAGE_KEYS } from "../utils/constants";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost ? "http://localhost:8081" : window.location.origin);

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const rawAuth = localStorage.getItem(STORAGE_KEYS.auth);
  if (!rawAuth) return config;

  try {
    const auth = JSON.parse(rawAuth);
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.auth);
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      window.dispatchEvent(
        new CustomEvent("annasetu:auth-expired", {
          detail: {
            status,
            message: "Session expired. Please login again.",
          },
        }),
      );
    }

    const normalizedError = {
      ...error,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong. Please try again.",
    };

    return Promise.reject(normalizedError);
  },
);

export { apiBaseUrl };
export default httpClient;
