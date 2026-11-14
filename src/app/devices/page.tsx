"use client";

import React, { useState, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import {
  DeviceStat,
  BrowserStat,
  OsStat,
  OverviewStats,
} from "@/types/analytics";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import { DevicePieChart } from "@/components/analytics/DevicePieChart";
import { Monitor, Smartphone, Tablet, Globe, Cpu } from "lucide-react";
import { BrowserIcon, OsIcon } from "@/components/common/BrandIcons";
import { useReportLoader, emptyOverview, ReportFetchContext } from "@/hooks/useReportLoader";
import { formatCommas } from "@/lib/utils";

export default function DevicesReportPage() {
  const { selectedWebsite } = useWebsite();

  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStat[]>([]);
  const [osList, setOsList] = useState<OsStat[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);

  const resetData = useCallback(() => {
    setDevices([]);
    setBrowsers([]);
    setOsList([]);
    setOverview(null);
  }, []);

  const fetcher = useCallback(
    async (ctx: ReportFetchContext) => {
      if (ctx.isFuture) {
        resetData();
        setOverview(emptyOverview(ctx.from, ctx.to));
        return;
      }
      const q = ctx.query;
      const [devRes, brRes, osRes, overviewRes] = await Promise.all([
        ctx.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
        ctx.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
        ctx.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}`),
        ctx.get<OverviewStats>(`/api/v1/analytics/overview?${q}`),
      ]);
      if (ctx.isStale()) return;

      if (devRes.success && devRes.data) setDevices(devRes.data);
      if (brRes.success && brRes.data) setBrowsers(brRes.data);
      if (osRes.success && osRes.data) setOsList(osRes.data);
      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
    },
    [resetData],
  );

  const {
    range,
    customWindow,
    setRange: handleRangeChange,
    setCustomWindow: handleCustomRangeChange,
    loading,
  } = useReportLoader({ fetcher, onSiteChange: resetData, intervalMs: 30_000 });

  const rawDeviceSum = devices.reduce((sum, d) => sum + d.sessions, 0);
  const totalDeviceSessions = rawDeviceSum;
  const safeDeviceDenominator = rawDeviceSum || 1;

  const rawBrowserSum = browsers.reduce((sum, b) => sum + b.sessions, 0);
  const totalBrowserSessions = rawBrowserSum;
  const safeBrowserDenominator = rawBrowserSum || 1;

  const rawOsSum = osList.reduce((sum, o) => sum + o.sessions, 0);
  const totalOsSessions = rawOsSum;
  const safeOsDenominator = rawOsSum || 1;

  const desktopItem = devices.find((d) => d.device.toLowerCase() === "desktop");
  const mobileItem = devices.find((d) => d.device.toLowerCase() === "mobile");
  const tabletItem = devices.find((d) => d.device.toLowerCase() === "tablet");

  const desktopSessions = desktopItem ? desktopItem.sessions : 0;
  const mobileSessions = mobileItem ? mobileItem.sessions : 0;
  const tabletSessions = tabletItem ? tabletItem.sessions : 0;

  const desktopPct = rawDeviceSum > 0 ? Math.round((desktopSessions / safeDeviceDenominator) * 100) : 0;
  const mobilePct = rawDeviceSum > 0 ? Math.round((mobileSessions / safeDeviceDenominator) * 100) : 0;
  const tabletPct = rawDeviceSum > 0 ? Math.round((tabletSessions / safeDeviceDenominator) * 100) : 0;

  const topBrowser = browsers[0] || null;
  const topBrowserPct = (topBrowser && rawBrowserSum > 0)
    ? Math.round((topBrowser.sessions / safeBrowserDenominator) * 100)
    : 0;

  const topOs = osList[0] || null;
  const topOsPct = (topOs && rawOsSum > 0)
    ? Math.round((topOs.sessions / safeOsDenominator) * 100)
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
      >
        <DevicePieChart
          browsers={browsers}
          osList={osList}
          devices={devices}
          loading={loading}
        />
      </DailyStatsCard>

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
