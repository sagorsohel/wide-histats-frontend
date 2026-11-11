"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { PageStat, OverviewStats } from "@/types/analytics";
import {
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
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
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(
    null,
  );
  const [pages, setPages] = useState<PageStat[]>([]);
  const [landingPages, setLandingPages] = useState<
    { path: string; sessions: number }[]
  >([]);
  const [exitPages, setExitPages] = useState<
    { path: string; sessions: number }[]
  >([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
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
      const q = `websiteId=${siteId}&from=${from}&to=${to}&limit=50000`;

      // Strict future check: future date has zero traffic
      if (new Date(from).getTime() > Date.now()) {
        setPages([]);
        setLandingPages([]);
        setExitPages([]);
        setOverview({
          activeVisitors: 0,
          totalPageviews: 0,
          uniqueVisitors: 0,
          totalSessions: 0,
          pagesPerSession: 0,
          bounceRate: 0,
          avgDuration: 0,
          from,
          to,
        });
        setLoading(false);
        hasDataRef.current = true;
        return;
      }

      if (!isSilent && !hasDataRef.current) {
        const cached = api.getCached<PageStat[]>(
          `/api/v1/analytics/pages?${q}`,
        );
        const cachedOverview = api.getCached<OverviewStats>(
          `/api/v1/analytics/overview?websiteId=${siteId}&from=${from}&to=${to}`,
        );
        if (cached?.data) {
          setPages(cached.data);
          if (cachedOverview?.data) setOverview(cachedOverview.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const [pRes, landRes, exitRes, overviewRes] = await Promise.all([
          api.get<PageStat[]>(`/api/v1/analytics/pages?${q}`),
          api.get<{ path: string; sessions: number }[]>(
            `/api/v1/analytics/landing-pages?${q}`,
          ),
          api.get<{ path: string; sessions: number }[]>(
            `/api/v1/analytics/exit-pages?${q}`,
          ),
          api.get<OverviewStats>(
            `/api/v1/analytics/overview?websiteId=${siteId}&from=${from}&to=${to}`,
          ),
        ]);

        // Strict race condition check: if user switched website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (pRes.success && pRes.data) setPages(pRes.data);
        if (landRes.success && landRes.data) setLandingPages(landRes.data);
        if (exitRes.success && exitRes.data) setExitPages(exitRes.data);
        if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
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
    if (
      selectedWebsite?.id &&
      selectedWebsite.id !== prevWebsiteIdRef.current
    ) {
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
      window.removeEventListener(
        "histat:website_changed",
        handleWebsiteChanged,
      );
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

  const maxViews =
    pages.length > 0 ? Math.max(...pages.map((p) => p.pageviews)) : 1;
  const maxTitleViews =
    byTitleList.length > 0
      ? Math.max(...byTitleList.map((t) => t.pageviews))
      : 1;

  const maxLanding =
    landingPages.length > 0
      ? Math.max(...landingPages.map((l) => l.sessions))
      : 1;
  const maxExit =
    exitPages.length > 0 ? Math.max(...exitPages.map((e) => e.sessions)) : 1;

  const totalViews = useMemo(
    () => pages.reduce((sum, p) => sum + (p.pageviews || 0), 0),
    [pages],
  );

  const totalVisitors = useMemo(
    () => pages.reduce((sum, p) => sum + (p.visitors || 0), 0),
    [pages],
  );

  const topPage = pages[0] || null;
  const topPageViews = topPage?.pageviews || 0;
  const topPageVisitors = topPage?.visitors || 0;
  const topPagePct = totalViews > 0 ? (topPageViews / totalViews) * 100 : 0;
  const topPageVisitorsPct =
    totalVisitors > 0 ? (topPageVisitors / totalVisitors) * 100 : 0;

  const topTitle = byTitleList[0] || null;
  const topTitleViews = topTitle?.pageviews || 0;
  const topTitlePct = totalViews > 0 ? (topTitleViews / totalViews) * 100 : 0;

  const totalLandingSessions = useMemo(
    () => landingPages.reduce((sum, l) => sum + (l.sessions || 0), 0),
    [landingPages],
  );
  const topLanding = landingPages[0] || null;
  const topLandingSessions = topLanding?.sessions || 0;
  const topLandingPct =
    totalLandingSessions > 0
      ? (topLandingSessions / totalLandingSessions) * 100
      : 0;

  const contentStatItems = [
    {
      value: totalViews.toLocaleString(),
      label: "Total page views",
      sublabel: "All content loads recorded",
      highlight: true,
    },
    {
      value: totalVisitors.toLocaleString(),
      label: "Total unique visitors",
      sublabel: "Audience reading content",
      highlight: true,
    },
    {
      value: `${pages.length}`,
      label: "Unique URLs",
      sublabel: "Indexed page URLs active",
      highlight: true,
    },
    {
      value: `${byTitleList.length}`,
      label: "Unique titles",
      sublabel: "Distinct article headlines",
      highlight: false,
    },
    {
      value: `${totalLandingSessions.toLocaleString()}`,
      label: "Top landing entries",
      sublabel: `${topLanding?.path || "/"} (${topLandingPct.toFixed(1)}%)`,
      highlight: false,
    },
    {
      value: `${topPagePct.toFixed(1)}%`,
      label: "Top resource share",
      sublabel: `${topPageViews.toLocaleString()} views on top URL`,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6 select-text antialiased">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#1455bb] to-[#1a62d4] flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pages &amp; Content Performance
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#1455bb] border border-blue-200/80 font-bold shadow-2xs">
                {pages.length} URLs
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold shadow-2xs hidden sm:inline-block">
                {byTitleList.length} Titles
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Analyze visitor engagement, content headlines, landing entry
              points &amp; drop-off exits
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TOP ROW: DAILY STATS CARD & COMPACT CALENDAR              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch w-full">
        {/* Daily Stats Card */}
        <div className="lg:col-span-8 flex flex-col">
          <DailyStatsCard
            title="Content stats"
            items={contentStatItems}
            overview={overview}
            loading={loading}
            range={range}
            domain={selectedWebsite?.domain}
          />
        </div>

        {/* Right: Authentic Compact Histats Calendar */}
        <div className="lg:col-span-4 flex flex-col">
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCustomRangeChange}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FULL WIDTH SECTION: TRAFFIC BY URL & BY TITLE (NICHE)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-5 items-start w-full">
        {/* 1. TRAFFIC BY URL CARD */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455bb] border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  Traffic by URL
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  Most visited paths &amp; exact resource links
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#1455bb] border border-blue-200/80 shadow-2xs whitespace-nowrap shrink-0">
              {pages.length} URLs
            </span>
          </div>

          {loading && pages.length === 0 ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-6 h-4 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  </div>
                  <div className="h-4 w-16 bg-slate-200 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No URL pageviews recorded for this window.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {pages.map((page, index) => {
                const percentage = Math.round(
                  (page.pageviews / maxViews) * 100,
                );
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

                    <div className="relative flex items-center justify-between px-3 py-1.5 text-xs gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-6 text-slate-400 font-mono font-bold text-[11px] shrink-0 text-center">
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

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div className="w-16 text-right">
                          <div className="font-extrabold text-slate-900 text-xs tabular-nums">
                            {page.pageviews.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5 font-medium">
                            <Eye className="w-2.5 h-2.5" />
                            <span>views</span>
                          </div>
                        </div>
                        <div className="w-16 text-right hidden sm:block">
                          <div className="font-bold text-slate-600 text-xs tabular-nums">
                            {page.visitors.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5 font-medium">
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
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455bb] border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  Traffic by Title
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  Page headlines &amp; content document titles
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#1455bb] border border-blue-200/80 shadow-2xs whitespace-nowrap shrink-0">
              {byTitleList.length} Titles
            </span>
          </div>

          {loading && byTitleList.length === 0 ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-6 h-4 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  </div>
                  <div className="h-4 w-16 bg-slate-200 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : byTitleList.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No title telemetry recorded for this window.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {byTitleList.map((item, index) => {
                const percentage = Math.round(
                  (item.pageviews / maxTitleViews) * 100,
                );
                const sampleUrl = `${cleanDomain}${item.samplePath.startsWith("/") ? item.samplePath : `/${item.samplePath}`}`;

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

                    <div className="relative flex items-center justify-between px-3 py-1.5 text-xs gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-6 text-slate-400 font-mono font-bold text-[11px] shrink-0 text-center">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div
                            title={item.title}
                            className="font-bold text-slate-900 truncate group-hover:text-[#1455bb] font-sans text-[12px] block"
                          >
                            {item.title}
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <a
                              href={sampleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Open ${sampleUrl}`}
                              className="text-[10px] text-slate-400 font-mono truncate hover:text-[#1455bb] hover:underline block"
                            >
                              {sampleUrl}
                            </a>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div className="w-16 text-right">
                          <div className="font-extrabold text-slate-900 text-xs tabular-nums">
                            {item.pageviews.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5 font-medium">
                            <Eye className="w-2.5 h-2.5" />
                            <span>views</span>
                          </div>
                        </div>
                        <div className="w-16 text-right hidden sm:block">
                          <div className="font-bold text-slate-600 text-xs tabular-nums">
                            {item.visitors.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5 font-medium">
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
    </div>
  );
}
