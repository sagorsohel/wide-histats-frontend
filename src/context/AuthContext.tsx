"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  User,
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  hydrateFromStorage,
  logout as logoutAction,
} from "@/store/slices/authSlice";
import { fetchWebsites, setWebsites, setSelectedWebsite } from "@/store/slices/websiteSlice";
import { clearAllRealtime } from "@/store/slices/realtimeSlice";
import { reconnectSocketWithToken, disconnectSocket } from "@/lib/socket";
import { api } from "@/lib/api";

export interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** True once we know whether the visitor is signed in (storage read + /me check). */
  initialized: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, loading, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Read persisted session on the client only (avoids SSR hydration mismatch),
    // then validate it against the backend in the background.
    dispatch(hydrateFromStorage());
    // (WebsiteProvider loads the website list as soon as a user is known.)
    dispatch(fetchCurrentUser()).then((res) => {
      if (fetchCurrentUser.fulfilled.match(res) && res.payload) {
        reconnectSocketWithToken();
      }
    });
  }, [dispatch]);

  // The API client fires this when the refresh token is rejected (session revoked/expired).
  useEffect(() => {
    const handleExpired = () => {
      dispatch(logoutAction());
      dispatch(setWebsites([]));
      dispatch(setSelectedWebsite(null));
      dispatch(clearAllRealtime());
      disconnectSocket();
    };
    window.addEventListener("histat:auth_expired", handleExpired);
    return () => window.removeEventListener("histat:auth_expired", handleExpired);
  }, [dispatch]);

  const resetClientState = () => {
    api.clearCache();
    if (typeof window !== "undefined") {
      localStorage.removeItem("histat_selected_website");
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    resetClientState();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      reconnectSocketWithToken();
      await dispatch(fetchWebsites());
      return { success: true };
    }
    return { success: false, message: (result.payload as string) || undefined };
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    resetClientState();
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      reconnectSocketWithToken();
      await dispatch(fetchWebsites());
      return { success: true };
    }
    return { success: false, message: (result.payload as string) || undefined };
  };

  const logout = async () => {
    await dispatch(logoutUser(false));
    dispatch(setWebsites([]));
    dispatch(setSelectedWebsite(null));
    dispatch(clearAllRealtime());
    resetClientState();
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        register,
        logout,
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
