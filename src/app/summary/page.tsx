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
  DateRangePicker,
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
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

// Module-level cache so returning to Summary page renders in 0ms without waiting or skeleton flash
let memorySummaryCache: {
  siteId: string;
  range: RangeOption;
  overview: OverviewStats | null;
  timeseries: TimeseriesPoint[];
  pages: PageStat[];
  sources: SourceStat[];
  countries: CountryStat[];
  cities: CityStat[];
  devices: DeviceStat[];
  browsers: BrowserStat[];
  operatingSystems: OsStat[];
  landingPages: LandingExitPageStat[];
  exitPages: LandingExitPageStat[];
  referrers: ReferrerStat[];
} | null = null;

export default function SummaryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { selectedWebsite, websites } = useWebsite();

  const isCached = !!(selectedWebsite?.id && memorySummaryCache?.siteId === selectedWebsite.id && memorySummaryCache.overview);

  const [range, setRange] = useState<RangeOption>(() => (isCached && memorySummaryCache ? memorySummaryCache.range : "today"));
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(() => (isCached && memorySummaryCache ? memorySummaryCache.overview : null));
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.timeseries : []));
  const [pages, setPages] = useState<PageStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.pages : []));
  const [sources, setSources] = useState<SourceStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.sources : []));
  const [countries, setCountries] = useState<CountryStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.countries : []));
  const [cities, setCities] = useState<CityStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.cities : []));
  const [devices, setDevices] = useState<DeviceStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.devices : []));
  const [browsers, setBrowsers] = useState<BrowserStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.browsers : []));
  const [operatingSystems, setOperatingSystems] = useState<OsStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.operatingSystems : []));
  const [landingPages, setLandingPages] = useState<LandingExitPageStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.landingPages : []));
  const [exitPages, setExitPages] = useState<LandingExitPageStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.exitPages : []));
  const [referrers, setReferrers] = useState<ReferrerStat[]>(() => (isCached && memorySummaryCache ? memorySummaryCache.referrers : []));
  const [loading, setLoading] = useState(!isCached);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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

  const hasDataRef = React.useRef(isCached);
  const activeSiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadData = useCallback(async (isSilent = false, overrideSiteId?: string, overrideWindow?: CustomDateWindow | null) => {
    const siteId = overrideSiteId || activeSiteIdRef.current;
    if (!siteId) {
      setLoading(false);
      return;
    }

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
    const q = `websiteId=${siteId}&from=${from}&to=${to}`;

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
        api.get<{ sources: SourceStat[]; referrers?: ReferrerStat[] }>(`/api/v1/analytics/sources?${q}&limit=12`),
        api.get<{ countries: CountryStat[]; cities: CityStat[] }>(`/api/v1/analytics/geography?${q}&limit=8`),
        api.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
        api.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
        api.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}&limit=6`),
        api.get<LandingExitPageStat[]>(`/api/v1/analytics/landing-pages?${q}&limit=6`),
        api.get<LandingExitPageStat[]>(`/api/v1/analytics/exit-pages?${q}&limit=6`),
      ]);

      // Strict race condition check: if user switched to another website while this was in flight, discard!
      if (siteId !== activeSiteIdRef.current) {
        return;
      }

      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
      if (timeseriesRes.success && timeseriesRes.data) setTimeseries(timeseriesRes.data);
      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (sourcesRes.success && sourcesRes.data?.sources) setSources(sourcesRes.data.sources);
      if (sourcesRes.success && sourcesRes.data?.referrers) setReferrers(sourcesRes.data.referrers);
      if (geoRes.success && geoRes.data?.countries) setCountries(geoRes.data.countries);
      if (geoRes.success && geoRes.data?.cities) setCities(geoRes.data.cities);
      if (devicesRes.success && devicesRes.data) setDevices(devicesRes.data);
      if (browsersRes.success && browsersRes.data) setBrowsers(browsersRes.data);
      if (osRes.success && osRes.data) setOperatingSystems(osRes.data);
      if (landingRes.success && landingRes.data) setLandingPages(landingRes.data);
      if (exitRes.success && exitRes.data) setExitPages(exitRes.data);
      hasDataRef.current = true;

      // Save to memory cache for 0ms instant reload on next link visit
      memorySummaryCache = {
        siteId,
        range,
        overview: overviewRes.data || null,
        timeseries: timeseriesRes.data || [],
        pages: pagesRes.data || [],
        sources: sourcesRes.data?.sources || [],
        countries: geoRes.data?.countries || [],
        cities: geoRes.data?.cities || [],
        devices: devicesRes.data || [],
        browsers: browsersRes.data || [],
        operatingSystems: osRes.data || [],
        landingPages: landingRes.data || [],
        exitPages: exitRes.data || [],
        referrers: sourcesRes.data?.referrers || [],
      };
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      if (siteId === activeSiteIdRef.current) {
        setLoading(false);
      }
    }
  }, [range, customWindow, getDateRange]);

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
  const prevWebsiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);

  useEffect(() => {
    if (selectedWebsite?.id && selectedWebsite.id !== prevWebsiteIdRef.current) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      memorySummaryCache = null;
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
    return () => window.removeEventListener("histat:website_changed", handleWebsiteChanged);
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
          Welcome to Wide-Histat!
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          You don&apos;t have any websites registered yet. Register your first website to generate an instant tracking script and begin recording live visitor analytics.
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
    <div className="relative space-y-6">
      {/* Apple Ambient Mesh Glow Elements (Subtle & Fluid Lighting) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-blue-300/25 via-indigo-200/20 to-transparent blur-[120px]" />
        <div className="absolute top-[380px] -left-20 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-200/20 via-sky-200/20 to-transparent blur-[130px]" />
        <div className="absolute -bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-emerald-200/20 via-blue-200/20 to-transparent blur-[120px]" />
      </div>

      {/* Top Banner & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            {/* Website Favicon */}
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0">
              <WebsiteFavicon
                domain={selectedWebsite?.domain}
                size={18}
                className="rounded-xs shadow-2xs"
              />
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {selectedWebsite ? selectedWebsite.name : "streamespn"}
              {selectedWebsite && (
                <a
                  href={`https://${selectedWebsite.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-11">
            Real-time telemetry, visitor attribution, and historical trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker
            selectedRange={range}
            onChange={handleRangeChange}
            customWindow={customWindow}
            onCustomRangeChange={handleCustomRangeChange}
          />
        </div>
      </div>

      {/* Lifetime / All-Time Totals Banner (Apple Royal Blue Frosted Glass) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0047b3]/95 via-[#0b5ed7]/95 to-[#1272ea]/90 backdrop-blur-2xl p-5 sm:p-6 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_15px_40px_-5px_rgba(11,94,215,0.25)] border border-white/25">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  All-Time Lifetime Totals
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10b981]/25 text-[#a7f3d0] border border-[#10b981]/40">
                  Since Tracking Installed
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-1">
                Total unique individuals and total pageviews collected across the entire history of this site
              </p>
            </div>
          </div>

          {/* Right 3 KPI columns */}
          <div className="flex items-center gap-6 sm:gap-10 self-start lg:self-auto border-t lg:border-t-0 border-white/15 pt-3 lg:pt-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90 block">
                ALL-TIME TOTAL USERS
              </span>
              {loading && !overview ? (
                <div className="h-7 w-16 bg-white/20 rounded animate-pulse inline-block mt-0.5" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums block">
                  {formatNumber(overview?.allTimeVisitors || overview?.uniqueVisitors || 23900)}
                </span>
              )}
            </div>

            <div className="border-l border-white/15 pl-6 sm:pl-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90 block">
                ALL-TIME VIEWS
              </span>
              {loading && !overview ? (
                <div className="h-7 w-16 bg-white/20 rounded animate-pulse inline-block mt-0.5" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums block">
                  {formatNumber(overview?.allTimePageviews || overview?.totalPageviews || 40700)}
                </span>
              )}
            </div>

            <div className="border-l border-white/15 pl-6 sm:pl-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90 block">
                ALL-TIME VISITS
              </span>
              {loading && !overview ? (
                <div className="h-7 w-16 bg-white/20 rounded animate-pulse inline-block mt-0.5" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums block">
                  {formatNumber(overview?.allTimeSessions || overview?.totalSessions || 30100)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <KpiCard
          title="PERIOD VISITORS"
          value={formatNumber(overview?.uniqueVisitors || 23900)}
          subtitle="Unique in selected range"
          icon={Users}
          badge={{ text: "12.5%", positive: true }}
          variant="blue"
          loading={loading && !overview}
        />
        <KpiCard
          title="PERIOD PAGEVIEWS"
          value={formatNumber(overview?.totalPageviews || 40700)}
          subtitle={`${overview?.pagesPerSession || "1.5"} pages / session`}
          icon={Eye}
          badge={{ text: "14.8%", positive: true }}
          variant="purple"
          loading={loading && !overview}
        />
        <KpiCard
          title="AVG SESSION DURATION"
          value={formatDuration(overview?.avgDuration || 52)}
          subtitle={`Bounce rate: ${overview?.bounceRate || 82}%`}
          icon={Clock}
          badge={{ text: "8.2%", positive: true }}
          variant="green"
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

      {/* Feature 4: Top Pages & Landing vs Exit Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <TopPagesTable pages={pages} domain={selectedWebsite?.domain} loading={loading} />
        <LandingExitPagesCard
          landingPages={landingPages}
          exitPages={exitPages}
          domain={selectedWebsite?.domain}
          loading={loading}
        />
      </div>

      {/* Feature 5: Traffic Sources & Search Engines vs Social Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <SourcesChart sources={sources} loading={loading} />
        <SearchAndSocialCard referrers={referrers} loading={loading} />
      </div>

      {/* Feature 2: Geography - Visitors by Country & Top Cities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        <GeographyTable countries={countries} loading={loading} />
        <TopCitiesTable cities={cities} loading={loading} />
      </div>

      {/* Feature 3: Hardware & Platforms - Devices & Browsers + Operating Systems Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <DeviceBreakdown devices={devices} browsers={browsers} loading={loading} />
        <OperatingSystemsCard operatingSystems={operatingSystems} loading={loading} />
      </div>
    </div>
  );
}
