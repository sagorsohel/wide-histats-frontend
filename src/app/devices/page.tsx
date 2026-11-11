"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import {
  DeviceStat,
  BrowserStat,
  OsStat,
  OverviewStats,
} from "@/types/analytics";
import {
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import { Monitor, Smartphone, Tablet, Globe, Cpu } from "lucide-react";
import { BrowserIcon, OsIcon } from "@/components/common/BrandIcons";
import { useTabFocus } from "@/hooks/useTabFocus";

export default function DevicesReportPage() {
  const { selectedWebsite } = useWebsite();

  const [range, setRange] = useState<RangeOption>("today");
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(
    null,
  );
  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStat[]>([]);
  const [osList, setOsList] = useState<OsStat[]>([]);
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
      const q = `websiteId=${siteId}&from=${from}&to=${to}`;

      // Strict future check: future date has zero traffic
      if (new Date(from).getTime() > Date.now()) {
        setDevices([]);
        setBrowsers([]);
        setOsList([]);
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
        const cached = api.getCached<DeviceStat[]>(
          `/api/v1/analytics/devices?${q}`,
        );
        const cachedOverview = api.getCached<OverviewStats>(
          `/api/v1/analytics/overview?websiteId=${siteId}&from=${from}&to=${to}`,
        );
        if (cached?.data) {
          setDevices(cached.data);
          if (cachedOverview?.data) setOverview(cachedOverview.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const [devRes, brRes, osRes, overviewRes] = await Promise.all([
          api.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
          api.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
          api.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}`),
          api.get<OverviewStats>(
            `/api/v1/analytics/overview?websiteId=${siteId}&from=${from}&to=${to}`,
          ),
        ]);

        // Strict race condition check: if user switched website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (devRes.success && devRes.data) setDevices(devRes.data);
        if (brRes.success && brRes.data) setBrowsers(brRes.data);
        if (osRes.success && osRes.data) setOsList(osRes.data);
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
    loadData(false, undefined, null);
  };

  const handleCustomRangeChange = (win: CustomDateWindow | null) => {
    setCustomWindow(win);
    hasDataRef.current = false;
    loadData(false, undefined, win);
  };

  // Instantly handle website switcher change in Devices page
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
      setDevices([]);
      setBrowsers([]);
      setOsList([]);
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
        setDevices([]);
        setBrowsers([]);
        setOsList([]);
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

  // Auto-refresh when user returns to this tab
  useTabFocus(() => loadData(true));

  // Silent sync on socket reconnect or network restore
  useEffect(() => {
    const handleSilentSync = () => {
      if (selectedWebsite) {
        loadData(true);
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
  }, [selectedWebsite, loadData]);

  useEffect(() => {
    loadData(hasDataRef.current);
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const totalDeviceSessions =
    devices.reduce((sum, d) => sum + d.sessions, 0) || 1;
  const totalBrowserSessions =
    browsers.reduce((sum, b) => sum + b.sessions, 0) || 1;
  const totalOsSessions = osList.reduce((sum, o) => sum + o.sessions, 0) || 1;

  const desktopItem = devices.find((d) => d.device.toLowerCase() === "desktop");
  const mobileItem = devices.find((d) => d.device.toLowerCase() === "mobile");
  const tabletItem = devices.find((d) => d.device.toLowerCase() === "tablet");

  const desktopSessions = desktopItem ? desktopItem.sessions : 0;
  const mobileSessions = mobileItem ? mobileItem.sessions : 0;
  const tabletSessions = tabletItem ? tabletItem.sessions : 0;

  const desktopPct = Math.round((desktopSessions / totalDeviceSessions) * 100);
  const mobilePct = Math.round((mobileSessions / totalDeviceSessions) * 100);
  const tabletPct = Math.round((tabletSessions / totalDeviceSessions) * 100);

  const topBrowser = browsers[0] || null;
  const topBrowserPct = topBrowser
    ? Math.round((topBrowser.sessions / totalBrowserSessions) * 100)
    : 0;

  const topOs = osList[0] || null;
  const topOsPct = topOs
    ? Math.round((topOs.sessions / totalOsSessions) * 100)
    : 0;

  const deviceStatItems = [
    {
      value: mobileSessions.toLocaleString(),
      label: "Mobile visitors",
      sublabel: `${mobilePct}% of all devices`,
      highlight: true,
    },
    {
      value: desktopSessions.toLocaleString(),
      label: "Desktop visitors",
      sublabel: `${desktopPct}% of all devices`,
      highlight: true,
    },
    {
      value: tabletSessions.toLocaleString(),
      label: "Tablet visitors",
      sublabel: `${tabletPct}% of all devices`,
      highlight: true,
    },
    {
      value: totalDeviceSessions.toLocaleString(),
      label: "Total device visits",
      sublabel: "All platform sessions recorded",
      highlight: false,
    },
    {
      value: topBrowser?.browser || "-",
      label: "Top browser",
      sublabel: `${topBrowser?.sessions.toLocaleString() || 0} visits (${topBrowserPct}%)`,
      highlight: false,
    },
    {
      value: topOs?.os || "-",
      label: "Top operating system",
      sublabel: `${topOs?.sessions.toLocaleString() || 0} visits (${topOsPct}%)`,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#1455bb] to-[#1a62d4] flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Devices &amp; Technology
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Browser families, operating systems, and device form factors
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TOP ROW: DAILY STATS CARD & COMPACT CALENDAR              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch w-full">
        {/* Daily Stats Card */}
        <div className="lg:col-span-8 flex flex-col">
          <DailyStatsCard
            title="Device & platform stats"
            items={deviceStatItems}
            overview={overview}
            loading={loading}
            range={range}
            domain={selectedWebsite?.domain}
          />
        </div>

        {/* Right: Authentic Compact Histats Calendar */}
        <div className="lg:col-span-4 flex flex-col">
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCustomRangeChange}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DEVICE CATEGORIES CARDS (Desktop, Mobile, Tablet)         */}
      {/* ============================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browsers Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#1455bb]" />
            <h3 className="font-bold text-base text-slate-900">
              Browser Breakdown
            </h3>
          </div>

          {loading && browsers.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-1 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                    <div className="flex items-center gap-3">
                      <div className="h-3.5 w-14 bg-slate-200 rounded" />
                      <div className="h-3.5 w-8 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5" />
                </div>
              ))}
            </div>
          ) : browsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No browser records found.
            </div>
          ) : (
            <div className="space-y-3">
              {browsers.map((b, i) => {
                const percentage = Math.round(
                  (b.sessions / totalBrowserSessions) * 100,
                );
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <BrowserIcon browser={b.browser} size={16} />
                        <span className="font-semibold text-slate-800">
                          {b.browser}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {b.sessions} visits
                        </span>
                        <span className="text-[#1455bb] font-bold w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#1455bb] h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operating Systems Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">
              Operating Systems
            </h3>
          </div>

          {loading && osList.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-1 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                    <div className="flex items-center gap-3">
                      <div className="h-3.5 w-14 bg-slate-200 rounded" />
                      <div className="h-3.5 w-8 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5" />
                </div>
              ))}
            </div>
          ) : osList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No OS records found.
            </div>
          ) : (
            <div className="space-y-3">
              {osList.map((o, i) => {
                const percentage = Math.round(
                  (o.sessions / totalOsSessions) * 100,
                );
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <OsIcon os={o.os} size={15} />
                        <span className="font-semibold text-slate-800">
                          {o.os}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {o.sessions} visits
                        </span>
                        <span className="text-emerald-700 font-bold w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
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
  );
}
