"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { api } from "@/lib/api";
import { COUNTRIES, TIMEZONES } from "@/lib/timezones";
import {
  Clock,
  Globe,
  Save,
  Check,
  ChevronDown,
  User,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { websites, selectedWebsite, reloadWebsites } = useWebsite();

  // Tab State: "timezone" | "profile"
  const [activeTab, setActiveTab] = useState<"timezone" | "profile">("timezone");

  // ============================================================
  // TAB 1: Time Zone & Regional State
  // ============================================================
  const [activeSiteId, setActiveSiteId] = useState<string>(selectedWebsite?.id || "");
  const [country, setCountry] = useState<string>("Bangladesh");
  const [timezone, setTimezone] = useState<string>("Asia/Dhaka");

  const [savingTz, setSavingTz] = useState(false);
  const [saveTzSuccess, setSaveTzSuccess] = useState(false);
  const [saveTzError, setSaveTzError] = useState<string | null>(null);

  // Sync site with selected website
  useEffect(() => {
    const site = websites.find((w) => w.id === activeSiteId) || selectedWebsite;
    if (site) {
      setActiveSiteId(site.id);
      setCountry(site.country || "Bangladesh");
      setTimezone(site.timezone || "Asia/Dhaka");
    }
  }, [activeSiteId, selectedWebsite, websites]);

  const handleCountryChange = (selectedCountryName: string) => {
    setCountry(selectedCountryName);
    const matched = COUNTRIES.find((c) => c.name === selectedCountryName);
    if (matched && matched.defaultTimezone) {
      setTimezone(matched.defaultTimezone);
    }
  };

  const handleSaveTz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiteId) return;

    setSavingTz(true);
    setSaveTzError(null);
    setSaveTzSuccess(false);

    try {
      const res = await api.patch(`/api/v1/websites/${activeSiteId}`, {
        country,
        timezone,
      });

      if (res.success) {
        setSaveTzSuccess(true);
        api.clearCache();
        await reloadWebsites();
        setTimeout(() => setSaveTzSuccess(false), 3500);
      } else {
        setSaveTzError(res.message || "Failed to update time zone settings.");
      }
    } catch (err: any) {
      setSaveTzError(err.message || "An error occurred while saving.");
    } finally {
      setSavingTz(false);
    }
  };

  // Compute live clock time in chosen timezone
  const [currentTimeInTz, setCurrentTimeInTz] = useState("");
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          dateStyle: "full",
          timeStyle: "medium",
        }).format(new Date());
        setCurrentTimeInTz(timeStr);
      } catch {
        setCurrentTimeInTz(new Date().toLocaleString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  // ============================================================
  // TAB 2: Profile & Password State
  // ============================================================
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
      const res = await api.patch<{ id: string; name: string; email: string; createdAt: string }>(
        "/api/v1/auth/profile",
        { name: name.trim() }
      );

      if (res.success && res.data) {
        setProfileSuccess(true);
        dispatch(setUser(res.data));
        setTimeout(() => setProfileSuccess(false), 3500);
      } else {
        setProfileError(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setProfileError(err.message || "An error occurred while updating profile.");
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
      setPasswordError(err.message || "An error occurred while changing password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl pb-12">
      {/* Top Banner */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your website regional telemetry and account profile security
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("timezone")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all cursor-pointer border-b-2 -mb-px ${
            activeTab === "timezone"
              ? "border-[#1d5b9f] text-[#1d5b9f] bg-white shadow-2xs font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === "timezone" ? "text-[#1d5b9f]" : "text-slate-400"}`} />
          <span>Time Zone & Region</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all cursor-pointer border-b-2 -mb-px ${
            activeTab === "profile"
              ? "border-[#1d5b9f] text-[#1d5b9f] bg-white shadow-2xs font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
          }`}
        >
          <User className={`w-4 h-4 ${activeTab === "profile" ? "text-[#1d5b9f]" : "text-slate-400"}`} />
          <span>Profile & Password</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: Time Zone & Region Configuration                      */}
      {/* ============================================================ */}
      {activeTab === "timezone" && (
        <div className="space-y-5 animate-fade-in">
          {(!websites || websites.length === 0) ? (
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1455bb] mb-3 shadow-2xs">
                <Globe className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1.5">
                No websites registered yet
              </h2>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Please register a website first to configure time zone, regional tracking, and analytics preferences.
              </p>
              <Link
                href="/control-panel"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Register your first website
              </Link>
            </div>
          ) : (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
                  <Clock className="w-5 h-5 text-[#1d5b9f]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Country & Time Zone Configuration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Analytics, diurnal charts, and daily stats will calculate using this time zone
                  </p>
                </div>
              </div>

              {saveTzSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Time zone settings saved successfully! All analytics graphs and daily breakdowns will now display in {timezone}.
                  </span>
                </div>
              )}

              {saveTzError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveTzError}</span>
                </div>
              )}

              <form onSubmit={handleSaveTz} className="space-y-5">
                {/* Website Selection (if multiple) */}
                {websites.length > 1 && (
                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">
                      Target Website
                    </label>
                    <div className="relative max-w-md">
                      <select
                        value={activeSiteId}
                        onChange={(e) => setActiveSiteId(e.target.value)}
                        className="w-full bg-white border border-[#c4d1db] text-slate-900 font-semibold text-xs sm:text-sm px-3 py-2 rounded focus:outline-none focus:border-[#1d5b9f] appearance-none cursor-pointer pr-8 shadow-2xs"
                      >
                        {websites.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.domain})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Country & Time zone Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                  {/* Country */}
                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full bg-white border border-[#c4d1db] text-[#1b62b3] font-medium text-xs sm:text-sm px-3 py-2 rounded focus:outline-none focus:border-[#1d5b9f] appearance-none cursor-pointer pr-8 shadow-2xs"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name} className="text-slate-900">
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#1b62b3] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Time zone */}
                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">
                      Time zone
                    </label>
                    <div className="relative">
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-white border border-[#c4d1db] text-[#1b62b3] font-medium text-xs sm:text-sm px-3 py-2 rounded focus:outline-none focus:border-[#1d5b9f] appearance-none cursor-pointer pr-8 shadow-2xs"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value} className="text-slate-900">
                            {tz.label} {tz.offset}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#1b62b3] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Live Clock Display in Chosen Time Zone */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-2xl">
                  <span className="text-xs text-slate-600 font-medium">
                    Current Time in <b>{timezone}</b>:
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1d5b9f]">
                    {currentTimeInTz || "Calculating..."}
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingTz}
                    className="px-5 py-2.5 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingTz ? "Saving Changes..." : "Save Time Zone Settings"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: Profile & Password Management                         */}
      {/* ============================================================ */}
      {activeTab === "profile" && (
        <div className="space-y-5 animate-fade-in">
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
                  <span>Email address cannot be changed for account security and integrity.</span>
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
                <span>Password changed successfully! You can now use your new password.</span>
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
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <span>{savingPassword ? "Updating Password..." : "Change Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
