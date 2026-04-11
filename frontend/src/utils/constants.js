export const APP_NAME = "\u0905\u0928\u094d\u0928\u0938\u0947\u0924\u0941";

export const STORAGE_KEYS = {
  auth: "annasetu_auth",
  theme: "annasetu_theme",
};

export const ROLE_OPTIONS = ["DONOR", "NGO", "VOLUNTEER"];

export const DONATION_STATUSES = ["PENDING", "ACCEPTED", "PICKED", "DELIVERED"];

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", auth: true, icon: "layout-dashboard" },
  { label: "Donations", to: "/donations", auth: true, icon: "package-search" },
  { label: "Add Donation", to: "/donations/add", auth: true, roles: ["DONOR"], icon: "plus-circle" },
  { label: "Requests", to: "/requests", auth: true, roles: ["NGO", "VOLUNTEER"], icon: "truck" },
  { label: "Analytics", to: "/analytics", auth: true, icon: "bar-chart-3" },
  { label: "Feedback", to: "/feedback", auth: true, icon: "message-square-heart" },
  { label: "Profile", to: "/profile", auth: true, icon: "user-circle" },
];

export const APP_ROUTES = {
  home: "/",
  auth: "/auth",
  dashboard: "/dashboard",
  donations: "/donations",
  addDonation: "/donations/add",
  requests: "/requests",
  analytics: "/analytics",
  feedback: "/feedback",
  profile: "/profile",
};
