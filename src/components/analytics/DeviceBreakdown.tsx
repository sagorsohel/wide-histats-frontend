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
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100/80">
          <div className="w-10 h-10 rounded-2xl bg-blue-50/90 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0 shadow-xs">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Devices &amp; Browsers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hardware category and web browsers
            </p>
          </div>
        </div>

        {/* Top 3 Device Cards: Desktop, Mobile, Tablet */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
          {/* Desktop */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 backdrop-blur-md border border-white/80 flex flex-col items-center text-center space-y-1 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.02)]">
            <Monitor className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-500 block">
              Desktop
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block tabular-nums">
              {desktopPct}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium block tabular-nums">
              {desktopCount.toLocaleString()} views
            </span>
          </div>

          {/* Mobile (Prominent / Active) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 backdrop-blur-md border border-emerald-200/80 flex flex-col items-center text-center space-y-1 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_12px_rgba(16,185,129,0.08)]">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-700 block">
              Mobile
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight block tabular-nums">
              {mobilePct}%
            </span>
            <span className="text-[10px] text-emerald-700/80 font-semibold block tabular-nums">
              {mobileCount.toLocaleString()} views
            </span>
          </div>

          {/* Tablet */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-50/50 backdrop-blur-md border border-purple-200/70 flex flex-col items-center text-center space-y-1 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.02)]">
            <Tablet className="w-4 h-4 text-purple-600" />
            <span className="text-[11px] font-semibold text-purple-700 block">
              Tablet
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-700 tracking-tight block tabular-nums">
              {tabletPct}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium block tabular-nums">
              {tabletCount.toLocaleString()} visits
            </span>
          </div>
        </div>

        {/* Bottom Section: Top Browsers */}
        <div>
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-3 block">
            TOP BROWSERS
          </span>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 animate-pulse"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-slate-200" />
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-10 bg-slate-200 rounded" />
                    <div className="h-3.5 w-8 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : browsers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No browser telemetry recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {browsers.slice(0, 5).map((b, index) => {
                const percentage = Math.round((b.sessions / totalBrowserSessions) * 100);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs py-1 group"
                  >
                    {/* Left: Real Browser SVG Icon + Name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <BrowserIcon browser={b.browser} size={16} />
                      <span className="font-bold text-slate-800 truncate block group-hover:text-blue-600 transition-colors">
                        {b.browser}
                      </span>
                    </div>

                    {/* Right: Count + Percentage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {b.sessions.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-semibold w-8 text-right tabular-nums">
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
