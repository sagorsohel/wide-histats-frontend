"use client";

import React from "react";
import { OsStat } from "@/types/analytics";
import { Cpu, Smartphone, Monitor } from "lucide-react";
import { OsIcon } from "@/components/common/BrandIcons";
import { formatNumber } from "@/lib/utils";

interface OperatingSystemsCardProps {
  operatingSystems: OsStat[];
  loading?: boolean;
}

export const OperatingSystemsCard: React.FC<OperatingSystemsCardProps> = ({
  operatingSystems,
  loading = false,
}) => {
  const totalSessions =
    operatingSystems.reduce((sum, o) => sum + o.sessions, 0) || 1;

  // Calculate Mobile OS vs Desktop OS split
  let mobileOsSessions = 0;
  let desktopOsSessions = 0;

  operatingSystems.forEach((o) => {
    const name = o.os.toLowerCase();
    if (name.includes("android") || name.includes("ios") || name.includes("iphone") || name.includes("ipad")) {
      mobileOsSessions += o.sessions;
    } else {
      desktopOsSessions += o.sessions;
    }
  });

  const mobileOsPct = Math.round((mobileOsSessions / totalSessions) * 100);
  const desktopOsPct = Math.round((desktopOsSessions / totalSessions) * 100);

  // Brand-tailored accent colors
  const getBrandBarStyle = (osName: string) => {
    const o = osName.toLowerCase();
    if (o.includes("win")) return "from-[#0078D7] to-[#2B95EA]";
    if (o.includes("android")) return "from-[#3DDC84] to-[#10B981]";
    if (o.includes("ios") || o.includes("mac") || o.includes("apple")) return "from-slate-700 to-indigo-600";
    if (o.includes("linux")) return "from-[#F59E0B] to-[#D97706]";
    return "from-blue-600 to-cyan-400";
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50/90 text-sky-600 border border-sky-100/80 flex items-center justify-center shrink-0 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Operating Systems
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Client operating system platforms &amp; environments
              </p>
            </div>
          </div>

          {/* Quick ratio badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full shrink-0">
            <Monitor className="w-3.5 h-3.5 text-blue-600" />
            <span>{desktopOsPct}%</span>
            <span className="text-slate-300">/</span>
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{mobileOsPct}%</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0" />
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-10 bg-slate-200 rounded" />
                    <div className="h-3.5 w-8 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1" />
              </div>
            ))}
          </div>
        ) : operatingSystems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No operating system telemetry recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {operatingSystems.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.sessions / totalSessions) * 100);
              const barGradient = getBrandBarStyle(item.os);

              return (
                <div key={index} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Official Brand Logo + OS Name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <OsIcon os={item.os} size={17} />
                      </div>
                      <span className="font-bold text-slate-800 truncate block group-hover:text-sky-600 transition-colors">
                        {item.os}
                      </span>
                    </div>

                    {/* Right: Sessions Count + Percentage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {formatNumber(item.sessions)}
                      </span>
                      <span className="text-slate-400 font-semibold w-8 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Brand Styled Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all duration-500 shadow-xs`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Desktop OS vs. Mobile OS Breakdown</span>
        <span className="font-semibold text-slate-500">
          {formatNumber(totalSessions)} total sessions
        </span>
      </div>
    </div>
  );
};
