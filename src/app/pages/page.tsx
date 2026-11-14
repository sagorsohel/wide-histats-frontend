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
import { formatCommas } from "@/lib/utils";

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
        if (overviewRes.success && overviewRes.data)
          setOverview(overviewRes.data);
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
      {/* ============================================================ */}
      {/* 1. TOP ROW: UNIFIED DAILY STATS & COMPACT CALENDAR           */}
      {/* ============================================================ */}
      <DailyStatsCard
        title="Content stats"
        items={contentStatItems}
        overview={overview}
        loading={loading}
        range={range}
        domain={selectedWebsite?.domain}
        calendar={
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCustomRangeChange}
            className="w-full max-w-[340px]"
          />
        }
      />

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
            <div className="space-y-1.5 flex-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-9 rounded-md bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No URL pageviews recorded for this window.
            </div>
          ) : (
            <div className="flex-1 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {/* Fixed Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-600 mb-1">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 text-center">#</span>
                  <span>URL</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                  <span className="w-16 text-right">Views</span>
                  <span className="w-16 text-right">Visitors</span>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-1">
                {pages.map((page, index) => {
                  const fullLink =
                    page.url ||
                    `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#e8e8e8]"
                      }`}
                    >
                      {/* Left: # + Just URL */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                        <span className="w-6 text-slate-400 font-mono font-bold text-[11px] shrink-0 text-center">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 flex items-center gap-1.5">
                          <a
                            href={fullLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fullLink}
                            className="font-normal text-slate-900 truncate hover:text-[#1455bb] hover:underline font-mono text-xs sm:text-[13px] block"
                          >
                            {fullLink}
                          </a>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Right: Views + Visitors */}
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                        <div className="w-16 text-right font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                          {formatCommas(page.pageviews)}
                        </div>
                        <div className="w-16 text-right font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                          {formatCommas(page.visitors)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            <div className="space-y-1.5 flex-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-9 rounded-md bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : byTitleList.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No title telemetry recorded for this window.
            </div>
          ) : (
            <div className="flex-1 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {/* Fixed Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-600 mb-1">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 text-center">#</span>
                  <span>Title</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                  <span className="w-16 text-right">Views</span>
                  <span className="w-16 text-right">Visitors</span>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-1">
                {byTitleList.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#e8e8e8]"
                      }`}
                    >
                      {/* Left: # + Just Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                        <span className="w-6 text-slate-400 font-mono font-bold text-[11px] shrink-0 text-center">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span
                            title={item.title}
                            className="font-normal text-slate-900 truncate text-xs sm:text-[13px] block"
                          >
                            {item.title}
                          </span>
                        </div>
                      </div>

                      {/* Right: Views + Visitors */}
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                        <div className="w-16 text-right font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                          {formatCommas(item.pageviews)}
                        </div>
                        <div className="w-16 text-right font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                          {formatCommas(item.visitors)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
