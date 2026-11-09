"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { DeviceStat, BrowserStat, OsStat } from "@/types/analytics";
import {
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
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
        setLoading(false);
        hasDataRef.current = true;
        return;
      }

      if (!isSilent && !hasDataRef.current) {
        const cached = api.getCached<DeviceStat[]>(
          `/api/v1/analytics/devices?${q}`,
        );
        if (cached?.data) {
          setDevices(cached.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

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

      {/* 2-Column Responsive Layout: Left (Main Content), Right (Always Shown Calendar) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
        {/* ============================================================ */}
        {/* LEFT / MAIN CONTENT COLUMN                                   */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-6 w-full order-2 xl:order-1">
          {/* Device Categories Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                key: "desktop",
                label: "Desktop",
                icon: Monitor,
                color: "text-[#1455bb]",
                bg: "bg-blue-50 border-blue-200",
              },
              {
                key: "mobile",
                label: "Mobile",
                icon: Smartphone,
                color: "text-emerald-600",
                bg: "bg-emerald-50 border-emerald-200",
              },
              {
                key: "tablet",
                label: "Tablet",
                icon: Tablet,
                color: "text-purple-600",
                bg: "bg-purple-50 border-purple-200",
              },
            ].map(({ key, label, icon: Icon, color, bg }) => {
              const matched = devices.find(
                (d) => d.device.toLowerCase() === key,
              );
              const sessions = matched ? matched.sessions : 0;
              const percentage = Math.round(
                (sessions / totalDeviceSessions) * 100,
              );

              return (
                <div
                  key={key}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-[#1455bb]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-900 text-base">
                      {label}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      {loading && devices.length === 0 ? (
                        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                      ) : (
                        <span className="text-3xl font-black text-slate-900 tabular-nums">
                          {sessions}
                        </span>
                      )}
                      {loading && devices.length === 0 ? (
                        <div className="h-4 w-10 bg-slate-100 rounded animate-pulse" />
                      ) : (
                        <span className="text-sm font-bold text-slate-600">
                          {percentage}%
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#1455bb] to-[#1a62d4] h-full rounded-full"
                        style={{
                          width: `${loading && devices.length === 0 ? 0 : percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two Column Breakdown: Browsers & Operating Systems */}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ALWAYS SHOWN CALENDAR                          */}
        {/* ============================================================ */}
        <div className="w-full xl:w-[291px] shrink-0 space-y-5 xl:sticky xl:top-6 order-1 xl:order-2">
          <div className="flex justify-center xl:justify-end">
            <HistatsCalendar
              selectedPreset={range}
              onPresetChange={handleRangeChange}
              currentWindow={customWindow}
              onDateChange={handleCustomRangeChange}
            />
          </div>
        </div>
      </div>
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
