"use client";

import React from "react";
import { DeviceStat, BrowserStat } from "@/types/analytics";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { BrowserIcon } from "@/components/common/BrandIcons";

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

        {/* Top 3 Device Cards: Desktop, Mobile, Tablet */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-3">
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
