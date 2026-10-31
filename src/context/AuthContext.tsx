"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  quickDemoLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get<User>("/api/v1/auth/me");
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          api.setToken(null);
        }
      } catch {
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await api.post<{ user: User; accessToken: string }>("/api/v1/auth/login", {
      email,
      password,
    });

    if (res.success && res.data) {
      api.setToken(res.data.accessToken);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const res = await api.post<{ user: User; accessToken: string }>("/api/v1/auth/register", {
      name,
      email,
      password,
    });

    if (res.success && res.data) {
      api.setToken(res.data.accessToken);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await api.post("/api/v1/auth/logout");
    api.setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (): Promise<boolean> => {
    return login("admin@widehistat.com", "Password123!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
