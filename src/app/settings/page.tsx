"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { COUNTRIES, TIMEZONES } from "@/lib/timezones";
import { getSite7DigitId } from "@/lib/utils";
import {
  Clock,
  Globe,
  Save,
  Check,
  ChevronDown,
  AlertCircle,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  ShieldCheck,
  LayoutGrid,
  Activity,
  BarChart2,
  Compass,
  Layers,
  Smartphone,
} from "lucide-react";

const ALL_PAGES = [
  {
    id: "summary",
    name: "Overview",
    href: "/summary",
    icon: LayoutGrid,
    desc: "Summary metrics, diurnal activity & visitors",
  },
  {
    id: "realtime",
    name: "User Online",
    href: "/realtime",
    icon: Activity,
    desc: "Live active visitors & real IP telemetry stream",
  },
  {
    id: "traffic-stats",
    name: "Traffic Stats",
    href: "/traffic-stats",
    icon: BarChart2,
    desc: "Time-series traffic trends & daily views",
  },
  {
    id: "sources",
    name: "Referring Site",
    href: "/sources",
    icon: Compass,
    desc: "Referrers, direct visits & search traffic",
  },
  {
    id: "pages",
    name: "Traffic Content",
    href: "/pages",
    icon: Layers,
    desc: "Most visited URLs & page headlines",
  },
  {
    id: "devices",
    name: "Browser & OS",
    href: "/devices",
    icon: Smartphone,
    desc: "Client hardware, browsers & platforms",
  },
  {
    id: "geography",
    name: "Geolocation",
    href: "/geography",
    icon: Globe,
    desc: "Country & metropolitan city breakdown",
  },
];

