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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                Operating Systems
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Client operating system platforms
              </p>
            </div>
          </div>

          {/* Quick ratio badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full shrink-0">
            <Monitor className="w-3 h-3 text-blue-600" />
            <span>{desktopOsPct}%</span>
            <span className="text-slate-300">/</span>
            <Smartphone className="w-3 h-3 text-emerald-600" />
            <span>{mobileOsPct}%</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1 animate-pulse px-2.5 py-1.5 rounded-xl border border-slate-100 bg-white/50">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3 w-8 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : operatingSystems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No operating system telemetry recorded yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {operatingSystems.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.sessions / totalSessions) * 100);
              const barGradient = getBrandBarStyle(item.os);

              return (
                <div
                  key={index}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 transition-all duration-150 space-y-1 group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Official Brand Logo + OS Name */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <OsIcon os={item.os} size={15} />
                      </div>
                      <span className="font-bold text-slate-800 text-xs truncate block group-hover:text-sky-600 transition-colors leading-tight">
                        {item.os}
                      </span>
                    </div>

                    {/* Right: Sessions Count + Percentage */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-extrabold text-slate-900 text-xs tabular-nums leading-tight">
                        {formatNumber(item.sessions)}
                      </span>
                      <span className="text-slate-400 font-semibold text-[11px] w-7 text-right tabular-nums leading-tight">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Brand Styled Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all duration-500`}
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
      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
        <span>Desktop OS vs. Mobile OS Breakdown</span>
        <span className="font-semibold text-slate-500">
          {formatNumber(totalSessions)} total sessions
        </span>
      </div>
    </div>
  );
};
