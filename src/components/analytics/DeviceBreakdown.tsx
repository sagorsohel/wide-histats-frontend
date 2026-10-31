"use client";

import React from "react";
import { DeviceStat, BrowserStat } from "@/types/analytics";
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react";

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
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-80 flex items-center justify-center text-muted-foreground text-sm">
        Loading device statistics...
      </div>
    );
  }

  const totalSessions = devices.reduce((sum, d) => sum + d.sessions, 0) || 1;

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case "tablet":
        return <Tablet className="w-4 h-4 text-purple-400" />;
      default:
        return <Monitor className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Devices & Browsers</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware category and web browsers
          </p>
        </div>
      </div>

      {/* Device category cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {["desktop", "mobile", "tablet"].map((category) => {
          const matched = devices.find((d) => d.device.toLowerCase() === category);
          const sessions = matched ? matched.sessions : 0;
          const percentage = Math.round((sessions / totalSessions) * 100);

          return (
            <div
              key={category}
              className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200 flex flex-col items-center text-center shadow-2xs"
            >
              <div className="mb-1.5">{getDeviceIcon(category)}</div>
              <span className="text-[11px] font-semibold text-slate-500 capitalize">
                {category}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5">
                {percentage}%
              </span>
              <span className="text-[10px] text-slate-400">
                {sessions} visits
              </span>
            </div>
          );
        })}
      </div>

      {/* Top Browsers list */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Top Browsers
        </div>
        {browsers.slice(0, 4).map((b, i) => {
          const percentage = Math.round((b.sessions / totalSessions) * 100);
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-medium">{b.browser}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{b.sessions}</span>
                <span className="text-slate-500 text-[11px] w-8 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
