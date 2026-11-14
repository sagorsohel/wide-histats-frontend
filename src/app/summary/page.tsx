"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { getSocket } from "@/lib/socket";
import {
  OverviewStats,
  PageStat,
  SourceStat,
  CountryStat,
  DeviceStat,
  BrowserStat,
  CityStat,
  OsStat,
  ReferrerStat,
} from "@/types/analytics";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import { TopPagesTable } from "@/components/analytics/TopPagesTable";
import { SourcesChart } from "@/components/analytics/SourcesChart";
import { GeographyTable } from "@/components/analytics/GeographyTable";
import { DeviceBreakdown } from "@/components/analytics/DeviceBreakdown";
import { AudienceLoyaltyCard } from "@/components/analytics/AudienceLoyaltyCard";
import { TopCitiesTable } from "@/components/analytics/TopCitiesTable";
import { OperatingSystemsCard } from "@/components/analytics/OperatingSystemsCard";
import { SearchAndSocialCard } from "@/components/analytics/SearchAndSocialCard";
import { Users, Eye, Activity, Plus } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { useReportLoader, emptyOverview, ReportFetchContext } from "@/hooks/useReportLoader";

export default function SummaryPage() {
  const { selectedWebsite, websites, websitesLoaded } = useWebsite();

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [sources, setSources] = useState<SourceStat[]>([]);
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [cities, setCities] = useState<CityStat[]>([]);
  const [totalCountries, setTotalCountries] = useState<number | undefined>(undefined);
  const [totalCities, setTotalCities] = useState<number | undefined>(undefined);
  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStat[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OsStat[]>([]);
  const [referrers, setReferrers] = useState<ReferrerStat[]>([]);

  const resetData = useCallback(() => {
    setOverview(null);
    setPages([]);
    setSources([]);
    setCountries([]);
    setCities([]);
    setTotalCountries(undefined);
    setTotalCities(undefined);
    setDevices([]);
    setBrowsers([]);
    setOperatingSystems([]);
    setReferrers([]);
  }, []);

  const fetcher = useCallback(
    async (ctx: ReportFetchContext) => {
      if (ctx.isFuture) {
        // A future window cannot have traffic.
        resetData();
        setOverview(emptyOverview(ctx.from, ctx.to));
        return;
      }

      const q = ctx.query;
      const [
        overviewRes,
        pagesRes,
        sourcesRes,
        geoRes,
        devicesRes,
        browsersRes,
        osRes,
      ] = await Promise.all([
        ctx.get<OverviewStats>(`/api/v1/analytics/overview?${q}`),
        ctx.get<PageStat[]>(`/api/v1/analytics/pages?${q}&limit=6`),
        ctx.get<{ sources: SourceStat[]; referrers?: ReferrerStat[] }>(
          `/api/v1/analytics/sources?${q}&limit=12`,
        ),
        ctx.get<{ countries: CountryStat[]; cities: CityStat[]; totalCountries?: number; totalCities?: number }>(
          `/api/v1/analytics/geography?${q}&limit=15`,
        ),
        ctx.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
        ctx.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
        ctx.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}&limit=6`),
      ]);

      // A newer load (other website / range) started meanwhile: drop these results.
      if (ctx.isStale()) return;

      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (sourcesRes.success && sourcesRes.data) {
        setSources(sourcesRes.data.sources || []);
        setReferrers(sourcesRes.data.referrers || []);
      }
      if (geoRes.success && geoRes.data) {
        setCountries(geoRes.data.countries || []);
        setCities(geoRes.data.cities || []);
        setTotalCountries(geoRes.data.totalCountries);
        setTotalCities(geoRes.data.totalCities);
      }
      if (devicesRes.success && devicesRes.data) setDevices(devicesRes.data);
      if (browsersRes.success && browsersRes.data) setBrowsers(browsersRes.data);
      if (osRes.success && osRes.data) setOperatingSystems(osRes.data);
    },
    [resetData],
  );

  const {
    range,
    customWindow,
    setRange: handleRangeChange,
    setCustomWindow: handleCustomRangeChange,
    loading,
    bounds,
  } = useReportLoader({ fetcher, onSiteChange: resetData, intervalMs: 30_000 });

  // Live pageviews only belong to a window that contains "now".
  const includesNowRef = React.useRef(bounds.includesNow);
  includesNowRef.current = bounds.includesNow;

  // Listen to live updates via Socket.IO
  useEffect(() => {
    const siteId = selectedWebsite?.id;
    if (!siteId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (data?.websiteId !== siteId || typeof data.activeCount !== "number") return;
      setOverview((prev) => (prev ? { ...prev, activeVisitors: data.activeCount } : prev));
    };

    const handlePageView = (data: any) => {
      if (data?.websiteId !== siteId || !includesNowRef.current) return;
      setOverview((prev) =>
        prev ? { ...prev, totalPageviews: (prev.totalPageviews || 0) + 1 } : prev,
      );
    };

    socket.on("website:realtime_update", handleRealtimeUpdate);
    socket.on("website:realtime_init", handleRealtimeUpdate);
    socket.on("website:pageview", handlePageView);

    return () => {
      socket.off("website:realtime_update", handleRealtimeUpdate);
      socket.off("website:realtime_init", handleRealtimeUpdate);
      socket.off("website:pageview", handlePageView);
    };
  }, [selectedWebsite?.id]);

  // Empty state if no websites exist
  if (websitesLoaded && websites.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-500/10">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          Welcome to Analycos!
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          You don&apos;t have any websites registered yet. Register your first
          website to generate an instant tracking script and begin recording
          live visitor analytics.
        </p>
        <Link
          href="/websites"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1d5b9f] hover:bg-[#174980] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Your First Website
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 relative select-text antialiased w-full">
      {/* ============================================================ */}
      {/* ROW 1: UNIFIED Daily Stats (Left) + Calendar (Right)         */}
      {/* ============================================================ */}
      <DailyStatsCard
        overview={overview}
        loading={loading}
        range={range}
        domain={selectedWebsite?.domain}
        liveOnlineCount={overview?.activeVisitors}
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
      {/* ROW 2: New vs Returning (Left) + Lifetime Totals (Right)     */}
      {/* Heights matched, widths matched!                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch w-full">
        {/* Feature 1: New vs. Returning Visitors */}
        <div className="lg:col-span-8 flex flex-col">
          <AudienceLoyaltyCard
            firstTimeVisitors={overview?.firstTimeVisitors}
            returningVisitors={overview?.returningVisitors}
            newVisitorsPct={overview?.newVisitorsPct}
            returningVisitorsPct={overview?.returningVisitorsPct}
            totalVisitors={overview?.uniqueVisitors}
            loading={loading}
            className="h-full"
          />
        </div>

        {/* Lifetime Totals Card (Row 2 Right, Height matched to Audience Loyalty) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-2.5 flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 rounded-full bg-[#1058D1] shadow-xs" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1058D1]">
                  Lifetime Totals
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#1058D1]/10 text-[#1058D1] border border-[#1058D1]/20 shadow-2xs">
                Since Installed
              </span>
            </div>

            {/* 3 Dedicated Stats Cards - Unified with #1058D1 */}
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              {/* Card 1: All-Time Users */}
              <div className="rounded-xl px-3 py-2 bg-slate-50/70 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all group flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                    All-Time Total Users
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#1058D1] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-6 w-16 bg-slate-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-[#1058D1] tracking-tight tabular-nums">
                      {formatNumber(overview?.allTimeVisitors ?? 0)}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">
                    Individuals
                  </span>
                </div>
              </div>

              {/* Card 2: All-Time Views */}
              <div className="rounded-xl px-3 py-2 bg-slate-50/70 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all group flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                    All-Time Views
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#1058D1] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-6 w-16 bg-slate-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-[#1058D1] tracking-tight tabular-nums">
                      {formatNumber(overview?.allTimePageviews ?? 0)}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">
                    Impressions
                  </span>
                </div>
              </div>

              {/* Card 3: All-Time Visits */}
              <div className="rounded-xl px-3 py-2 bg-slate-50/70 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all group flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                    All-Time Visits
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#1058D1] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-6 w-16 bg-slate-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-[#1058D1] tracking-tight tabular-nums">
                      {formatNumber(overview?.allTimeSessions ?? 0)}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">
                    Sessions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: Top Pages Table (Full Width)                      */}
      {/* ============================================================ */}
      <div className="w-full">
        <TopPagesTable
          pages={pages}
          domain={selectedWebsite?.domain}
          loading={loading}
        />
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: Traffic Sources & Search/Social (Full Width 2-Col) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch w-full">
        <SourcesChart sources={sources} loading={loading} />
        <SearchAndSocialCard referrers={referrers} loading={loading} />
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: Geography (Top Cities & Visitors by Country)      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch w-full">
        <TopCitiesTable
          cities={cities}
          totalCities={totalCities}
          loading={loading}
        />
        <GeographyTable
          countries={countries}
          totalCountries={totalCountries}
          loading={loading}
        />
      </div>

      {/* ============================================================ */}
      {/* SECTION 5: Devices & Operating Systems (Full Width 2-Col)    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch w-full">
        <DeviceBreakdown
          devices={devices}
          browsers={browsers}
          loading={loading}
        />
        <OperatingSystemsCard
          operatingSystems={operatingSystems}
          loading={loading}
        />
      </div>
    </div>
  );
}
