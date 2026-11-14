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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";
import { useTabFocus } from "@/hooks/useTabFocus";
import { formatCommas } from "@/lib/utils";

interface TitleItem {
  title: string;
  samplePath: string;
  pageviews: number;
  visitors: number;
}

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
}: TablePaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pagesList = getPages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3.5 py-2 bg-slate-50/90 border-t border-slate-200/80 text-[11px] text-slate-500 select-none">
      <div className="text-[11px] text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{startItem}</span> to{" "}
        <span className="font-bold text-slate-800">{endItem}</span> of{" "}
        <span className="font-bold text-slate-800">{formatCommas(totalItems)}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-0.5 px-2 h-[26px] rounded-md text-[11px] font-medium transition-colors border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs cursor-pointer disabled:pointer-events-none"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {pagesList.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-slate-400 font-bold text-[11px]"
                >
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[26px] h-[26px] px-1.5 rounded-md text-[11px] font-bold transition-colors flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-[#1455bb] text-white shadow-2xs"
                    : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-0.5 px-2 h-[26px] rounded-md text-[11px] font-medium transition-colors border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs cursor-pointer disabled:pointer-events-none"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
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
  const [hoveredLink, setHoveredLink] = useState<{
    url: string;
    title: string;
    x: number;
    y: number;
    placeBelow?: boolean;
  } | null>(null);

  const [urlPage, setUrlPage] = useState(1);
  const [titlePage, setTitlePage] = useState(1);
  const PAGE_SIZE = 10;

  // Auto-dismiss floating popup on scroll
  useEffect(() => {
    if (!hoveredLink) return;
    const handleScroll = () => setHoveredLink(null);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [hoveredLink]);

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
    setUrlPage(1);
    setTitlePage(1);
    hasDataRef.current = false;
    loadPageData(false, undefined, null);
  };

  const handleCustomRangeChange = (win: CustomDateWindow | null) => {
    setCustomWindow(win);
    setUrlPage(1);
    setTitlePage(1);
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
      setUrlPage(1);
      setTitlePage(1);
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
        setUrlPage(1);
        setTitlePage(1);
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

  const totalUrlPages = Math.max(1, Math.ceil(pages.length / PAGE_SIZE));
  const paginatedPages = useMemo(() => {
    const start = (urlPage - 1) * PAGE_SIZE;
    return pages.slice(start, start + PAGE_SIZE);
  }, [pages, urlPage]);

  const totalTitlePages = Math.max(1, Math.ceil(byTitleList.length / PAGE_SIZE));
  const paginatedTitles = useMemo(() => {
    const start = (titlePage - 1) * PAGE_SIZE;
    return byTitleList.slice(start, start + PAGE_SIZE);
  }, [byTitleList, titlePage]);

  // Clamp current page if total pages shrank
  useEffect(() => {
    if (urlPage > totalUrlPages) setUrlPage(1);
  }, [urlPage, totalUrlPages]);

  useEffect(() => {
    if (titlePage > totalTitlePages) setTitlePage(1);
  }, [titlePage, totalTitlePages]);

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
            <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100/60">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="px-3 py-0 flex items-center justify-between min-h-[30px] h-[30px] animate-pulse"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-[36px] h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 bg-slate-200 rounded flex-1 max-w-[320px]" />
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="w-16 h-3.5 bg-slate-200 rounded" />
                    <div className="w-16 h-3.5 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No URL pageviews recorded for this window.
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
              <div className="flex-1 overflow-x-auto">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-1.5 bg-slate-100/95 border-b border-slate-200/80 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-[36px] text-right pr-2 shrink-0">#</span>
                    <span>URL</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    <span className="w-16 text-right">Views</span>
                    <span className="w-16 text-right">Visitors</span>
                  </div>
                </div>

                {/* Flush 30px Zebra Rows */}
                <div>
                  {paginatedPages.map((page, index) => {
                    const rank = (urlPage - 1) * PAGE_SIZE + index + 1;
                    const fullLink =
                      page.url ||
                      `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;
                    const isZebra = index % 2 !== 0;

                    return (
                      <div
                        key={index}
                        style={{
                          backgroundColor: isZebra ? "#00000017" : "#ffffff",
                        }}
                        className="px-3 py-0 flex items-center justify-between hover:brightness-95 text-[11px] transition-colors min-h-[30px] h-[30px]"
                      >
                        {/* Left: # Rank + Favicon + URL */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                          <div className="w-[36px] text-right font-bold text-[#1455bb] text-[12px] shrink-0 font-sans pr-2">
                            <span>{rank}</span>
                          </div>
                          <div className="shrink-0">
                            <WebsiteFavicon
                              url={fullLink}
                              domain={selectedWebsite?.domain}
                              size={14}
                              fallbackIcon="link"
                            />
                          </div>
                          <a
                            href={fullLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fullLink}
                            className="truncate text-slate-800 font-normal hover:text-[#1455bb] hover:underline cursor-pointer group flex-1 min-w-0 text-[11px] font-mono"
                          >
                            <span className="truncate block font-normal text-[11px]">
                              {fullLink}
                            </span>
                          </a>
                        </div>

                        {/* Right: Views + Visitors */}
                        <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                          <div className="w-16 text-right font-bold text-slate-900 text-[11px] tabular-nums font-sans">
                            {formatCommas(page.pageviews)}
                          </div>
                          <div className="w-16 text-right font-bold text-slate-700 text-[11px] tabular-nums font-sans">
                            {formatCommas(page.visitors)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination */}
              <TablePagination
                currentPage={urlPage}
                totalPages={totalUrlPages}
                totalItems={pages.length}
                pageSize={PAGE_SIZE}
                itemLabel="URLs"
                onPageChange={(p) => setUrlPage(p)}
              />
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
            <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100/60">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="px-3 py-0 flex items-center justify-between min-h-[30px] h-[30px] animate-pulse"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-[36px] h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 bg-slate-200 rounded flex-1 max-w-[320px]" />
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="w-16 h-3.5 bg-slate-200 rounded" />
                    <div className="w-16 h-3.5 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : byTitleList.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No title telemetry recorded for this window.
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
              <div className="flex-1 overflow-x-auto">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-1.5 bg-slate-100/95 border-b border-slate-200/80 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-[36px] text-right pr-2 shrink-0">#</span>
                    <span>Title</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    <span className="w-16 text-right">Views</span>
                    <span className="w-16 text-right">Visitors</span>
                  </div>
                </div>

                {/* Flush 30px Zebra Rows */}
                <div>
                  {paginatedTitles.map((item, index) => {
                    const rank = (titlePage - 1) * PAGE_SIZE + index + 1;
                    const fullLink = `${cleanDomain}${item.samplePath.startsWith("/") ? item.samplePath : `/${item.samplePath}`}`;
                    const isZebra = index % 2 !== 0;

                    return (
                      <div
                        key={index}
                        style={{
                          backgroundColor: isZebra ? "#00000017" : "#ffffff",
                        }}
                        className="px-3 py-0 flex items-center justify-between hover:brightness-95 text-[11px] transition-colors min-h-[30px] h-[30px]"
                      >
                        {/* Left: # Rank + Favicon + Title */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                          <div className="w-[36px] text-right font-bold text-[#1455bb] text-[12px] shrink-0 font-sans pr-2">
                            <span>{rank}</span>
                          </div>
                          <div className="shrink-0">
                            <WebsiteFavicon
                              url={fullLink}
                              domain={selectedWebsite?.domain}
                              size={14}
                              fallbackIcon="link"
                            />
                          </div>
                          <a
                            href={fullLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const placeBelow = rect.top < 65;
                              setHoveredLink({
                                url: fullLink,
                                title: item.title,
                                x: rect.left,
                                y: placeBelow ? rect.bottom + 6 : rect.top - 6,
                                placeBelow,
                              });
                            }}
                            onMouseLeave={() => setHoveredLink(null)}
                            className="truncate text-slate-800 font-normal hover:text-[#1455bb] hover:underline cursor-pointer group flex-1 min-w-0 text-[11px]"
                          >
                            <span className="truncate block font-normal text-[11px]">
                              {item.title}
                            </span>
                          </a>
                        </div>

                        {/* Right: Views + Visitors */}
                        <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                          <div className="w-16 text-right font-bold text-slate-900 text-[11px] tabular-nums font-sans">
                            {formatCommas(item.pageviews)}
                          </div>
                          <div className="w-16 text-right font-bold text-slate-700 text-[11px] tabular-nums font-sans">
                            {formatCommas(item.visitors)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination */}
              <TablePagination
                currentPage={titlePage}
                totalPages={totalTitlePages}
                totalItems={byTitleList.length}
                pageSize={PAGE_SIZE}
                itemLabel="Titles"
                onPageChange={(p) => setTitlePage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating URL Popup Tooltip on Hover - Shows Full Complete URL */}
      {hoveredLink && (
        <div
          style={{
            position: "fixed",
            left: Math.max(
              16,
              Math.min(
                hoveredLink.x,
                (typeof window !== "undefined" ? window.innerWidth : 1200) -
                  Math.min(
                    hoveredLink.url.length * 8 + 60,
                    (typeof window !== "undefined" ? window.innerWidth : 1200) -
                      32,
                  ),
              ),
            ),
            maxWidth: "calc(100vw - 32px)",
            top: hoveredLink.y,
            transform: hoveredLink.placeBelow ? "none" : "translateY(-100%)",
            zIndex: 9999,
          }}
          className="pointer-events-none px-3 py-1.5 bg-[#0f172a] text-white rounded-lg shadow-2xl border border-slate-700/80 text-[11px] font-mono flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md select-none w-max max-w-[95vw]"
        >
          <div className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Link2 className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-blue-100 font-medium font-mono text-[11px] whitespace-nowrap">
            {hoveredLink.url}
          </span>
        </div>
      )}
    </div>
  );
}
