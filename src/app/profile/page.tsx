"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { api } from "@/lib/api";
import {
  User,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Profile Information State
  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError("Full Name cannot be empty.");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.patch<{
        id: string;
        name: string;
        email: string;
        createdAt: string;
      }>("/api/v1/auth/profile", { name: name.trim() });

      if (res.success && res.data) {
        setProfileSuccess(true);
        dispatch(setUser(res.data));
        setTimeout(() => setProfileSuccess(false), 3500);
      } else {
        setProfileError(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setProfileError(
        err.message || "An error occurred while updating profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await api.post("/api/v1/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        setPasswordError(res.message || "Failed to change password.");
      }
    } catch (err: any) {
      setPasswordError(
        err.message || "An error occurred while changing password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl pb-12 select-text">
      {/* Top Banner */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Manage Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account profile details and security credentials
        </p>
      </div>

      <div className="space-y-5">
        {/* Card 1: Edit Profile (Full Name editable, Email NOT changeable) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
              <User className="w-5 h-5 text-[#1d5b9f]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Profile Information
              </h3>
              <p className="text-xs text-slate-500">
                Update your display name. Email address cannot be changed for security.
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile name updated successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            {/* Full Name (Editable) */}
            <div>
              <label className="block text-slate-800 text-xs font-bold mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-white border border-[#c4d1db] text-slate-900 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#1d5b9f] shadow-2xs"
                required
              />
            </div>

            {/* Email Address (Read-only, CANNOT be changed) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-800 text-xs font-bold">
                  Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Read-Only
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || "admin@widehistat.com"}
                  disabled
                  readOnly
                  className="w-full bg-slate-100/90 border border-slate-200 text-slate-500 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg cursor-not-allowed select-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>
                  Email address cannot be changed for account security and integrity.
                </span>
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? "Saving Name..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Password Change */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Key className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Change Password
              </h3>
              <p className="text-xs text-slate-500">
                Update your login password to keep your dashboard account secure
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Password changed successfully! You can now use your new password.
              </span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="block text-slate-800 text-xs font-bold mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-white border border-[#c4d1db] text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#1d5b9f] pr-10 shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-slate-800 text-xs font-bold mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full bg-white border border-[#c4d1db] text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#1d5b9f] pr-10 shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-slate-800 text-xs font-bold mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-white border border-[#c4d1db] text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#1d5b9f] pr-10 shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>
                  {savingPassword ? "Updating Password..." : "Change Password"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

