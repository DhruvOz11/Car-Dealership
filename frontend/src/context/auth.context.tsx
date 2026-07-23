import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, extractErrorMessage } from "../utils/api";
import type { AuthResponse, User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredToken = () => localStorage.getItem("auth_token");
const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("auth_user");
  try {
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  const applyAuthResponse = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>("/auth/login", { email, password });
      applyAuthResponse(res.data);
    } catch (err) {
      setError(extractErrorMessage(err, "Invalid email or password."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
      applyAuthResponse(res.data);
    } catch (err) {
      setError(extractErrorMessage(err, "Registration failed. Please check your details."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sends the Google ID token to the backend for verification.
  // Requires the /api/auth/google endpoint — see GOOGLE_AUTH_SETUP.md.
  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>("/auth/google", { credential });
      applyAuthResponse(res.data);
    } catch (err) {
      setError(extractErrorMessage(err, "Google sign-in failed. Please try again."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, loginWithGoogle, logout, clearError }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
