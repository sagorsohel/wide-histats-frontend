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
    <div className="space-y-6 relative select-text antialiased">
      {/* Top Banner & Website Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-2 relative z-10 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          {/* Website Favicon */}
          <div className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_2px_10px_rgba(20,85,187,0.06)] flex items-center justify-center shrink-0">
            <WebsiteFavicon
              domain={selectedWebsite?.domain}
              size={24}
              className="rounded-xs shadow-2xs"
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {selectedWebsite ? selectedWebsite.name : "streamespn"}
              </h1>
              {selectedWebsite && (
                <a
                  href={`https://${selectedWebsite.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-lg text-slate-400 hover:text-[#1455bb] hover:bg-slate-100 transition-colors inline-flex items-center"
                  title={`Open https://${selectedWebsite.domain}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100/90 text-emerald-700 border border-emerald-200 shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time telemetry, visitor attribution, and historical trends
              for{" "}
              <span className="font-bold text-slate-700">
                {selectedWebsite?.domain || "streamespn.org"}
              </span>
            </p>
          </div>
        </div>

        {/* Current Active Range indicator Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              Active Window:
            </span>
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

      {/* 2-Column Responsive Layout: Left (Main Analytics), Right (Inline Calendar + Stats Cards) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
        {/* ============================================================ */}
        {/* LEFT / MAIN ANALYTICS COLUMN                                 */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-6 w-full order-2 xl:order-1">
          {/* KPI Cards Grid - 4 Vibrant Gradient Cards Matching Reference Design */}
          <div className="grid sm:grid-cols-2   gap-4">
            <KpiCard
              title="Period Visitors"
              value={formatNumber(overview?.uniqueVisitors || 57900)}
              subtitle="Unique in selected range"
              badge={{ text: "12.5%", positive: true }}
              variant="purple"
              countBadge={2}
              loading={loading && !overview}
            />
            <KpiCard
              title="Period Pageviews"
              value={formatNumber(overview?.totalPageviews || 100000)}
              subtitle={`${overview?.pagesPerSession || "1.48"} pages / session`}
              badge={{ text: "14.8%", positive: true }}
              variant="blue"
              countBadge={8}
              loading={loading && !overview}
            />
            <KpiCard
              title="Total Sessions"
              value={formatNumber(overview?.totalSessions || 42300)}
              subtitle="Total recorded visits"
              badge={{ text: "9.5%", positive: true }}
              variant="orange"
              countBadge={2}
              loading={loading && !overview}
            />
            <KpiCard
              title="Avg Duration"
              value={formatDuration(overview?.avgDuration || 80)}
              subtitle={`Bounce rate: ${overview?.bounceRate || 82}%`}
              badge={{ text: "8.2%", positive: true }}
              variant="pink"
              countBadge={2}
              loading={loading && !overview}
            />
          </div>

          {/* Main Chart Section */}
          <VisitorChart data={timeseries} loading={loading} />

          {/* Feature 1: New vs. Returning Visitors (Audience Loyalty & Retention) */}
          <AudienceLoyaltyCard
            firstTimeVisitors={overview?.firstTimeVisitors}
            returningVisitors={overview?.returningVisitors}
            newVisitorsPct={overview?.newVisitorsPct}
            returningVisitorsPct={overview?.returningVisitorsPct}
            totalVisitors={overview?.uniqueVisitors}
            loading={loading}
          />

          {/* Feature 4: Top Pages & Landing vs Exit Pages - Full Width */}
          <div className="space-y-6">
            <TopPagesTable
              pages={pages}
              domain={selectedWebsite?.domain}
              loading={loading}
            />
            <LandingExitPagesCard
              landingPages={landingPages}
              exitPages={exitPages}
              domain={selectedWebsite?.domain}
              loading={loading}
            />
          </div>

          {/* Feature 5: Traffic Sources & Search Engines vs Social Channels - Full Width */}
          <div className="space-y-6">
            <SourcesChart sources={sources} loading={loading} />
            <SearchAndSocialCard referrers={referrers} loading={loading} />
          </div>

          {/* Feature 2: Geography - Visitors by Country & Top Cities Breakdown - Full Width */}
          <div className="space-y-6">
            <GeographyTable countries={countries} loading={loading} />
            <TopCitiesTable cities={cities} loading={loading} />
          </div>

          {/* Feature 3: Hardware & Platforms - Devices & Browsers + Operating Systems Breakdown - Full Width */}
          <div className="space-y-6">
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

        {/* ============================================================ */}
        {/* RIGHT COLUMN: CALENDAR (ON TOP) + LIFETIME TOTALS (BELOW)    */}
        {/* ============================================================ */}
        <div className="w-full xl:w-[291px] shrink-0 space-y-5 xl:sticky xl:top-6 order-1 xl:order-2">
          {/* Section 1: ALWAYS SHOWN CALENDAR (UPOR) */}
          <div className="flex justify-center xl:justify-end">
            <HistatsCalendar
              selectedPreset={range}
              onPresetChange={handleRangeChange}
              currentWindow={customWindow}
              onDateChange={handleCustomRangeChange}
            />
          </div>

          {/* Section 2: ALL-TIME LIFETIME TOTALS STATS CARDS (PORE / NICHE) */}
          <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-[#1455bb] to-blue-400 shadow-sm" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1455bb]">
                  Lifetime Totals
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100/90 text-[#1455bb] border border-blue-200/90 shadow-2xs">
                Since Installed
              </span>
            </div>

            {/* 3 Dedicated Stats Cards with rich card backgrounds */}
            <div className="space-y-3">
              {/* Card 1: All-Time Users */}
              <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 border border-blue-200/70 shadow-xs hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900/80">
                    All-Time Total Users
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-[#1455bb] text-white flex items-center justify-center shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-8 w-20 bg-blue-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-[#1455bb] tracking-tight tabular-nums">
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
              <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/40 border border-indigo-200/70 shadow-xs hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900/80">
                    All-Time Views
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-[#6366f1] text-white flex items-center justify-center shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-8 w-20 bg-indigo-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight tabular-nums">
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
              <div className="rounded-2xl p-4 bg-gradient-to-br from-sky-50/90 via-white to-sky-50/40 border border-sky-200/70 shadow-xs hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-900/80">
                    All-Time Visits
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-[#0284c7] text-white flex items-center justify-center shadow-sm shadow-sky-600/30 group-hover:scale-105 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  {loading && !overview ? (
                    <div className="h-8 w-20 bg-sky-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight tabular-nums">
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
    </div>
  );
}
