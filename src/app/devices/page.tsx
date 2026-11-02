"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { DeviceStat, BrowserStat, OsStat } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import { Monitor, Smartphone, Tablet, Globe, Cpu } from "lucide-react";
import { useTabFocus } from "@/hooks/useTabFocus";

export default function DevicesReportPage() {
  const { selectedWebsite } = useWebsite();
  const [range, setRange] = useState<RangeOption>("7d");
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

  const loadData = useCallback(async () => {
    if (!selectedWebsite) return;
    setLoading(true);
    const { from, to } = getDateRange(range);
    const q = `websiteId=${selectedWebsite.id}&from=${from}&to=${to}`;

    try {
      const [devRes, brRes, osRes] = await Promise.all([
        api.get<DeviceStat[]>(`/api/v1/analytics/devices?${q}`),
        api.get<BrowserStat[]>(`/api/v1/analytics/browsers?${q}`),
        api.get<OsStat[]>(`/api/v1/analytics/operating-systems?${q}`),
      ]);

      if (devRes.success && devRes.data) setDevices(devRes.data);
      if (brRes.success && brRes.data) setBrowsers(brRes.data);
      if (osRes.success && osRes.data) setOsList(osRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite, range, getDateRange]);

  // Auto-refresh when user returns to this tab
  useTabFocus(loadData);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  const totalDeviceSessions = devices.reduce((sum, d) => sum + d.sessions, 0) || 1;
  const totalBrowserSessions = browsers.reduce((sum, b) => sum + b.sessions, 0) || 1;
  const totalOsSessions = osList.reduce((sum, o) => sum + o.sessions, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Devices & Technology
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browser families, operating systems, and device form factors
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

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
                  <span className="text-3xl font-black text-slate-900 tabular-nums">{sessions}</span>
                  <span className="text-sm font-bold text-slate-600">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1d5b9f] to-blue-500 h-full rounded-full"
                    style={{ width: `${percentage}%` }}
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

          {browsers.length === 0 ? (
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
                      <span className="font-semibold text-slate-800">{b.browser}</span>
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

          {osList.length === 0 ? (
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
                      <span className="font-semibold text-slate-800">{o.os}</span>
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
  );
}
