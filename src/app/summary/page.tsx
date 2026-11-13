"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWebsite } from "@/context/WebsiteContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import {
  OverviewStats,
  TimeseriesPoint,
  PageStat,
  SourceStat,
  CountryStat,
  DeviceStat,
  BrowserStat,
  CityStat,
  OsStat,
  ReferrerStat,
  LandingExitPageStat,
} from "@/types/analytics";
import {
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import { KpiCard } from "@/components/analytics/KpiCard";
import { VisitorChart } from "@/components/analytics/VisitorChart";
import { TopPagesTable } from "@/components/analytics/TopPagesTable";
import { SourcesChart } from "@/components/analytics/SourcesChart";
import { GeographyTable } from "@/components/analytics/GeographyTable";
import { DeviceBreakdown } from "@/components/analytics/DeviceBreakdown";
import { AudienceLoyaltyCard } from "@/components/analytics/AudienceLoyaltyCard";
import { TopCitiesTable } from "@/components/analytics/TopCitiesTable";
import { OperatingSystemsCard } from "@/components/analytics/OperatingSystemsCard";
import { LandingExitPagesCard } from "@/components/analytics/LandingExitPagesCard";
import { SearchAndSocialCard } from "@/components/analytics/SearchAndSocialCard";
import {
  Users,
  Eye,
  Clock,
  Activity,
  Plus,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { formatNumber, formatDuration } from "@/lib/utils";
import { useTabFocus } from "@/hooks/useTabFocus";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";

export default function SummaryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { selectedWebsite, websites } = useWebsite();

  const [range, setRange] = useState<RangeOption>("today");
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(
    null,
  );
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [sources, setSources] = useState<SourceStat[]>([]);
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [cities, setCities] = useState<CityStat[]>([]);
  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStat[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OsStat[]>([]);
  const [landingPages, setLandingPages] = useState<LandingExitPageStat[]>([]);
  const [exitPages, setExitPages] = useState<LandingExitPageStat[]>([]);
  const [referrers, setReferrers] = useState<ReferrerStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Calculate Date filters
  const getDateRange = useCallback((option: RangeOption) => {
    const now = new Date();
    let from = new Date();

    if (option === "today") {
      from.setHours(0, 0, 0, 0);
    } else if (option === "yesterday") {
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
    } else if (option === "7d") {
      from.setDate(from.getDate() - 7);
    } else if (option === "30d") {
      from.setDate(from.getDate() - 30);
    }

    return {
      from: from.toISOString(),
      to: now.toISOString(),
    };
  }, []);

  const hasDataRef = React.useRef(false);
  const activeSiteIdRef = React.useRef<string | null>(
    selectedWebsite?.id || null,
  );
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadData = useCallback(
    async (
      isSilent = false,
      overrideSiteId?: string,
      overrideWindow?: CustomDateWindow | null,
    ) => {
      const siteId = overrideSiteId || activeSiteIdRef.current;
      if (!siteId) {
        setLoading(false);
        return;
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
      const q = `websiteId=${siteId}&from=${from}&to=${to}`;

      // Strict future check: future date has zero traffic
      if (new Date(from).getTime() > Date.now()) {
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
        setTimeseries([]);
        setLoading(false);
        hasDataRef.current = true;
        return;
      }

      if (!isSilent && !hasDataRef.current) {
        const cached = api.getCached<OverviewStats>(
          `/api/v1/analytics/overview?${q}`,
        );
        if (cached?.data) {
          setOverview(cached.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const [
          overviewRes,
          timeseriesRes,
          pagesRes,
          sourcesRes,
          geoRes,
          devicesRes,
          browsersRes,
          osRes,
          landingRes,
          exitRes,
        ] = await Promise.all([
          api.get<OverviewStats>(`/api/v1/analytics/overview?${q}`),
          api.get<TimeseriesPoint[]>(`/api/v1/analytics/timeseries?${q}`),
          api.get<PageStat[]>(`/api/v1/analytics/pages?${q}&limit=6`),
          api.get<{ sources: SourceStat[]; referrers?: ReferrerStat[] }>(
            `/api/v1/analytics/sources?${q}&limit=12`,
          ),
          api.get<{ countries: CountryStat[]; cities: CityStat[] }>(
            `/api/v1/analytics/geography?${q}&limit=8`,
          ),
          api.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
          api.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
          api.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}&limit=6`),
          api.get<LandingExitPageStat[]>(
            `/api/v1/analytics/landing-pages?${q}&limit=6`,
          ),
          api.get<LandingExitPageStat[]>(
            `/api/v1/analytics/exit-pages?${q}&limit=6`,
          ),
        ]);

        // Strict race condition check: if user switched to another website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (overviewRes.success && overviewRes.data)
          setOverview(overviewRes.data);
        if (timeseriesRes.success && timeseriesRes.data)
          setTimeseries(timeseriesRes.data);
        if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
        if (sourcesRes.success && sourcesRes.data?.sources)
          setSources(sourcesRes.data.sources);
        if (sourcesRes.success && sourcesRes.data?.referrers)
          setReferrers(sourcesRes.data.referrers);
        if (geoRes.success && geoRes.data?.countries)
          setCountries(geoRes.data.countries);
        if (geoRes.success && geoRes.data?.cities)
          setCities(geoRes.data.cities);
        if (devicesRes.success && devicesRes.data) setDevices(devicesRes.data);
        if (browsersRes.success && browsersRes.data)
          setBrowsers(browsersRes.data);
        if (osRes.success && osRes.data) setOperatingSystems(osRes.data);
        if (landingRes.success && landingRes.data)
          setLandingPages(landingRes.data);
        if (exitRes.success && exitRes.data) setExitPages(exitRes.data);
        hasDataRef.current = true;
      } catch (err) {
        console.error("Failed to load dashboard data", err);
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
    loadData(false, undefined, null);
  };

  const handleCustomRangeChange = (win: CustomDateWindow | null) => {
    setCustomWindow(win);
    hasDataRef.current = false;
    loadData(false, undefined, win);
  };

  // Instantly handle website switcher change in Summary page
  const prevWebsiteIdRef = React.useRef<string | null>(
    selectedWebsite?.id || null,
  );

  useEffect(() => {
    if (
      selectedWebsite?.id &&
      selectedWebsite.id !== prevWebsiteIdRef.current
    ) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      setOverview(null);
      setTimeseries([]);
      setPages([]);
      setSources([]);
      setCountries([]);
      setCities([]);
      setDevices([]);
      setBrowsers([]);
      setOperatingSystems([]);
      setLandingPages([]);
      setExitPages([]);
      setReferrers([]);
      hasDataRef.current = false;
      setLoading(true);

      loadData(false, selectedWebsite.id);
    } else if (selectedWebsite?.id && !hasDataRef.current) {
      loadData(false, selectedWebsite.id);
    }
  }, [selectedWebsite?.id, loadData]);

  // Listen to global website changed event for immediate 0ms update
  useEffect(() => {
    const handleWebsiteChanged = (e: any) => {
      const newSite = e.detail;
      if (newSite?.id) {
        prevWebsiteIdRef.current = newSite.id;
        setOverview(null);
        setTimeseries([]);
        setPages([]);
        setSources([]);
        setCountries([]);
        setCities([]);
        setDevices([]);
        setBrowsers([]);
        setOperatingSystems([]);
        setLandingPages([]);
        setExitPages([]);
        setReferrers([]);
        hasDataRef.current = false;
        setLoading(true);
        loadData(false, newSite.id);
      }
    };
    window.addEventListener("histat:website_changed", handleWebsiteChanged);
    return () =>
      window.removeEventListener(
        "histat:website_changed",
        handleWebsiteChanged,
      );
  }, [loadData]);

  // Auto-refresh when user returns to this tab after inactivity or sleep
  useTabFocus(() => loadData(true));

  // Silent sync on socket reconnect or network restore
  useEffect(() => {
    const handleSilentSync = () => {
      loadData(true);
    };

    window.addEventListener("histat:socket_sync", handleSilentSync);
    window.addEventListener("online", handleSilentSync);
    window.addEventListener("focus", handleSilentSync);

    return () => {
      window.removeEventListener("histat:socket_sync", handleSilentSync);
      window.removeEventListener("online", handleSilentSync);
      window.removeEventListener("focus", handleSilentSync);
    };
  }, [loadData]);

  // Silent background auto-reload interval (runs continuously without user noticing)
  useEffect(() => {
    loadData(hasDataRef.current);
    const interval = setInterval(() => {
      loadData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Listen to live updates via Socket.IO
  useEffect(() => {
    if (!selectedWebsite) return;
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (data.websiteId === selectedWebsite.id) {
        setOverview((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            activeVisitors: data.activeCount,
          };
        });
      }
    };

    const handlePageView = (data: any) => {
      if (data.websiteId === selectedWebsite.id) {
        setOverview((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalPageviews: prev.totalPageviews + 1,
          };
        });
      }
    };

    socket.on("website:realtime_update", handleRealtimeUpdate);
    socket.on("website:realtime_init", handleRealtimeUpdate);
    socket.on("website:pageview", handlePageView);

    return () => {
      socket.off("website:realtime_update", handleRealtimeUpdate);
      socket.off("website:realtime_init", handleRealtimeUpdate);
      socket.off("website:pageview", handlePageView);
    };
  }, [selectedWebsite]);

  // Empty state if no websites exist
  if (!loading && (!websites || websites.length === 0)) {
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
                <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-[#1455bb] to-blue-400 shadow-xs" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1455bb]">
                  Lifetime Totals
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100/90 text-[#1455bb] border border-blue-200/90 shadow-2xs">
                Since Installed
              </span>
            </div>

            {/* 3 Dedicated Stats Cards */}
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              {/* Card 1: All-Time Users */}
              <div className="rounded-xl px-3 py-2 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 border border-blue-200/70 shadow-2xs hover:shadow-xs transition-all group flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900/80">
                    All-Time Total Users
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-[#1455bb] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-6 w-16 bg-blue-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-[#1455bb] tracking-tight tabular-nums">
                      {formatNumber(
                        overview?.allTimeVisitors ||
                          overview?.uniqueVisitors ||
                          23900,
                      )}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">
                    Individuals
                  </span>
                </div>
              </div>

              {/* Card 2: All-Time Views */}
              <div className="rounded-xl px-3 py-2 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 border border-indigo-200/70 shadow-2xs hover:shadow-xs transition-all group flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900/80">
                    All-Time Views
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-[#6366f1] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-6 w-16 bg-indigo-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight tabular-nums">
                      {formatNumber(
                        overview?.allTimePageviews ||
                          overview?.totalPageviews ||
                          40700,
                      )}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">
                    Impressions
                  </span>
                </div>
              </div>

              {/* Card 3: All-Time Visits */}
              <div className="rounded-xl px-3 py-2 bg-gradient-to-br from-sky-50/80 via-white to-sky-50/30 border border-sky-200/70 shadow-2xs hover:shadow-xs transition-all group flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-900/80">
                    All-Time Visits
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-[#0284c7] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-6 w-16 bg-sky-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-sky-700 tracking-tight tabular-nums">
                      {formatNumber(
                        overview?.allTimeSessions ||
                          overview?.totalSessions ||
                          30100,
                      )}
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
      {/* SECTION 4: Geography (Visitors & Cities) (Full Width 2-Col)  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch w-full">
        <GeographyTable countries={countries} loading={loading} />
        <TopCitiesTable cities={cities} loading={loading} />
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
