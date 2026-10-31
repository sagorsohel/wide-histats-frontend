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
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await dispatch(loginUser({ email, password }));
    return loginUser.fulfilled.match(result);
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const result = await dispatch(registerUser({ name, email, password }));
    return registerUser.fulfilled.match(result);
  };

  const logout = async () => {
    await dispatch(logoutUser(false));
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

export type { User };
