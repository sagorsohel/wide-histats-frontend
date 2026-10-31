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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalDeviceSessions = devices.reduce((sum, d) => sum + d.sessions, 0) || 1;
  const totalBrowserSessions = browsers.reduce((sum, b) => sum + b.sessions, 0) || 1;
  const totalOsSessions = osList.reduce((sum, o) => sum + o.sessions, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Devices & Technology
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browser families, operating systems, and device form factors
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

      {/* Device Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: "desktop", label: "Desktop", icon: Monitor, color: "text-cyan-400" },
          { key: "mobile", label: "Mobile", icon: Smartphone, color: "text-emerald-400" },
          { key: "tablet", label: "Tablet", icon: Tablet, color: "text-purple-400" },
        ].map(({ key, label, icon: Icon, color }) => {
          const matched = devices.find((d) => d.device.toLowerCase() === key);
          const sessions = matched ? matched.sessions : 0;
          const percentage = Math.round((sessions / totalDeviceSessions) * 100);

          return (
            <div key={key} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white text-base">{label}</span>
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-black text-white">{sessions}</span>
                  <span className="text-sm font-bold text-slate-300">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
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
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-base text-white">Browser Breakdown</h3>
          </div>

          {browsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No browser records found.
            </div>
          ) : (
            <div className="space-y-3">
              {browsers.map((b, i) => {
                const percentage = Math.round((b.sessions / totalBrowserSessions) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{b.browser}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{b.sessions} visits</span>
                        <span className="text-cyan-400 font-bold w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
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
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Operating Systems</h3>
          </div>

          {osList.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No OS records found.
            </div>
          ) : (
            <div className="space-y-3">
              {osList.map((o, i) => {
                const percentage = Math.round((o.sessions / totalOsSessions) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{o.os}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{o.sessions} visits</span>
                        <span className="text-emerald-400 font-bold w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
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
