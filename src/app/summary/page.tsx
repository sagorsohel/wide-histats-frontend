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
} from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import { KpiCard } from "@/components/analytics/KpiCard";
import { VisitorChart } from "@/components/analytics/VisitorChart";
import { TopPagesTable } from "@/components/analytics/TopPagesTable";
import { SourcesChart } from "@/components/analytics/SourcesChart";
import { GeographyTable } from "@/components/analytics/GeographyTable";
import { DeviceBreakdown } from "@/components/analytics/DeviceBreakdown";
import {
  Users,
  Eye,
  Clock,
  Activity,
  Plus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatNumber, formatDuration } from "@/lib/utils";
import { useTabFocus } from "@/hooks/useTabFocus";

export default function SummaryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { selectedWebsite, websites } = useWebsite();

  const [range, setRange] = useState<RangeOption>("today");
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [sources, setSources] = useState<SourceStat[]>([]);
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStat[]>([]);
  const [loading, setLoading] = useState(true);

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

  const hasDataRef = React.useRef(false);
  const activeSiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadData = useCallback(async (isSilent = false, overrideSiteId?: string) => {
    const siteId = overrideSiteId || activeSiteIdRef.current;
    if (!siteId) {
      setLoading(false);
      return;
    }

    if (!isSilent && !hasDataRef.current) {
      setLoading(true);
    }
    const { from, to } = getDateRange(range);
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
      ] = await Promise.all([
        api.get<OverviewStats>(`/api/v1/analytics/overview?${q}`),
        api.get<TimeseriesPoint[]>(`/api/v1/analytics/timeseries?${q}`),
        api.get<PageStat[]>(`/api/v1/analytics/pages?${q}&limit=6`),
        api.get<{ sources: SourceStat[] }>(`/api/v1/analytics/sources?${q}&limit=6`),
        api.get<{ countries: CountryStat[] }>(`/api/v1/analytics/geography?${q}&limit=6`),
        api.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
        api.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
      ]);

      // Strict race condition check: if user switched to another website while this was in flight, discard!
      if (siteId !== activeSiteIdRef.current) {
        return;
      }

      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
      if (timeseriesRes.success && timeseriesRes.data) setTimeseries(timeseriesRes.data);
      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (sourcesRes.success && sourcesRes.data?.sources) setSources(sourcesRes.data.sources);
      if (geoRes.success && geoRes.data?.countries) setCountries(geoRes.data.countries);
      if (devicesRes.success && devicesRes.data) setDevices(devicesRes.data);
      if (browsersRes.success && browsersRes.data) setBrowsers(browsersRes.data);
      hasDataRef.current = true;
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      if (siteId === activeSiteIdRef.current) {
        setLoading(false);
      }
    }
  }, [range, getDateRange]);

  // Instantly handle website switcher change in Summary page
  const prevWebsiteIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (selectedWebsite?.id && selectedWebsite.id !== prevWebsiteIdRef.current) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      setOverview(null);
      setTimeseries([]);
      setPages([]);
      setSources([]);
      setCountries([]);
      setDevices([]);
      setBrowsers([]);
      hasDataRef.current = false;
      setLoading(true);

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
        setDevices([]);
        setBrowsers([]);
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
    <div className="space-y-5">
      {/* Top Banner & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedWebsite ? selectedWebsite.name : "Summary"}
            </h1>
            {selectedWebsite && (
              <a
                href={`https://${selectedWebsite.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#1d5b9f] hover:underline flex items-center gap-1 font-mono font-medium"
              >
                {selectedWebsite.domain}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, visitor attribution, and historical trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker selectedRange={range} onChange={setRange} />
        </div>
      </div>

      {/* Lifetime / All-Time Totals Banner (Since Tracking Code Installed) */}
      <div className="bg-gradient-to-r from-[#173e6d] via-[#1b4d87] to-[#143760] text-white p-4 rounded-xl shadow-sm border border-[#1b4e8a] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              All-Time Lifetime Totals
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
              Since Tracking Installed
            </span>
          </div>
          <p className="text-[11px] text-blue-200">
            Total unique individuals and total pageviews collected across the entire history of this site
          </p>
        </div>

        <div className="flex items-center gap-6 sm:gap-10">
          <div className="text-right">
            <span className="text-[10px] text-blue-200 block font-semibold uppercase tracking-wider">All-Time Total Users</span>
            {loading && !overview ? (
              <div className="h-7 w-20 bg-blue-300/30 rounded animate-pulse inline-block mt-0.5" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
                {formatNumber(overview?.allTimeVisitors || overview?.uniqueVisitors || 0)}
              </span>
            )}
          </div>
          <div className="text-right border-l border-blue-400/20 pl-6 sm:pl-10">
            <span className="text-[10px] text-blue-200 block font-semibold uppercase tracking-wider">All-Time Views</span>
            {loading && !overview ? (
              <div className="h-7 w-20 bg-blue-300/30 rounded animate-pulse inline-block mt-0.5" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
                {formatNumber(overview?.allTimePageviews || overview?.totalPageviews || 0)}
              </span>
            )}
          </div>
          <div className="text-right border-l border-blue-400/20 pl-6 sm:pl-10 hidden md:block">
            <span className="text-[10px] text-blue-200 block font-semibold uppercase tracking-wider">All-Time Visits</span>
            {loading && !overview ? (
              <div className="h-7 w-20 bg-blue-300/30 rounded animate-pulse inline-block mt-0.5" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
                {formatNumber(overview?.allTimeSessions || overview?.totalSessions || 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Active Online"
          value={overview?.activeVisitors || 0}
          subtitle="Visitors active right now"
          icon={Activity}
          highlight
          badge={{ text: "LIVE", positive: true }}
          loading={loading && !overview}
        />
        <KpiCard
          title="Period Visitors"
          value={formatNumber(overview?.uniqueVisitors || 0)}
          subtitle="Unique in selected range"
          icon={Users}
          loading={loading && !overview}
        />
        <KpiCard
          title="Period Pageviews"
          value={formatNumber(overview?.totalPageviews || 0)}
          subtitle={`${overview?.pagesPerSession || 1} pages / session`}
          icon={Eye}
          loading={loading && !overview}
        />
        <KpiCard
          title="Avg Session Duration"
          value={formatDuration(overview?.avgDuration || 0)}
          subtitle={`Bounce rate: ${overview?.bounceRate || 0}%`}
          icon={Clock}
          loading={loading && !overview}
        />
      </div>

      {/* Main Chart Section */}
      <VisitorChart data={timeseries} loading={loading} />

      {/* Two-column Widgets: Top Pages & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPagesTable pages={pages} domain={selectedWebsite?.domain} loading={loading} />
        <SourcesChart sources={sources} loading={loading} />
      </div>

      {/* Two-column Widgets: Geography & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeographyTable countries={countries} loading={loading} />
        <DeviceBreakdown devices={devices} browsers={browsers} loading={loading} />
      </div>
    </div>
  );
}