export default function SettingsPage() {
  const { websites, selectedWebsite, reloadWebsites } = useWebsite();

  const [activeSiteId, setActiveSiteId] = useState<string>(
    selectedWebsite?.id || "",
  );

  // Default the form to the selected website once it is known.
  useEffect(() => {
    if (websites.length > 0) {
      const exists = websites.some((w) => w.id === activeSiteId);
      if (!exists) {
        const fallback =
          (selectedWebsite?.id && websites.find((w) => w.id === selectedWebsite.id)?.id) ||
          websites[0].id;
        setActiveSiteId(fallback);
      }
    } else if (!activeSiteId && selectedWebsite?.id) {
      setActiveSiteId(selectedWebsite.id);
    }
  }, [websites, activeSiteId, selectedWebsite?.id]);

  // ============================================================
  // SECTION 1: Public Access & Page Visibility State
  // ============================================================
  const [isPublic, setIsPublic] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>(
    ALL_PAGES.map((p) => p.id),
  );
  const [allPagesChecked, setAllPagesChecked] = useState(true);

  const [savingPublic, setSavingPublic] = useState(false);
  const [savePublicSuccess, setSavePublicSuccess] = useState(false);
  const [savePublicError, setSavePublicError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ============================================================
  // SECTION 2: Time Zone & Regional State
  // ============================================================
  const [country, setCountry] = useState<string>("Bangladesh");
  const [timezone, setTimezone] = useState<string>("Asia/Dhaka");

  const [savingTz, setSavingTz] = useState(false);
  const [saveTzSuccess, setSaveTzSuccess] = useState(false);
  const [saveTzError, setSaveTzError] = useState<string | null>(null);

  // Load the saved values ONLY when the active website changes.
  const loadedSiteRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!activeSiteId || loadedSiteRef.current === activeSiteId) return;
    const site = websites.find((w) => w.id === activeSiteId);
    if (!site) return;
    loadedSiteRef.current = activeSiteId;

    // Timezone & Country
    setCountry(site.country || "Bangladesh");
    setTimezone(site.timezone || "Asia/Dhaka");

    // Public Access & Pages
    const siteIsPublic = Boolean(site.isPublic);
    setIsPublic(siteIsPublic);

    const raw = (site.publicPages || (siteIsPublic ? "all" : ""))
      .toLowerCase()
      .trim();

    if (!raw || raw === "none") {
      setSelectedPages([]);
      setAllPagesChecked(false);
    } else if (raw === "all" || raw === "*") {
      setSelectedPages(ALL_PAGES.map((p) => p.id));
      setAllPagesChecked(true);
    } else {
      const list = raw.split(",").map((s) => s.trim().toLowerCase());
      setSelectedPages(list);
      setAllPagesChecked(list.length === ALL_PAGES.length);
    }
  }, [activeSiteId, websites]);

  // When user switches target website in dropdown
  const handleSiteChange = (newSiteId: string) => {
    setActiveSiteId(newSiteId);
    loadedSiteRef.current = null;
  };

  // Toggle "All Pages"
  const handleToggleAllPages = (checked: boolean) => {
    setAllPagesChecked(checked);
    if (checked) {
      setSelectedPages(ALL_PAGES.map((p) => p.id));
    } else {
      setSelectedPages([]);
    }
  };

  // Toggle individual page
  const handleTogglePage = (pageId: string) => {
    setSelectedPages((prev) => {
      let next: string[];
      if (prev.includes(pageId)) {
        next = prev.filter((id) => id !== pageId);
      } else {
        next = [...prev, pageId];
      }
      setAllPagesChecked(next.length === ALL_PAGES.length);
      return next;
    });
  };

  // Save Public Access Settings
  const handleSavePublicAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiteId) return;

    setSavingPublic(true);
    setSavePublicError(null);
    setSavePublicSuccess(false);

    // Public means all pages; private means none (backend only checks isPublic)
    const payloadPages = isPublic ? "all" : "none";

    try {
      const res = await api.patch(`/api/v1/websites/${activeSiteId}`, {
        isPublic,
        publicPages: payloadPages,
      });

      if (res.success) {
        setSavePublicSuccess(true);
        api.clearCache();
        await reloadWebsites();
        setTimeout(() => setSavePublicSuccess(false), 3500);
      } else {
        setSavePublicError(
          res.message || "Failed to update public access settings.",
        );
      }
    } catch (err: any) {
      setSavePublicError(
        err.message || "An error occurred while saving public access.",
      );
    } finally {
      setSavingPublic(false);
    }
  };

  // Save Timezone Settings
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

  // Live clock
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

  // Compute public share link (defaults to /summary or first selected public page)
  const currentSite =
    websites.find((w) => w.id === activeSiteId) ||
    websites.find((w) => w.id === selectedWebsite?.id) ||
    websites[0] ||
    selectedWebsite;
  const site7Digit = getSite7DigitId(currentSite);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const firstPage = selectedPages.includes("summary")
    ? "/summary"
    : selectedPages[0]
      ? `/${selectedPages[0]}`
      : "/summary";
  const publicUrl = `${origin}${firstPage}?id=${site7Digit}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl pb-12 select-text">
      {/* Top Banner */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your website public page access, time zone, and regional telemetry
          </p>
        </div>

        {/* Global Website Selector if multiple */}
        {websites.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600">Website:</span>
            <div className="relative">
              <select
                value={activeSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="bg-white border border-[#c4d1db] text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#1d5b9f] appearance-none cursor-pointer pr-7 shadow-2xs"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {!websites || websites.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1455bb] mb-3 shadow-2xs">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-1.5">
            No websites registered yet
          </h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Please register a website first to configure public page visibility, time zone, and analytics preferences.
          </p>
          <Link
            href="/control-panel"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Register your first website
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ============================================================ */}
          {/* CARD 1: Public Page Sharing & Access Control                 */}
          {/* ============================================================ */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Public Page Access &amp; Sharing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose which analytics pages visitors can view without signing in, or make all pages public
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                  isPublic && selectedPages.length > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {isPublic && selectedPages.length > 0 ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Public ({allPagesChecked ? "All Pages" : `${selectedPages.length} Pages`})</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Private</span>
                  </>
                )}
              </span>
            </div>

            {savePublicSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Public page permissions saved successfully! Unauthenticated visitors can now view the selected pages.
                </span>
              </div>
            )}

            {savePublicError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{savePublicError}</span>
              </div>
            )}

            <form onSubmit={handleSavePublicAccess} className="space-y-5">
              {/* Primary Access Mode Switcher */}
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-2">
                  Access Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                  {/* Private Option */}
                  <div
                    onClick={() => setIsPublic(false)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      !isPublic
                        ? "border-[#1d5b9f] bg-blue-50/50 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        !isPublic
                          ? "border-[#1d5b9f] bg-[#1d5b9f]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {!isPublic && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-700" />
                        <span className="font-extrabold text-xs text-slate-900">
                          Private (Login Required)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Only you can access this website&apos;s stats after signing in.
                      </p>
                    </div>
                  </div>

                  {/* Public Option */}
                  <div
                    onClick={() => setIsPublic(true)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      isPublic
                        ? "border-[#1d5b9f] bg-blue-50/50 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        isPublic
                          ? "border-[#1d5b9f] bg-[#1d5b9f]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isPublic && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-extrabold text-xs text-slate-900">
                          Public Access (Login ছাডাই)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Allow visitors to view chosen pages without creating an account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Permissions Checklist (Visible when Public is chosen) */}
              {isPublic && (
                <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Choose Public Pages
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Select which sections are visible to unauthenticated visitors
                      </p>
                    </div>

                    {/* Master "All Pages" Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAllPages(!allPagesChecked)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                        allPagesChecked
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={allPagesChecked}
                        onChange={() => {}}
                        className="rounded cursor-pointer pointer-events-none accent-blue-600"
                      />
                      <span>All Pages Public (সব পেজ)</span>
                    </button>
                  </div>

                  {/* 7 Interactive Page Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {ALL_PAGES.map((page) => {
                      const Icon = page.icon;
                      const isChecked = selectedPages.includes(page.id);

                      return (
                        <div
                          key={page.id}
                          onClick={() => handleTogglePage(page.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                            isChecked
                              ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                              : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 opacity-80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded cursor-pointer pointer-events-none accent-blue-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <Icon
                                className={`w-3.5 h-3.5 ${
                                  isChecked ? "text-blue-600" : "text-slate-400"
                                }`}
                              />
                              <span
                                className={`font-bold text-xs truncate ${
                                  isChecked
                                    ? "text-slate-900"
                                    : "text-slate-600"
                                }`}
                              >
                                {page.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                              {page.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Direct Public Share URL Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>Public Share URL</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Site ID: {site7Digit}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 truncate select-all">
                        {publicUrl}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </a>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Visitors opening this link can view the selected public pages without login. (Settings &amp; Profile pages always require admin sign in).
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPublic}
                  className="px-5 py-2.5 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {savingPublic
                      ? "Saving Permissions..."
                      : "Save Public Access Settings"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: Country & Time Zone Configuration                    */}
          {/* ============================================================ */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
                <Clock className="w-5 h-5 text-[#1d5b9f]" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Country &amp; Time Zone Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Analytics, diurnal charts, and daily stats calculate using this time zone
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
        </div>
      )}
    </div>
  );
}
