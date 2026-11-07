"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { PageStat } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import {
  FileText,
  LogIn,
  LogOut,
  ExternalLink,
  Link2,
  Eye,
  Users,
  Compass,
} from "lucide-react";
import { useTabFocus } from "@/hooks/useTabFocus";

interface TitleItem {
  title: string;
  samplePath: string;
  pageviews: number;
  visitors: number;
}

export default function PagesReportPage() {
  const { selectedWebsite } = useWebsite();

  const [range, setRange] = useState<RangeOption>("today");
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(null);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [landingPages, setLandingPages] = useState<
    { path: string; sessions: number }[]
  >([]);
  const [exitPages, setExitPages] = useState<
    { path: string; sessions: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback((option: RangeOption) => {
    const now = new Date();
    let from = new Date();
    if (option === "today") from.setHours(0, 0, 0, 0);
    else if (option === "yesterday") {
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
    } else if (option === "7d") from.setDate(from.getDate() - 7);
    else if (option === "30d") from.setDate(from.getDate() - 30);

    return { from: from.toISOString(), to: now.toISOString() };
  }, []);

  const hasDataRef = useRef(false);
  const activeSiteIdRef = useRef<string | null>(selectedWebsite?.id || null);
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadPageData = useCallback(
    async (
      isSilent = false,
      overrideSiteId?: string,
      overrideWindow?: CustomDateWindow | null,
    ) => {
      const siteId = overrideSiteId || activeSiteIdRef.current;
      if (!siteId) return;
      const win = overrideWindow !== undefined ? overrideWindow : customWindow;
      let from: string;
      let to: string;
      if (win) {
        from = win.from;
        to = win.to;
      } else {
        const dates = getDateRange(range);
        from = dates.from;
        to = dates.to;
      }
      const q = `websiteId=${siteId}&from=${from}&to=${to}&limit=50`;

      if (!isSilent && !hasDataRef.current) {
        const cached = api.getCached<PageStat[]>(`/api/v1/analytics/pages?${q}`);
        if (cached?.data) {
          setPages(cached.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const [pRes, landRes, exitRes] = await Promise.all([
          api.get<PageStat[]>(`/api/v1/analytics/pages?${q}`),
          api.get<{ path: string; sessions: number }[]>(
            `/api/v1/analytics/landing-pages?${q}`,
          ),
          api.get<{ path: string; sessions: number }[]>(
            `/api/v1/analytics/exit-pages?${q}`,
          ),
        ]);

        // Strict race condition check: if user switched website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (pRes.success && pRes.data) setPages(pRes.data);
        if (landRes.success && landRes.data) setLandingPages(landRes.data);
        if (exitRes.success && exitRes.data) setExitPages(exitRes.data);
        hasDataRef.current = true;
      } catch (err) {
        console.error(err);
      } finally {
        if (siteId === activeSiteIdRef.current) {
          setLoading(false);
        }
      }
    },
    [range, customWindow, getDateRange],
  );

  const handleRangeChange = (r: RangeOption) => {
    setRange(r);
    setCustomWindow(null);
    hasDataRef.current = false;
    loadPageData(false, undefined, null);
  };

  const handleCustomRangeChange = (win: CustomDateWindow | null) => {
    setCustomWindow(win);
    hasDataRef.current = false;
    loadPageData(false, undefined, win);
  };

  // Instantly handle website switcher change in Pages report
  const prevWebsiteIdRef = useRef<string | null>(selectedWebsite?.id || null);

  useEffect(() => {
    if (selectedWebsite?.id && selectedWebsite.id !== prevWebsiteIdRef.current) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      setPages([]);
      setLandingPages([]);
      setExitPages([]);
      hasDataRef.current = false;
      setLoading(true);
      loadPageData(false, selectedWebsite.id);
    } else if (selectedWebsite?.id && !hasDataRef.current) {
      loadPageData(false, selectedWebsite.id);
    }
  }, [selectedWebsite?.id, loadPageData]);

  // Listen to global website changed event for immediate 0ms update
  useEffect(() => {
    const handleWebsiteChanged = (e: any) => {
      const newSite = e.detail;
      if (newSite?.id) {
        prevWebsiteIdRef.current = newSite.id;
        setPages([]);
        setLandingPages([]);
        setExitPages([]);
        hasDataRef.current = false;
        setLoading(true);
        loadPageData(false, newSite.id);
      }
    };
    window.addEventListener("histat:website_changed", handleWebsiteChanged);
    return () =>
      window.removeEventListener("histat:website_changed", handleWebsiteChanged);
  }, [loadPageData]);

  // Auto-refresh when user returns to this tab
  useTabFocus(() => loadPageData(true));

  // Silent sync on socket reconnect or network restore
  useEffect(() => {
    const handleSilentSync = () => {
      if (selectedWebsite) {
        loadPageData(true);
      }
    };
    window.addEventListener("histat:socket_sync", handleSilentSync);
    window.addEventListener("online", handleSilentSync);
    window.addEventListener("focus", handleSilentSync);
    return () => {
      window.removeEventListener("histat:socket_sync", handleSilentSync);
      window.removeEventListener("online", handleSilentSync);
      window.removeEventListener("focus", handleSilentSync);
    };
  }, [selectedWebsite, loadPageData]);

  useEffect(() => {
    loadPageData(hasDataRef.current);
    const interval = setInterval(() => {
      loadPageData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadPageData]);

  // Compute clean domain string (always starts with https://)
  const cleanDomain = useMemo(() => {
    if (!selectedWebsite?.domain) return "https://streamespn.org";
    const d = selectedWebsite.domain.trim().replace(/\/+$/, "");
    return d.startsWith("http") ? d : `https://${d}`;
  }, [selectedWebsite?.domain]);

  // Aggregate Traffic by Title from pages telemetry
  const byTitleList: TitleItem[] = useMemo(() => {
    const map = new Map<string, TitleItem>();
    pages.forEach((p) => {
      const rawTitle = p.title?.trim();
      const title =
        rawTitle && rawTitle !== p.path
          ? rawTitle
          : p.path === "/"
          ? `${selectedWebsite?.name || "Home"} — Official Home`
          : p.path
              .replace(/^\//, "")
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
      const existing = map.get(title);
      if (existing) {
        existing.pageviews += p.pageviews;
        existing.visitors += p.visitors;
      } else {
        map.set(title, {
          title,
          samplePath: p.path,
          pageviews: p.pageviews,
          visitors: p.visitors,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.pageviews - a.pageviews);
  }, [pages, selectedWebsite?.name]);

  const maxViews = pages.length > 0 ? Math.max(...pages.map((p) => p.pageviews)) : 1;
  const maxTitleViews =
    byTitleList.length > 0
      ? Math.max(...byTitleList.map((t) => t.pageviews))
      : 1;

  const maxLanding =
    landingPages.length > 0 ? Math.max(...landingPages.map((l) => l.sessions)) : 1;
  const maxExit =
    exitPages.length > 0 ? Math.max(...exitPages.map((e) => e.sessions)) : 1;

  return (
    <div className="space-y-6 select-text antialiased">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pages &amp; Content Performance
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50/90 text-[#1455bb] border border-blue-200/80 font-bold shadow-2xs">
              {pages.length} URLs
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 font-bold shadow-2xs hidden sm:inline-block">
              {byTitleList.length} Titles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze visitor engagement, content headlines, landing entry points &amp; drop-off exits
          </p>
        </div>

        {/* Current Active Range indicator Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Active Window:</span>
            <span className="px-2.5 py-0.5 rounded-xl bg-blue-100/80 text-[#1455bb] border border-blue-200/90 text-xs font-black">
              {customWindow?.label ||
                (range === "today"
                  ? "Today"
                  : range === "yesterday"
                  ? "Yesterday"
                  : range === "7d"
                  ? "Last 7 Days"
                  : "Last 30 Days")}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left (Main Tables), Right (Always Shown Calendar) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10 w-full min-w-0">
        {/* ============================================================ */}
        {/* LEFT / MAIN CONTENT COLUMN                                   */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-6 w-full">

          {/* ============================================================ */}
          {/* SIDE-BY-SIDE: TRAFFIC BY URL & TRAFFIC BY TITLE              */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* 1. TRAFFIC BY URL CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455bb] border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                      Traffic by URL
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Most visited paths &amp; exact resource links
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455bb] border border-blue-200">
                  {pages.length} URLs
                </span>
              </div>

              {loading && pages.length === 0 ? (
                <div className="space-y-2.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 animate-pulse"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-5 h-4 bg-slate-200 rounded shrink-0" />
                        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                      </div>
                      <div className="h-4 w-14 bg-slate-200 rounded shrink-0" />
                    </div>
                  ))}
                </div>
              ) : pages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No URL pageviews recorded for this window.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                  {pages.map((page, index) => {
                    const percentage = Math.round((page.pageviews / maxViews) * 100);
                    const fullLink =
                      page.url ||
                      `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;

                    return (
                      <div
                        key={index}
                        className="group relative rounded-xl border border-slate-100 hover:border-blue-200 overflow-hidden transition-all bg-white hover:shadow-xs"
                      >
                        {/* Relative Percentage Progress Fill Bar */}
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/10 to-blue-400/5 pointer-events-none transition-all group-hover:from-blue-500/15"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />

                        <div className="relative flex items-center justify-between p-3 text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-5 text-slate-400 font-mono font-bold text-[11px] shrink-0 text-center">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <a
                                  href={fullLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={fullLink}
                                  className="font-bold text-slate-900 truncate group-hover:text-[#1455bb] hover:underline font-mono text-[12px] block"
                                >
                                  {fullLink}
                                </a>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {page.title && (
                                <div
                                  title={page.title}
                                  className="text-[10px] text-slate-400 truncate block font-sans"
                                >
                                  {page.title}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <div>
                              <div className="font-extrabold text-slate-900 tabular-nums">
                                {page.pageviews.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                                <Eye className="w-2.5 h-2.5" />
                                <span>views</span>
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <div className="font-bold text-slate-600 tabular-nums">
                                {page.visitors.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                                <Users className="w-2.5 h-2.5" />
                                <span>visitors</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. TRAFFIC BY TITLE CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                      Traffic by Title
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Page headlines &amp; content document titles
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {byTitleList.length} Titles
                </span>
              </div>

              {loading && byTitleList.length === 0 ? (
                <div className="space-y-2.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 animate-pulse"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-5 h-4 bg-slate-200 rounded shrink-0" />
                        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                      </div>
                      <div className="h-4 w-14 bg-slate-200 rounded shrink-0" />
                    </div>
                  ))}
                </div>
              ) : byTitleList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No title telemetry recorded for this window.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                  {byTitleList.map((item, index) => {
                    const percentage = Math.round(
                      (item.pageviews / maxTitleViews) * 100,
                    );
                    const sampleUrl = `${cleanDomain}${item.samplePath.startsWith("/") ? item.samplePath : `/${item.samplePath}`}`;

                    return (
                      <div
                        key={index}
                        className="group relative rounded-xl border border-slate-100 hover:border-indigo-200 overflow-hidden transition-all bg-white hover:shadow-xs"
                      >
                        {/* Relative Percentage Progress Fill Bar */}
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500/10 to-indigo-400/5 pointer-events-none transition-all group-hover:from-indigo-500/15"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />

                        <div className="relative flex items-center justify-between p-3 text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-5 text-indigo-400 font-mono font-bold text-[11px] shrink-0 text-center">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div
                                title={item.title}
                                className="font-bold text-slate-900 truncate group-hover:text-indigo-600 font-sans text-[12px] block"
                              >
                                {item.title}
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <a
                                  href={sampleUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Open ${sampleUrl}`}
                                  className="text-[10px] text-slate-400 font-mono truncate hover:text-indigo-600 hover:underline block"
                                >
                                  {sampleUrl}
                                </a>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <div>
                              <div className="font-extrabold text-slate-900 tabular-nums">
                                {item.pageviews.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                                <Eye className="w-2.5 h-2.5" />
                                <span>views</span>
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <div className="font-bold text-slate-600 tabular-nums">
                                {item.visitors.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                                <Users className="w-2.5 h-2.5" />
                                <span>visitors</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TWO COLUMN BREAKDOWN: TOP LANDING VS TOP EXIT PAGES          */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* 1. Landing Pages (Entry Points) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                      Top Landing Pages
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Where first-time &amp; returning visitors enter your site
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {landingPages.length} Entry Points
                </span>
              </div>

              {loading && landingPages.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-pulse"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                        <div className="h-3.5 w-48 bg-slate-200 rounded" />
                      </div>
                      <div className="h-3.5 w-16 bg-slate-200 rounded shrink-0" />
                    </div>
                  ))}
                </div>
              ) : landingPages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No landing session records found.
                </div>
              ) : (
                <div className="space-y-2">
                  {landingPages.map((l, i) => {
                    const fullLandLink = `${cleanDomain}${l.path.startsWith("/") ? l.path : `/${l.path}`}`;
                    const pct = Math.round((l.sessions / maxLanding) * 100);

                    return (
                      <div
                        key={i}
                        className="group relative rounded-xl border border-slate-100 hover:border-emerald-200 overflow-hidden transition-all bg-white hover:shadow-xs"
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 pointer-events-none transition-all group-hover:from-emerald-500/15"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                        <div className="relative flex items-center justify-between p-2.5 text-xs gap-2">
                          <a
                            href={fullLandLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fullLandLink}
                            className="text-slate-800 hover:text-emerald-700 hover:underline truncate font-mono text-[11px] flex items-center gap-1.5 flex-1 min-w-0"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{fullLandLink}</span>
                          </a>
                          <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
                            {l.sessions.toLocaleString()} sessions
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Exit Pages (Drop-off Points) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                      Top Exit Pages
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Final URLs visited before leaving your website
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {exitPages.length} Drop-off Points
                </span>
              </div>

              {loading && exitPages.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-pulse"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                        <div className="h-3.5 w-48 bg-slate-200 rounded" />
                      </div>
                      <div className="h-3.5 w-16 bg-slate-200 rounded shrink-0" />
                    </div>
                  ))}
                </div>
              ) : exitPages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No exit session records found.
                </div>
              ) : (
                <div className="space-y-2">
                  {exitPages.map((e, i) => {
                    const fullExitLink = `${cleanDomain}${e.path.startsWith("/") ? e.path : `/${e.path}`}`;
                    const pct = Math.round((e.sessions / maxExit) * 100);

                    return (
                      <div
                        key={i}
                        className="group relative rounded-xl border border-slate-100 hover:border-rose-200 overflow-hidden transition-all bg-white hover:shadow-xs"
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500/10 to-rose-400/5 pointer-events-none transition-all group-hover:from-rose-500/15"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                        <div className="relative flex items-center justify-between p-2.5 text-xs gap-2">
                          <a
                            href={fullExitLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fullExitLink}
                            className="text-slate-800 hover:text-rose-700 hover:underline truncate font-mono text-[11px] flex items-center gap-1.5 flex-1 min-w-0"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{fullExitLink}</span>
                          </a>
                          <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
                            {e.sessions.toLocaleString()} exits
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ALWAYS SHOWN CALENDAR                          */}
        {/* ============================================================ */}
        <div className="w-full xl:w-72 2xl:w-80 shrink-0 space-y-5 xl:sticky xl:top-6">
          <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-[#1455bb] to-blue-400 shadow-sm" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Analytics Calendar
                </h3>
              </div>
              {customWindow?.label ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#1455bb] border border-blue-200">
                  {customWindow.label}
                </span>
              ) : null}
            </div>

            <DateRangePicker
              inline={true}
              selectedRange={range}
              onChange={handleRangeChange}
              customWindow={customWindow}
              onCustomRangeChange={handleCustomRangeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
