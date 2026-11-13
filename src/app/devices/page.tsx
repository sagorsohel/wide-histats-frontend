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
import { formatCommas } from "@/lib/utils";

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

      {/* ============================================================ */}
      {/* 1. TOP ROW: UNIFIED DAILY STATS & COMPACT CALENDAR           */}
      {/* ============================================================ */}
      <DailyStatsCard
        title="Device & platform stats"
        items={deviceStatItems}
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
      {/* 2. DEVICE CATEGORIES CARDS (Desktop, Mobile, Tablet)         */}
      {/* ============================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch w-full">
        {/* Browsers Table */}
        <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 transition-all duration-300">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                    Browser Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Web browser client distribution
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs whitespace-nowrap shrink-0">
                <span>Total: {browsers.length}</span>
              </span>
            </div>

            {/* Content List */}
            {loading && browsers.length === 0 ? (
              <div className="space-y-1.5 flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-md bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : browsers.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                No browser records found for this period.
              </div>
            ) : (
              <div className="flex-1 max-h-[460px] overflow-y-auto pr-1">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-600 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-5 text-center text-slate-400">#</span>
                    <span>Browser</span>
                  </div>
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <span className="w-20 text-right">Visits</span>
                    <span className="w-12 text-right">Share</span>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-1">
                  {browsers.map((b, idx) => {
                    const percentage = Math.round(
                      (b.sessions / totalBrowserSessions) * 100,
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#e8e8e8]"
                        }`}
                      >
                        {/* Left: # + Icon + Browser Name */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <span className="w-5 text-slate-400 font-mono text-[11px] shrink-0 text-center">
                            {idx + 1}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200/70 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            <BrowserIcon browser={b.browser} size={15} />
                          </div>
                          <span className="font-semibold text-slate-800 text-xs sm:text-[13px] truncate">
                            {b.browser}
                          </span>
                        </div>

                        {/* Right: Visits + Share % */}
                        <div className="flex items-center gap-4 shrink-0 text-right">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm tabular-nums text-right w-20">
                            {formatCommas(b.sessions)}
                          </span>
                          <span className="font-medium text-slate-500 text-xs sm:text-sm tabular-nums text-right w-12">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Client browsers detected</span>
            <span className="font-semibold text-slate-500">
              {formatCommas(totalBrowserSessions)} total sessions
            </span>
          </div>
        </div>

        {/* Operating Systems Table */}
        <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 transition-all duration-300">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                    Operating Systems
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Visitor operating system platforms
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs whitespace-nowrap shrink-0">
                <span>Total: {osList.length}</span>
              </span>
            </div>

            {/* Content List */}
            {loading && osList.length === 0 ? (
              <div className="space-y-1.5 flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-md bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : osList.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                No OS records found for this period.
              </div>
            ) : (
              <div className="flex-1 max-h-[460px] overflow-y-auto pr-1">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-600 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-5 text-center text-slate-400">#</span>
                    <span>Operating System</span>
                  </div>
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <span className="w-20 text-right">Visits</span>
                    <span className="w-12 text-right">Share</span>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-1">
                  {osList.map((o, idx) => {
                    const percentage = Math.round(
                      (o.sessions / totalOsSessions) * 100,
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#e8e8e8]"
                        }`}
                      >
                        {/* Left: # + Icon + OS Name */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <span className="w-5 text-slate-400 font-mono text-[11px] shrink-0 text-center">
                            {idx + 1}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200/70 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            <OsIcon os={o.os} size={15} />
                          </div>
                          <span className="font-semibold text-slate-800 text-xs sm:text-[13px] truncate">
                            {o.os}
                          </span>
                        </div>

                        {/* Right: Visits + Share % */}
                        <div className="flex items-center gap-4 shrink-0 text-right">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm tabular-nums text-right w-20">
                            {formatCommas(o.sessions)}
                          </span>
                          <span className="font-medium text-slate-500 text-xs sm:text-sm tabular-nums text-right w-12">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Platforms &amp; operating systems</span>
            <span className="font-semibold text-slate-500">
              {formatCommas(totalOsSessions)} total sessions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
