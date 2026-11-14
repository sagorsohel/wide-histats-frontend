"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { COUNTRIES, TIMEZONES } from "@/lib/timezones";
import {
  Clock,
  Globe,
  Save,
  Check,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { websites, selectedWebsite, reloadWebsites } = useWebsite();

  // ============================================================
  // Time Zone & Regional State
  // ============================================================
  const [activeSiteId, setActiveSiteId] = useState<string>(
    selectedWebsite?.id || "",
  );
  const [country, setCountry] = useState<string>("Bangladesh");
  const [timezone, setTimezone] = useState<string>("Asia/Dhaka");

  const [savingTz, setSavingTz] = useState(false);
  const [saveTzSuccess, setSaveTzSuccess] = useState(false);
  const [saveTzError, setSaveTzError] = useState<string | null>(null);

  // Default the form to the selected website once it is known.
  useEffect(() => {
    if (!activeSiteId && selectedWebsite?.id) setActiveSiteId(selectedWebsite.id);
  }, [activeSiteId, selectedWebsite?.id]);

  // Load the saved values ONLY when the edited website changes. Background refreshes of
  // the website list must not overwrite what the user is currently editing.
  const loadedFormSiteRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!activeSiteId || loadedFormSiteRef.current === activeSiteId) return;
    const site = websites.find((w) => w.id === activeSiteId);
    if (!site) return;
    loadedFormSiteRef.current = activeSiteId;
    setCountry(site.country || "Bangladesh");
    setTimezone(site.timezone || "Asia/Dhaka");
  }, [activeSiteId, websites]);

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

  return (
    <div className="space-y-5 max-w-4xl pb-12 select-text">
      {/* Top Banner */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your website time zone and regional telemetry configuration
        </p>
      </div>

      {/* Time Zone & Region Configuration */}
      <div className="space-y-5">
        {!websites || websites.length === 0 ? (
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
                        <option
                          key={c.code}
                          value={c.name}
                          className="text-slate-900"
                        >
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
                        <option
                          key={tz.value}
                          value={tz.value}
                          className="text-slate-900"
                        >
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
                  <span>
                    {savingTz ? "Saving Changes..." : "Save Time Zone Settings"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
