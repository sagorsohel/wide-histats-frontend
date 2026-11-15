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
import { TopPagesTable } from "@/components/analytics/TopPagesTable";
import { SourcesChart } from "@/components/analytics/SourcesChart";
import { GeographyTable } from "@/components/analytics/GeographyTable";
import { DeviceBreakdown } from "@/components/analytics/DeviceBreakdown";
import { AudienceLoyaltyCard } from "@/components/analytics/AudienceLoyaltyCard";
import { TopCitiesTable } from "@/components/analytics/TopCitiesTable";
import { OperatingSystemsCard } from "@/components/analytics/OperatingSystemsCard";
import { SearchAndSocialCard } from "@/components/analytics/SearchAndSocialCard";
import { Users, Eye, Activity, Plus, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { useReportLoader, emptyOverview, ReportFetchContext } from "@/hooks/useReportLoader";

export default function SummaryPage() {
  const { selectedWebsite, websites, websitesLoaded } = useWebsite();
  const realtimeActiveCount = useAppSelector((state) =>
    selectedWebsite?.id
      ? state.realtime.byWebsite[selectedWebsite.id]?.data?.activeCount
      : undefined,
  );

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

  const showSkeleton = loading && !overview;
  const isDaily = range === "today" || range === "yesterday";
  const periodTitle = isDaily ? "Daily stats" : "Period stats";
  const periodDate =
    range === "yesterday"
      ? "Yesterday"
      : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(new Date());

  const liveCount =
    [overview?.activeVisitors, realtimeActiveCount, selectedWebsite?.usersOnline].find(
      (v) => typeof v === "number" && v > 0,
    ) ?? 0;

  const uniq = overview?.uniqueVisitors || 0;
  const firstTime =
    overview?.firstTimeVisitors ?? Math.round(uniq * ((overview?.newVisitorsPct ?? 0) / 100));
  const perVisit = overview?.pagesPerSession
    ? Number(overview.pagesPerSession).toFixed(2)
    : ((overview?.totalPageviews || 0) / Math.max(uniq, 1)).toFixed(2);
  const newRatio =
    overview?.newVisitorsPct ?? (uniq ? Math.round((firstTime / uniq) * 100) : 0);

  const periodRows: { label: string; value: string }[] = [
    { label: "Total page views", value: formatNumber(overview?.totalPageviews || 0) },
    { label: "Total visitors", value: formatNumber(uniq) },
    { label: "First time visitors", value: formatNumber(firstTime) },
    { label: "Page views per visit", value: perVisit },
    { label: "New visitors ratio", value: `${newRatio}%` },
  ];

  const lifetimeRows = [
    { label: "All-time total users", sub: "Individuals", value: overview?.allTimeVisitors ?? 0, Icon: Users },
    { label: "All-time views", sub: "Impressions", value: overview?.allTimePageviews ?? 0, Icon: Eye },
    { label: "All-time visits", sub: "Sessions", value: overview?.allTimeSessions ?? 0, Icon: Activity },
  ];

  const railCard =
    "rounded-[18px] bg-white border border-white/70 shadow-[0_8px_24px_-8px_rgba(8,40,110,0.35)] p-4";
  const railTitle = "text-[11px] font-extrabold uppercase tracking-wider text-[#1058D1]";

  return (
    <div className="relative select-text antialiased w-full grid grid-cols-1 lg:grid-cols-[268px_minmax(0,1fr)] gap-4 items-start">
      {/* ============================ LEFT RAIL ============================ */}
      <aside className="flex flex-col gap-4 min-w-0">
        {/* Online now */}
        <Link
          href="/realtime"
          title="Click to view live users online"
          className="group rounded-[18px] p-4 text-white border border-white/20 shadow-[0_8px_24px_-8px_rgba(8,40,110,0.5)] bg-gradient-to-br from-[#0b46ad] to-[#2d7bf0] block"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold opacity-90">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Online now
            </span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-1 text-[34px] font-extrabold leading-none tracking-tight tabular-nums">
            {showSkeleton ? "–" : liveCount.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] opacity-80">users on your site</div>
        </Link>

        {/* Period / daily stats */}
        <div className={railCard}>
          <div className="flex items-center justify-between mb-1">
            <h3 className={railTitle}>{periodTitle}</h3>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#1058D1]/10 text-[#1058D1]">
              {periodDate}
            </span>
          </div>
          <div>
            {periodRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-baseline justify-between gap-2 py-2.5 ${
                  i < periodRows.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <span className="text-[12px] text-slate-500">{row.label}</span>
                {showSkeleton ? (
                  <span className="h-4 w-12 bg-slate-200/60 rounded animate-pulse" />
                ) : (
                  <span className="text-[17px] font-extrabold text-[#1058D1] tabular-nums">
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime totals */}
        <div className={railCard}>
          <div className="flex items-center justify-between mb-1">
            <h3 className={railTitle}>Lifetime totals</h3>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#1058D1]/10 text-[#1058D1]">
              Since installed
            </span>
          </div>
          {lifetimeRows.map(({ label, sub, value, Icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 py-2.5 ${
                i < lifetimeRows.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="w-8 h-8 rounded-lg bg-[#1058D1]/10 text-[#1058D1] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] text-slate-500 truncate">{label}</div>
                <div className="text-[10px] text-slate-400">{sub}</div>
              </div>
              {showSkeleton ? (
                <span className="h-5 w-14 bg-slate-200/60 rounded animate-pulse" />
              ) : (
                <span className="text-[17px] font-extrabold text-slate-900 tabular-nums">
                  {formatNumber(value)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="rounded-[18px] bg-white border border-white/70 shadow-[0_8px_24px_-8px_rgba(8,40,110,0.35)] p-2.5 flex justify-center">
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCustomRangeChange}
            className="w-full"
          />
        </div>
      </aside>

      {/* =========================== MAIN CONTENT ========================== */}
      <div className="flex flex-col gap-4 min-w-0">
        <TopPagesTable pages={pages} domain={selectedWebsite?.domain} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <AudienceLoyaltyCard
            firstTimeVisitors={overview?.firstTimeVisitors}
            returningVisitors={overview?.returningVisitors}
            newVisitorsPct={overview?.newVisitorsPct}
            returningVisitorsPct={overview?.returningVisitorsPct}
            totalVisitors={overview?.uniqueVisitors}
            loading={loading}
            className="h-full"
          />
          <SourcesChart sources={sources} loading={loading} />
          <SearchAndSocialCard referrers={referrers} loading={loading} />
          <TopCitiesTable cities={cities} totalCities={totalCities} loading={loading} />
          <GeographyTable countries={countries} totalCountries={totalCountries} loading={loading} />
          <DeviceBreakdown devices={devices} browsers={browsers} loading={loading} />
        </div>

        <OperatingSystemsCard operatingSystems={operatingSystems} loading={loading} />
      </div>
    </div>
  );
}
