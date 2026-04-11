import httpClient from "./httpClient";

export const authService = {
  register: (payload) => httpClient.post("/api/auth/register", payload),
  login: (payload) => httpClient.post("/api/auth/login", payload),
};

export const donationService = {
  add: (payload) => httpClient.post("/api/donations", payload),
  list: () => httpClient.get("/api/donations"),
  get: (id) => httpClient.get(`/api/donations/${id}`),
  nearby: (latitude, longitude, radiusKm = 10) =>
    httpClient.get("/api/donations/nearby", {
      params: { latitude, longitude, radiusKm },
    }),
  nearest: (params = {}) =>
    httpClient.get("/api/donations/nearest", { params }),
  search: (params = {}) => httpClient.get("/api/donations/search", { params }),
  stats: () => httpClient.get("/api/donations/stats"),
};

export const requestService = {
  accept: (donationId) =>
    httpClient.post("/api/requests/accept", { donationId }),
  updateStatus: (requestId, status) =>
    httpClient.put("/api/requests/status", { requestId, status }),
  myRequests: () => httpClient.get("/api/requests/my"),
};

export const feedbackService = {
  create: (payload) => httpClient.post("/api/feedback", payload),
  list: () => httpClient.get("/api/feedback"),
};

export const notificationService = {
  list: () => httpClient.get("/api/notifications"),
  markRead: (id) => httpClient.put(`/api/notifications/${id}/read`),
};

export const dashboardService = {
  stats: () => httpClient.get("/api/dashboard/stats"),
};

export const uploadService = {
  image: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return httpClient.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const userService = {
  profile: () => httpClient.get("/api/users/profile"),
  updateLocation: (latitude, longitude) =>
    httpClient.put("/api/users/location", { latitude, longitude }),
};

export const wsBaseUrl =
  import.meta.env.VITE_WS_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8081`;
