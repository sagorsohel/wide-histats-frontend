"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  User,
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
} from "@/store/slices/authSlice";
import { fetchWebsites, setWebsites, setSelectedWebsite } from "@/store/slices/websiteSlice";
import { reconnectSocketWithToken } from "@/lib/socket";
import { api } from "@/lib/api";

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
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Background validation of session on mount
    dispatch(fetchCurrentUser()).then((res) => {
      if (fetchCurrentUser.fulfilled.match(res) && res.payload) {
        reconnectSocketWithToken();
        dispatch(fetchWebsites());
      }
    });
  }, [dispatch]);

  const login = async (email: string, password: string): Promise<boolean> => {
    api.clearCache();
    if (typeof window !== "undefined") {
      localStorage.removeItem("histat_selected_website");
    }
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      reconnectSocketWithToken();
      await dispatch(fetchWebsites());
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    api.clearCache();
    if (typeof window !== "undefined") {
      localStorage.removeItem("histat_selected_website");
    }
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      reconnectSocketWithToken();
      await dispatch(fetchWebsites());
      return true;
    }
    return false;
  };

  const logout = async () => {
    await dispatch(logoutUser(false));
    dispatch(setWebsites([]));
    dispatch(setSelectedWebsite(null));
    if (typeof window !== "undefined") {
      localStorage.removeItem("histat_selected_website");
    }
    api.clearCache();
    reconnectSocketWithToken();
  };

  const quickDemoLogin = async (): Promise<boolean> => {
    return login("admin@gmail.com", "sohoj@sohoj");
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

export type { User };
