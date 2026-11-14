"use client";

import React, { useMemo } from "react";
import { DeviceStat, BrowserStat } from "@/types/analytics";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { BrowserIcon } from "@/components/common/BrandIcons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DeviceBreakdownProps {
  devices: DeviceStat[];
  browsers: BrowserStat[];
  loading?: boolean;
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({
  devices,
  browsers,
  loading = false,
}) => {
  const totalSessions = devices.reduce((sum, d) => sum + d.sessions, 0) || 1;
  const totalBrowserSessions = browsers.reduce((sum, b) => sum + b.sessions, 0) || 1;

  // Find counts for Desktop, Mobile, Tablet
  const desktopStat = devices.find((d) => d.device.toLowerCase() === "desktop");
  const mobileStat = devices.find((d) => d.device.toLowerCase() === "mobile");
  const tabletStat = devices.find((d) => d.device.toLowerCase() === "tablet");

  const desktopCount = desktopStat?.sessions || 0;
  const mobileCount = mobileStat?.sessions || 0;
  const tabletCount = tabletStat?.sessions || 0;

  const desktopPct = Math.round((desktopCount / totalSessions) * 100);
  const mobilePct = Math.round((mobileCount / totalSessions) * 100);
  const tabletPct = Math.round((tabletCount / totalSessions) * 100);

  // Device distribution pie chart data
  const chartData = useMemo(() => [
    {
      name: "Mobile",
      value: mobileCount || (totalSessions > 0 ? totalSessions : 1),
      pct: mobilePct,
      color: "#10B981", // Emerald matching Image 3 mobile highlight
    },
    {
      name: "Desktop",
      value: desktopCount || 0,
      pct: desktopPct,
      color: "#1058D1", // Brand blue
    },
    ...(tabletCount > 0 ? [{
      name: "Tablet",
      value: tabletCount,
      pct: tabletPct,
      color: "#A855F7", // Purple matching Tablet card
    }] : []),
  ], [mobileCount, mobilePct, desktopCount, desktopPct, tabletCount, tabletPct, totalSessions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Monitor className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
              Devices &amp; Browsers
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              Hardware category and web browsers
            </p>
          </div>
        </div>

        {/* Top Section: Integrated Donut Pie Chart + 3 Device Cards */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3">
          {/* Donut Pie Chart with dominant percentage in center */}
          <div className="relative w-24 h-24 sm:w-26 sm:h-26 shrink-0 flex items-center justify-center">
            {loading ? (
              <div className="w-20 h-20 rounded-full border-2 border-slate-100 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] font-sans">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-0.5 border-b border-slate-100">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1 text-slate-600">
                              <span>Views:</span>
                              <span className="font-bold font-mono text-slate-900">
                                {item.value?.toLocaleString()} ({item.pct}%)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={48}
                    innerRadius={28}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                {mobilePct >= desktopPct ? "MOBILE" : "DESKTOP"}
              </span>
              <span className="text-sm font-black text-slate-900 tracking-tight tabular-nums">
                {mobilePct >= desktopPct ? `${mobilePct}%` : `${desktopPct}%`}
              </span>
            </div>
          </div>

          {/* Right: The 3 Device Cards (Desktop, Mobile, Tablet) exactly matching Image 3 */}
          <div className="grid grid-cols-3 gap-2 flex-1 w-full">
            {/* Desktop */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center text-center space-y-0.5 transition-all">
              <Monitor className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 block leading-tight">
                Desktop
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block tabular-nums leading-tight">
                {desktopPct}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium block tabular-nums leading-tight">
                {desktopCount.toLocaleString()} views
              </span>
            </div>

            {/* Mobile (Prominent / Active) */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col items-center text-center space-y-0.5 transition-all">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 block leading-tight">
                Mobile
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-600 tracking-tight block tabular-nums leading-tight">
                {mobilePct}%
              </span>
              <span className="text-[10px] text-emerald-700/80 font-semibold block tabular-nums leading-tight">
                {mobileCount.toLocaleString()} views
              </span>
            </div>

            {/* Tablet */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50/50 border border-purple-200/70 flex flex-col items-center text-center space-y-0.5 transition-all">
              <Tablet className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[10px] font-semibold text-purple-700 block leading-tight">
                Tablet
              </span>
              <span className="text-base sm:text-lg font-black text-slate-700 tracking-tight block tabular-nums leading-tight">
                {tabletPct}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium block tabular-nums leading-tight">
                {tabletCount.toLocaleString()} visits
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Top Browsers */}
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 block">
            TOP BROWSERS
          </span>

          {loading ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-slate-100 bg-white/50 animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-8 bg-slate-200 rounded" />
                    <div className="h-3 w-6 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : browsers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No browser telemetry recorded yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {browsers.slice(0, 5).map((b, index) => {
                const percentage = Math.round((b.sessions / totalBrowserSessions) * 100);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 transition-all duration-150 group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    {/* Left: Real Browser SVG Icon + Name */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <BrowserIcon browser={b.browser} size={15} />
                      <span className="font-bold text-slate-800 text-xs truncate block group-hover:text-blue-600 transition-colors leading-tight">
                        {b.browser}
                      </span>
                    </div>

                    {/* Right: Count + Percentage */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-extrabold text-slate-900 text-xs tabular-nums leading-tight">
                        {b.sessions.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-semibold text-[11px] w-7 text-right tabular-nums leading-tight">
                        {percentage}%
                      </span>
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
};
