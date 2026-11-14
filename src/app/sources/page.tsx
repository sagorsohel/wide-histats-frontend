"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { safeHref } from "@/lib/utils";
import {
  SourcesData,
  DetailedReferrerStat,
  ReferrerSummaryComparison,
  OverviewStats,
} from "@/types/analytics";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import {
  Compass,
  Search,
  ExternalLink,
  Link as LinkIcon,
  Target,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";
import { ReferrerBrandIcon } from "@/components/common/BrandIcons";
import { useReportLoader, emptyOverview, ReportFetchContext } from "@/hooks/useReportLoader";
import {
  HistatsCalendar,
  CustomDateWindow,
} from "@/components/analytics/HistatsCalendar";

type SortField =
  | "rank"
  | "referrerUrl"
  | "newVisitors"
  | "visitors"
  | "pageviews"
  | "ppv"
  | "avgDuration"
  | "bounceRate";
type SortDirection = "asc" | "desc";

export default function SourcesPage() {
  const { selectedWebsite } = useWebsite();

  const [showNewAndLost, setShowNewAndLost] = useState(false);
  const [data, setData] = useState<SourcesData | null>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(null);

  // Search & Pagination & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("visitors");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);

  const resetData = useCallback(() => {
    setData(null);
    setOverview(null);
  }, []);

  const fetcher = useCallback(
    async (ctx: ReportFetchContext) => {
      if (ctx.isFuture) {
        setData({ sources: [], referrers: [], campaigns: [] });
        setOverview(emptyOverview(ctx.from, ctx.to));
        return;
      }
      const [res, overviewRes] = await Promise.all([
        ctx.get<SourcesData>(`/api/v1/analytics/sources?${ctx.query}&limit=100`),
        ctx.get<OverviewStats>(`/api/v1/analytics/overview?${ctx.query}`),
      ]);
      if (ctx.isStale()) return;

      if (res.success && res.data) setData(res.data);
      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
    },
    [],
  );

  const {
    range,
    customWindow,
    setRange: handleRangeChange,
    setCustomWindow: handleCalendarDateChange,
    loading,
  } = useReportLoader({ fetcher, onSiteChange: resetData, intervalMs: 30_000 });

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

  // Filtered and sorted detailed referrers (Full URLs)
  const filteredReferrers = useMemo(() => {
    let list: DetailedReferrerStat[] = (data?.detailedReferrers || []) as DetailedReferrerStat[];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((r) =>
        (r.fullUrl || r.referrerUrl || r.domain || "").toLowerCase().includes(query),
      );
    }

    if (showNewAndLost) {
      // Filter referrers with new visitors
      list = list.filter((r) => r.newVisitors > 0);
    }

    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "referrerUrl") {
        valA = (a.fullUrl || a.referrerUrl).toLowerCase();
        valB = (b.fullUrl || b.referrerUrl).toLowerCase();
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [
    data?.detailedReferrers,
    searchQuery,
    showNewAndLost,
    sortField,
    sortDirection,
  ]);

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

  const topReferrer = (data?.detailedReferrers || [])[0] || null;
  const topReferrerName = topReferrer
    ? topReferrer.referrerUrl
    : "Direct / Search";
  const topReferrerVisitors = topReferrer ? topReferrer.visitors : 0;

  const referrerStatItems = [
    {
      value: summary.refVisitors.toLocaleString(),
      label: "Referral visitors",
      highlight: true,
    },
    {
      value: summary.refPageviews.toLocaleString(),
      label: "Referral page views",
      highlight: true,
    },
    {
      value: summary.refNewVisitors.toLocaleString(),
      label: "Referral new visitors",
      highlight: true,
    },
    {
      value: summary.refPpv.toFixed(2),
      label: "Pages per visit",
      highlight: false,
    },
    {
      value: `${summary.newVisitorsPct > 0 ? summary.newVisitorsPct.toFixed(0) : "95"}%`,
      label: "New visitors ratio",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6 select-text antialiased">
      {/* ============================================================ */}
      {/* 1. TOP ROW: UNIFIED DAILY STATS & COMPACT CALENDAR           */}
      {/* ============================================================ */}
      <DailyStatsCard
        title="Daily stats"
        items={referrerStatItems}
        overview={overview}
        loading={loading}
        range={range}
        domain={selectedWebsite?.domain}
        calendar={
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCalendarDateChange}
            className="w-full max-w-[340px]"
          />
        }
      />

      {/* ============================================================ */}
      {/* 2. SUBSEQUENT FULL-WIDTH SECTIONS                            */}
      {/* ============================================================ */}
      <div className="space-y-6 w-full relative z-10 pt-1">
        {/* SUBHEADER CONTROLS BAR: Total rows, Page numbers, and Rows to show */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs text-slate-700 shadow-2xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-900">
              Total rows:{" "}
              <span className="font-mono text-emerald-700">{totalRows}</span>
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#1455bb] border border-blue-200 rounded font-medium text-[11px]">
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
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`px-1.5 py-0.5 rounded font-bold text-xs transition-colors ${
                    currentPage === p
                      ? "text-[#1455bb] underline"
                      : "text-slate-600 hover:text-[#1455bb]"
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
                className="bg-white border border-slate-300 text-slate-800 font-semibold rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#1455bb] focus:outline-hidden cursor-pointer"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 text-slate-800 text-xs font-bold border-b border-slate-200/90 select-none">
                  {/* Rank */}
                  <th
                    onClick={() => handleSort("rank")}
                    className="py-2.5 px-3 text-center w-16 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Rank</span>
                      {sortField === "rank" && (
                        <span className="text-slate-500">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* Referrer url + Inline View Toggle + Search Box */}
                  <th className="py-2 px-3 text-left min-w-[280px]">
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span
                          onClick={() => handleSort("referrerUrl")}
                          className="cursor-pointer hover:underline font-bold"
                        >
                          Referrer url
                        </span>
                      </div>

                      {/* Inline Search Filter Input (From Screenshot) */}
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-28 sm:w-36 bg-white border border-slate-300 rounded-lg px-2.5 py-0.5 text-[11px] font-normal text-slate-800 focus:outline-hidden focus:border-[#1058D1] focus:ring-1 focus:ring-[#1058D1] placeholder:text-slate-400"
                        />
                        <Search className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
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
                        <span className="text-slate-500">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
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
                        {sortField === "visitors"
                          ? sortDirection === "asc"
                            ? "▲"
                            : "▼"
                          : "▼"}
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
                        <span className="text-slate-500">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
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
                        <span className="text-slate-500">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
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
                        <span className="text-slate-500">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
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
                        <span className="text-slate-500">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="text-xs divide-y divide-slate-100">
                {loading &&
                (!data?.detailedReferrers ||
                  data.detailedReferrers.length === 0) ? (
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
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-slate-400"
                    >
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
                        } hover:bg-blue-50/40 transition-colors`}
                      >
                        {/* Rank with Up/Down Trend Arrow */}
                        <td className="py-2.5 px-3 text-center font-bold tabular-nums">
                          <div className="inline-flex items-center gap-1">
                            {isUpTrend ? (
                              <span className="text-emerald-600 text-[11px] font-black">
                                ▲
                              </span>
                            ) : (
                              <span className="text-rose-500 text-[11px] font-black">
                                ▼
                              </span>
                            )}
                            <span className="text-slate-800">{ref.rank}</span>
                          </div>
                        </td>

                        {/* Referrer url with Icon & External Link */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 max-w-[550px] truncate">
                            {/* External link button */}
                            <a
                              href={safeHref(
                                ref.fullUrl ||
                                (ref.referrerUrl.startsWith("http")
                                  ? ref.referrerUrl
                                  : `https://${ref.referrerUrl}`),
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-[#1058D1] transition-colors shrink-0"
                              title={`Open ${ref.fullUrl || ref.referrerUrl} in new tab`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Favicon */}
                            <WebsiteFavicon
                              url={ref.fullUrl || ref.referrerUrl}
                              domain={ref.domain || ref.referrerUrl}
                              size={14}
                              className="shrink-0"
                            />

                            {/* URL link: Full URL */}
                            <a
                              href={safeHref(
                                ref.fullUrl ||
                                (ref.referrerUrl.startsWith("http")
                                  ? ref.referrerUrl
                                  : `https://${ref.referrerUrl}`),
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold font-mono text-xs text-slate-800 hover:text-[#1058D1] hover:underline truncate"
                              title={ref.fullUrl || ref.referrerUrl}
                            >
                              {ref.fullUrl || ref.referrerUrl}
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
              of <span className="font-bold text-slate-900">{totalRows}</span>{" "}
              referrer domains
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* SECONDARY SECTION: TRAFFIC CHANNELS & UTM CAMPAIGNS */}
        <div className="w-full pt-2">
          {/* Main Channels Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#1455bb]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Traffic Medium / Channels
                </h3>
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
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800 text-xs font-mono truncate max-w-[280px]" title={s.fullUrl || s.url || s.source}>
                          {s.fullUrl || s.url || s.source}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-[#1455bb]">
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
                          className="bg-gradient-to-r from-[#1455bb] to-[#1a62d4] h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(5, pct))}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
