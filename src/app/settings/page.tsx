"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { COUNTRIES, TIMEZONES } from "@/lib/timezones";
import {
  Settings,
  Clock,
  Globe,
  Save,
  Check,
  ChevronDown,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { websites, selectedWebsite, setSelectedWebsite, reloadWebsites } = useWebsite();

  const [activeSiteId, setActiveSiteId] = useState<string>(selectedWebsite?.id || "");
  const [country, setCountry] = useState<string>("Bangladesh");
  const [timezone, setTimezone] = useState<string>("Asia/Dhaka");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync with selected website
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiteId) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await api.patch(`/api/v1/websites/${activeSiteId}`, {
        country,
        timezone,
      });

      if (res.success) {
        setSaveSuccess(true);
        api.clearCache();
        await reloadWebsites();
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(res.message || "Failed to update time zone settings.");
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
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

  if (!websites || websites.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1455bb] mb-4 shadow-sm">
          <Globe className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
          No websites registered yet
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Please register a website first to configure time zone, regional tracking, and analytics preferences.
        </p>
        <Link
          href="/control-panel"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          Register your first website
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Time Zone
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure country, time zone, and system telemetry for accurate statistics
        </p>
      </div>

      {/* Website Time Zone & Region Card (Matching Image 2) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
            <Clock className="w-5 h-5 text-[#1d5b9f]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Country & Time Zone Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Analytics, diurnal charts, and daily stats will calculate using this time zone
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Time zone settings saved successfully! All analytics graphs and daily breakdowns will now display in {timezone}.
            </span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
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

          {/* Exact Matching layout of Image 2: Country & Time zone */}
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
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Time Zone Settings"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Owner Account</h3>
            <p className="text-xs text-slate-500">Logged-in account credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Full Name</span>
            <span className="font-bold text-slate-900 text-sm">
              {user?.name || "Administrator"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Email Address</span>
            <span className="font-bold text-slate-900 text-sm">
              {user?.email || "admin@widehistat.com"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
