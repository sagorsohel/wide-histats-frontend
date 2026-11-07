"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { DeviceStat, BrowserStat, OsStat } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { Monitor, Smartphone, Tablet, Globe, Cpu } from "lucide-react";
import { BrowserIcon, OsIcon } from "@/components/common/BrandIcons";
import { useTabFocus } from "@/hooks/useTabFocus";

// Module-level memory cache for 0ms instant display when navigating to Devices / Browsers
let memoryDevicesCache: {
  siteId: string;
  range: RangeOption;
  devices: DeviceStat[];
  browsers: BrowserStat[];
  osList: OsStat[];
} | null = null;

export default function DevicesReportPage() {
  const { selectedWebsite } = useWebsite();

  const isCached = !!(selectedWebsite?.id && memoryDevicesCache?.siteId === selectedWebsite.id && memoryDevicesCache.devices.length > 0);

  const [range, setRange] = useState<RangeOption>(() => (isCached && memoryDevicesCache ? memoryDevicesCache.range : "today"));
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(null);
  const [devices, setDevices] = useState<DeviceStat[]>(() => (isCached && memoryDevicesCache ? memoryDevicesCache.devices : []));
  const [browsers, setBrowsers] = useState<BrowserStat[]>(() => (isCached && memoryDevicesCache ? memoryDevicesCache.browsers : []));
  const [osList, setOsList] = useState<OsStat[]>(() => (isCached && memoryDevicesCache ? memoryDevicesCache.osList : []));
  const [loading, setLoading] = useState(!isCached);

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

  const hasDataRef = React.useRef(isCached);
  const activeSiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadData = useCallback(async (isSilent = false, overrideSiteId?: string, overrideWindow?: CustomDateWindow | null) => {
    const siteId = overrideSiteId || activeSiteIdRef.current;
    if (!siteId) return;
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
      const [devRes, brRes, osRes] = await Promise.all([
        api.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
        api.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
        api.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}`),
      ]);

      // Strict race condition check: if user switched website while this was in flight, discard!
      if (siteId !== activeSiteIdRef.current) {
        return;
      }

      if (devRes.success && devRes.data) setDevices(devRes.data);
      if (brRes.success && brRes.data) setBrowsers(brRes.data);
      if (osRes.success && osRes.data) setOsList(osRes.data);
      hasDataRef.current = true;

      // Save in module cache for 0ms instant display on subsequent link navigation
      memoryDevicesCache = {
        siteId,
        range,
        devices: devRes.data || [],
        browsers: brRes.data || [],
        osList: osRes.data || [],
      };
    } catch (err) {
      console.error(err);
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

  // Instantly handle website switcher change in Devices page
  const prevWebsiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);

  useEffect(() => {
    if (selectedWebsite?.id && selectedWebsite.id !== prevWebsiteIdRef.current) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      memoryDevicesCache = null;
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
    return () => window.removeEventListener("histat:website_changed", handleWebsiteChanged);
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

  const totalDeviceSessions = devices.reduce((sum, d) => sum + d.sessions, 0) || 1;
  const totalBrowserSessions = browsers.reduce((sum, b) => sum + b.sessions, 0) || 1;
  const totalOsSessions = osList.reduce((sum, o) => sum + o.sessions, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Devices &amp; Technology
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browser families, operating systems, and device form factors
          </p>
        </div>

        {/* Current Active Range indicator Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Active Window:</span>
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

      {/* 2-Column Responsive Layout: Left (Main Content), Right (Always Shown Calendar) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
        {/* ============================================================ */}
        {/* LEFT / MAIN CONTENT COLUMN                                   */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-6 w-full">

      {/* Device Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: "desktop", label: "Desktop", icon: Monitor, color: "text-[#1d5b9f]", bg: "bg-blue-50 border-blue-200" },
          { key: "mobile", label: "Mobile", icon: Smartphone, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { key: "tablet", label: "Tablet", icon: Tablet, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
        ].map(({ key, label, icon: Icon, color, bg }) => {
          const matched = devices.find((d) => d.device.toLowerCase() === key);
          const sessions = matched ? matched.sessions : 0;
          const percentage = Math.round((sessions / totalDeviceSessions) * 100);

          return (
            <div key={key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-[#1d5b9f]/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-900 text-base">{label}</span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  {loading && devices.length === 0 ? (
                    <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-black text-slate-900 tabular-nums">{sessions}</span>
                  )}
                  {loading && devices.length === 0 ? (
                    <div className="h-4 w-10 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    <span className="text-sm font-bold text-slate-600">{percentage}%</span>
                  )}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1d5b9f] to-blue-500 h-full rounded-full"
                    style={{ width: `${loading && devices.length === 0 ? 0 : percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Breakdown: Browsers & Operating Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browsers Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#1d5b9f]" />
            <h3 className="font-bold text-base text-slate-900">Browser Breakdown</h3>
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
                const percentage = Math.round((b.sessions / totalBrowserSessions) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <BrowserIcon browser={b.browser} size={16} />
                        <span className="font-semibold text-slate-800">{b.browser}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 tabular-nums">{b.sessions} visits</span>
                        <span className="text-[#1d5b9f] font-bold w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#1d5b9f] h-full rounded-full"
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Operating Systems</h3>
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
                const percentage = Math.round((o.sessions / totalOsSessions) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <OsIcon os={o.os} size={15} />
                        <span className="font-semibold text-slate-800">{o.os}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 tabular-nums">{o.sessions} visits</span>
                        <span className="text-emerald-700 font-bold w-10 text-right">{percentage}%</span>
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

    {/* ============================================================ */}
    {/* RIGHT COLUMN: ALWAYS SHOWN CALENDAR                          */}
    {/* ============================================================ */}
    <div className="w-full xl:w-72 2xl:w-80 shrink-0 space-y-5 xl:sticky xl:top-6">
      <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-[#1455bb] to-blue-400 shadow-sm" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Analytics Calendar
            </h3>
          </div>
          {customWindow?.label ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#1455bb] border border-blue-200">
              {customWindow.label}
            </span>
          ) : null}
        </div>

        <DateRangePicker
          inline={true}
          selectedRange={range}
          onChange={handleRangeChange}
          customWindow={customWindow}
          onCustomRangeChange={handleCustomRangeChange}
        />
      </div>
    </div>
  </div>
</div>
  );
}
