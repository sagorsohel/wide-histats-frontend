"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { SourcesData, DetailedReferrerStat, ReferrerSummaryComparison } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import {
  Compass,
  Search,
  ExternalLink,
  Link as LinkIcon,
  Target,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";
import { ReferrerBrandIcon } from "@/components/common/BrandIcons";
import { useTabFocus } from "@/hooks/useTabFocus";
import { HistatsCalendar, CustomDateWindow } from "@/components/analytics/HistatsCalendar";

// Module-level memory cache for 0ms instant display when navigating to Referring Sites
let memorySourcesCache: {
  siteId: string;
  range: RangeOption;
  customWindow: CustomDateWindow | null;
  data: SourcesData | null;
} | null = null;

type SortField = "rank" | "referrerUrl" | "newVisitors" | "visitors" | "pageviews" | "ppv" | "avgDuration" | "bounceRate";
type SortDirection = "asc" | "desc";

export default function SourcesPage() {
  const { selectedWebsite } = useWebsite();

  const isCached = !!(selectedWebsite?.id && memorySourcesCache?.siteId === selectedWebsite.id && memorySourcesCache.data);

  const [range, setRange] = useState<RangeOption>(() => (isCached && memorySourcesCache ? memorySourcesCache.range : "today"));
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(() => (isCached && memorySourcesCache ? memorySourcesCache.customWindow : null));
  const [showNewAndLost, setShowNewAndLost] = useState(false);
  const [data, setData] = useState<SourcesData | null>(() => (isCached && memorySourcesCache ? memorySourcesCache.data : null));
  const [loading, setLoading] = useState(!isCached);

  // Search & Pagination & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("visitors");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);

  const getDateRange = useCallback((option: RangeOption) => {
    const now = new Date();
    let from = new Date();
    if (option === "today") from.setHours(0, 0, 0, 0);
    else if (option === "yesterday") {
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
    } else if (option === "7d") from.setDate(from.getDate() - 7);
    else if (option === "30d") from.setDate(from.getDate() - 30);

    return { from: from.toISOString(), to: now.toISOString() };
  }, []);

  const hasDataRef = React.useRef(isCached);
  const activeSiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadSources = useCallback(
    async (
      isSilent = false,
      overrideSiteId?: string,
      overrideWindow?: CustomDateWindow | null
    ) => {
      const siteId = overrideSiteId || activeSiteIdRef.current;
      if (!siteId) return;
      if (!isSilent && !hasDataRef.current) {
        setLoading(true);
      }

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

      const q = `websiteId=${siteId}&from=${from}&to=${to}&limit=100`;

      try {
        const res = await api.get<SourcesData>(`/api/v1/analytics/sources?${q}`);

        // Strict race condition check: if user switched website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (res.success && res.data) {
          setData(res.data);
          hasDataRef.current = true;

          // Save in module cache for 0ms instant display on subsequent link navigation
          memorySourcesCache = {
            siteId,
            range,
            customWindow: win || null,
            data: res.data,
          };
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (siteId === activeSiteIdRef.current) {
          setLoading(false);
        }
      }
    },
    [range, customWindow, getDateRange]
  );

  const handleCalendarDateChange = (win: CustomDateWindow | null) => {
    setCustomWindow(win);
    hasDataRef.current = false;
    loadSources(false, undefined, win);
  };

  const handleRangeChange = (r: RangeOption) => {
    setRange(r);
    setCustomWindow(null);
    hasDataRef.current = false;
    loadSources(false, undefined, null);
  };

  // Instantly handle website switcher change in Sources page
  const prevWebsiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);

  useEffect(() => {
    if (selectedWebsite?.id && selectedWebsite.id !== prevWebsiteIdRef.current) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      memorySourcesCache = null;
      setData(null);
      hasDataRef.current = false;
      setLoading(true);
      loadSources(false, selectedWebsite.id);
    } else if (selectedWebsite?.id && !hasDataRef.current) {
      loadSources(false, selectedWebsite.id);
    }
  }, [selectedWebsite?.id, loadSources]);

  // Listen to global website changed event for immediate 0ms update
  useEffect(() => {
    const handleWebsiteChanged = (e: any) => {
      const newSite = e.detail;
      if (newSite?.id) {
        prevWebsiteIdRef.current = newSite.id;
        setData(null);
        hasDataRef.current = false;
        setLoading(true);
        loadSources(false, newSite.id);
      }
    };
    window.addEventListener("histat:website_changed", handleWebsiteChanged);
    return () => window.removeEventListener("histat:website_changed", handleWebsiteChanged);
  }, [loadSources]);

  // Auto-refresh when user returns to this tab
  useTabFocus(() => loadSources(true));

  // Silent sync on socket reconnect or network restore
  useEffect(() => {
    const handleSilentSync = () => {
      if (selectedWebsite) {
        loadSources(true);
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
  }, [selectedWebsite, loadSources]);

  useEffect(() => {
    loadSources(hasDataRef.current);
    const interval = setInterval(() => {
      loadSources(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadSources]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, range, rowsPerPage]);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtered and sorted detailed referrers
  const filteredReferrers = useMemo(() => {
    let list = (data?.detailedReferrers || []) as DetailedReferrerStat[];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((r) => r.referrerUrl.toLowerCase().includes(query));
    }

    if (showNewAndLost) {
      // Filter referrers with new visitors
      list = list.filter((r) => r.newVisitors > 0);
    }

    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "referrerUrl") {
        valA = a.referrerUrl.toLowerCase();
        valB = b.referrerUrl.toLowerCase();
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [data?.detailedReferrers, searchQuery, showNewAndLost, sortField, sortDirection]);

  // Pagination calculation
  const totalRows = filteredReferrers.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const paginatedReferrers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredReferrers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredReferrers, currentPage, rowsPerPage]);

  // Comparison Summary Data
  const summary: ReferrerSummaryComparison = data?.referrerSummary || {
    totalPageviews: 0,
    refPageviews: 0,
    pageviewsPct: 0,
    totalVisitors: 0,
    refVisitors: 0,
    visitorsPct: 0,
    totalNewVisitors: 0,
    refNewVisitors: 0,
    newVisitorsPct: 0,
    totalPpv: 0,
    refPpv: 0,
    ppvDiffPct: 0,
  };


  return (
    <div className="space-y-6 select-text antialiased">
      {/* Page Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1d5b9f] to-[#144275] flex items-center justify-center text-white shadow-md shadow-blue-900/10 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Referring Sites Summary
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Detailed referrer URL telemetry, bounce rates, pages per visit & visitor attribution
            </p>
          </div>
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
      <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
        {/* ============================================================ */}
        {/* LEFT / MAIN CONTENT COLUMN                                   */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* 1. HISTATS SUMMARY COMPARISON TABLE */}
          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="w-full overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1d5796] via-[#215f9e] to-[#1a4a7f] text-white text-[11px] sm:text-xs font-bold border-b border-[#164375]">
                    <th className="py-2.5 px-3 sm:px-4 tracking-wide text-left font-bold text-white/95">
                      Summary
                    </th>
                    <th className="py-2.5 px-2.5 sm:px-3 text-right tracking-wide font-bold text-white/95 whitespace-nowrap lg:w-28">
                      Stats summary
                    </th>
                    <th className="py-2.5 px-2.5 sm:px-3 text-right tracking-wide font-bold text-white/95 whitespace-nowrap lg:w-32">
                      Referrer summary
                    </th>
                    <th className="py-2.5 px-2.5 sm:px-3 text-right tracking-wide font-bold text-white/95 whitespace-nowrap lg:w-28">
                      (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[11px] sm:text-xs font-medium divide-y divide-slate-100">
                  {/* Row 1: Total page views */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-slate-800 font-medium">
                      Total page views
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.totalPageviews.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.refPageviews.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-semibold text-[#1d5b9f] tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : `(${summary.pageviewsPct.toFixed(2)} %)`}
                    </td>
                  </tr>

                  {/* Row 2: Total visitors (Soft Green Highlight) */}
                  <tr className="bg-[#eef8e8] hover:bg-[#e4f3dc] transition-colors border-y border-[#d5ebcc]">
                    <td className="py-2.5 px-3 sm:px-4 text-emerald-950 font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />
                      <span>Total visitors</span>
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-black text-slate-950 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.totalVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-black text-slate-950 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.refVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-[#1d5b9f] tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : `(${summary.visitorsPct.toFixed(2)} %)`}
                    </td>
                  </tr>

                  {/* Row 3: Total new visitors */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-slate-800 font-medium">
                      Total new visitors
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.totalNewVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.refNewVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-semibold text-[#1d5b9f] tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : `(${summary.newVisitorsPct.toFixed(2)} %)`}
                    </td>
                  </tr>

                  {/* Row 4: Page views per visit */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-slate-800 font-medium">
                      Page views per visit
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.totalPpv.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading && !data ? "..." : summary.refPpv.toFixed(1)}
                    </td>
                    <td
                      className={`py-2.5 px-2.5 sm:px-3 text-right font-semibold tabular-nums whitespace-nowrap ${
                        summary.ppvDiffPct < 0 ? "text-rose-600" : "text-[#1d5b9f]"
                      }`}
                    >
                      {loading && !data
                        ? "..."
                        : `(${summary.ppvDiffPct > 0 ? "+" : ""}${summary.ppvDiffPct.toFixed(1)}%)`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

      {/* SUBHEADER CONTROLS BAR: Total rows, Page numbers, and Rows to show */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-900">
            Total rows: <span className="font-mono text-emerald-700">{totalRows}</span>
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#1d5b9f] border border-blue-200 rounded font-medium text-[11px]">
              Filtered by: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="ml-1 text-slate-400 hover:text-slate-700 font-bold"
              >
                ×
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Pagination Jump Links */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">page</span>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-1.5 py-0.5 rounded font-bold text-xs transition-colors ${
                  currentPage === p
                    ? "text-[#1d5b9f] underline"
                    : "text-slate-600 hover:text-[#1d5b9f]"
                }`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-slate-400">...</span>}
          </div>

          {/* Rows to show dropdown */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-300">
            <span className="text-slate-500 font-medium">Rows to show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-800 font-semibold rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#1d5b9f] focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* THE MAIN REFERRING SITES TABLE (Matches user screenshot) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#e9edf3] text-slate-800 text-xs font-bold border-b border-slate-300 select-none">
                {/* Rank */}
                <th
                  onClick={() => handleSort("rank")}
                  className="py-2.5 px-3 text-center w-16 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rank</span>
                    {sortField === "rank" && (
                      <span className="text-slate-500">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Referrer url + Inline Search Box */}
                <th className="py-2 px-3 text-left min-w-[260px]">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      onClick={() => handleSort("referrerUrl")}
                      className="cursor-pointer hover:underline"
                    >
                      Referrer url
                    </span>

                    {/* Inline Search Filter Input (From Screenshot) */}
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-32 sm:w-40 bg-white border border-slate-300 rounded px-2 py-0.5 text-[11px] font-normal text-slate-800 focus:outline-hidden focus:border-[#1d5b9f] focus:ring-1 focus:ring-[#1d5b9f] placeholder:text-slate-400"
                      />
                      <Search className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                    </div>
                  </div>
                </th>

                {/* New Vis. */}
                <th
                  onClick={() => handleSort("newVisitors")}
                  className="py-2.5 px-3 text-right w-24 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>New Vis.</span>
                    {sortField === "newVisitors" && (
                      <span className="text-slate-500">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Visitors (Active sort default in screenshot) */}
                <th
                  onClick={() => handleSort("visitors")}
                  className="py-2.5 px-3 text-right w-24 cursor-pointer bg-slate-200/90 text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-extrabold">Visitors</span>
                    <span className="text-slate-700 font-bold">
                      {sortField === "visitors" ? (sortDirection === "asc" ? "▲" : "▼") : "▼"}
                    </span>
                  </div>
                </th>

                {/* Pages V. */}
                <th
                  onClick={() => handleSort("pageviews")}
                  className="py-2.5 px-3 text-right w-24 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Pages V.</span>
                    {sortField === "pageviews" && (
                      <span className="text-slate-500">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Ppv */}
                <th
                  onClick={() => handleSort("ppv")}
                  className="py-2.5 px-3 text-right w-20 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Ppv</span>
                    {sortField === "ppv" && (
                      <span className="text-slate-500">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Tpp */}
                <th
                  onClick={() => handleSort("avgDuration")}
                  className="py-2.5 px-3 text-right w-20 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tpp</span>
                    {sortField === "avgDuration" && (
                      <span className="text-slate-500">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* bounce */}
                <th
                  onClick={() => handleSort("bounceRate")}
                  className="py-2.5 px-3 text-right w-20 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>bounce</span>
                    {sortField === "bounceRate" && (
                      <span className="text-slate-500">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="text-xs divide-y divide-slate-100">
              {loading && (!data?.detailedReferrers || data.detailedReferrers.length === 0) ? (
                // Skeleton loading rows
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-3 text-center">
                      <div className="h-4 w-6 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-200 rounded" />
                        <div className="h-4 w-48 bg-slate-200 rounded" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-8 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-8 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-10 bg-slate-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedReferrers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No referring sites matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedReferrers.map((ref, idx) => {
                  const isEven = idx % 2 === 0;
                  const isUpTrend = ref.trend === "up";

                  return (
                    <tr
                      key={ref.referrerUrl + idx}
                      className={`${
                        isEven ? "bg-white" : "bg-[#fbfcff]"
                      } hover:bg-[#eef5fc] transition-colors`}
                    >
                      {/* Rank with Up/Down Trend Arrow */}
                      <td className="py-2.5 px-3 text-center font-bold tabular-nums">
                        <div className="inline-flex items-center gap-1">
                          {isUpTrend ? (
                            <span className="text-emerald-600 text-[11px] font-black">▲</span>
                          ) : (
                            <span className="text-rose-500 text-[11px] font-black">▼</span>
                          )}
                          <span className="text-slate-800">{ref.rank}</span>
                        </div>
                      </td>

                      {/* Referrer url with Icon & External Link */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 max-w-[420px] truncate">
                          {/* External link button */}
                          <a
                            href={ref.fullUrl || `https://${ref.referrerUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-[#1d5b9f] transition-colors shrink-0"
                            title={`Open ${ref.referrerUrl} in new tab`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Favicon */}
                          <WebsiteFavicon domain={ref.referrerUrl} size={14} className="shrink-0" />

                          {/* Domain name */}
                          <a
                            href={ref.fullUrl || `https://${ref.referrerUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-900 hover:text-[#1d5b9f] hover:underline truncate"
                            title={ref.referrerUrl}
                          >
                            {ref.referrerUrl}
                          </a>
                        </div>
                      </td>

                      {/* New Vis. */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {ref.newVisitors.toLocaleString()}
                      </td>

                      {/* Visitors */}
                      <td className="py-2.5 px-3 text-right font-black text-slate-950 tabular-nums bg-slate-50/50">
                        {ref.visitors.toLocaleString()}
                      </td>

                      {/* Pages V. */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {ref.pageviews.toLocaleString()}
                      </td>

                      {/* Ppv */}
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700 tabular-nums">
                        {ref.ppv.toFixed(1)}
                      </td>

                      {/* Tpp (Formatted as 31", 1'2", etc.) */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {ref.tpp}
                      </td>

                      {/* bounce (%) */}
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800 tabular-nums">
                        {ref.bounceRate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#f8fafc] border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * rowsPerPage, totalRows)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{totalRows}</span> referrer domains
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY SECTION: TRAFFIC CHANNELS & UTM CAMPAIGNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Main Channels Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#1d5b9f]" />
              <h3 className="font-bold text-sm text-slate-900">Traffic Medium / Channels</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Total: {data?.sources?.length || 0} channels
            </span>
          </div>

          {!data?.sources || data.sources.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No channel records detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.sources.slice(0, 6).map((s, idx) => {
                const totalSess = summary.totalPageviews || 1;
                const pct = Math.round((s.sessions / totalSess) * 100);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/90 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-xs capitalize truncate">
                        {s.source}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-[#1d5b9f]">
                        {s.medium}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-lg font-black text-slate-900 tabular-nums">
                        {s.sessions.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {s.visitors.toLocaleString()} vis
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#1d5b9f] to-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* UTM Campaigns */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">UTM Campaigns</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Total: {data?.campaigns?.length || 0} campaigns
            </span>
          </div>

          {!data?.campaigns || data.campaigns.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active UTM marketing campaigns in this range. Add{" "}
              <code className="px-1 text-[#1d5b9f] font-mono bg-blue-50 rounded">
                ?utm_campaign=...
              </code>{" "}
              to your links.
            </div>
          ) : (
            <div className="space-y-2">
              {data.campaigns.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-emerald-700 font-semibold truncate max-w-[220px]">
                    {c.campaign}
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {c.sessions.toLocaleString()} visits
                  </span>
                </div>
              ))}
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
          onCustomRangeChange={handleCalendarDateChange}
        />

        {/* Show new and lost referrers checkbox */}
        <label className="flex items-center gap-2 pt-2.5 border-t border-slate-100 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showNewAndLost}
            onChange={(e) => setShowNewAndLost(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#1455bb] focus:ring-blue-500 cursor-pointer"
          />
          <span>Show new and lost referrers</span>
        </label>
      </div>
    </div>
  </div>
</div>
  );
}
