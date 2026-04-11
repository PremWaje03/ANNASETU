import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";
import { getTokenExpiryMs } from "../utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.auth);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEYS.auth);
      return null;
    }
  });

  useEffect(() => {
    if (!auth) {
      localStorage.removeItem(STORAGE_KEYS.auth);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    const handler = () => setAuth(null);
    window.addEventListener("annasetu:auth-expired", handler);
    return () => window.removeEventListener("annasetu:auth-expired", handler);
  }, []);

  useEffect(() => {
    if (!auth?.token) return undefined;

    const expiresAt = getTokenExpiryMs(auth.token);
    if (!expiresAt) return undefined;

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setAuth(null);
      return undefined;
    }

    const timer = setTimeout(() => {
      setAuth(null);
      window.dispatchEvent(
        new CustomEvent("annasetu:auth-expired", {
          detail: { status: 401, message: "Session expired. Please login again." },
        })
      );
    }, remaining);

    return () => clearTimeout(timer);
  }, [auth?.token]);

  const login = async (payload) => {
    const { data } = await authService.login(payload);
    setAuth(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    setAuth(data);
    return data;
  };

  const logout = () => {
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      auth,
      user: auth
        ? {
            id: auth.id,
            name: auth.name,
            email: auth.email,
            role: auth.role,
            latitude: auth.latitude,
            longitude: auth.longitude,
          }
        : null,
      token: auth?.token || null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
      setAuth,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}