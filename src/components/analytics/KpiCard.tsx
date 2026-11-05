"use client";

import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export type KpiVariant = "blue" | "purple" | "green" | "emerald";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    positive?: boolean;
  };
  variant?: KpiVariant;
  highlight?: boolean;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  variant = "blue",
  loading = false,
}) => {
  // Color configuration matching the exact aesthetic
  const config = {
    blue: {
      iconBg: "bg-blue-50/90 text-blue-600 border border-blue-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(37,99,235,0.08)]",
      waveGradId: "kpiWaveBlue",
      waveStart: "#38bdf8",
      waveEnd: "#2563eb",
      stroke: "#0284c7",
      wavePath: "M0,35 C20,38 35,26 50,28 C65,30 75,12 100,10",
      fillPath: "M0,35 C20,38 35,26 50,28 C65,30 75,12 100,10 L100,45 L0,45 Z",
    },
    purple: {
      iconBg: "bg-purple-50/90 text-purple-600 border border-purple-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(147,51,234,0.08)]",
      waveGradId: "kpiWavePurple",
      waveStart: "#c084fc",
      waveEnd: "#8b5cf6",
      stroke: "#9333ea",
      wavePath: "M0,38 C25,38 40,20 65,28 C80,32 90,14 100,16",
      fillPath: "M0,38 C25,38 40,20 65,28 C80,32 90,14 100,16 L100,45 L0,45 Z",
    },
    green: {
      iconBg: "bg-emerald-50/90 text-emerald-600 border border-emerald-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(16,185,129,0.08)]",
      waveGradId: "kpiWaveGreen",
      waveStart: "#34d399",
      waveEnd: "#10b981",
      stroke: "#10b981",
      wavePath: "M0,40 C20,38 35,32 55,22 C70,16 85,28 100,8",
      fillPath: "M0,40 C20,38 35,32 55,22 C70,16 85,28 100,8 L100,45 L0,45 Z",
    },
    emerald: {
      iconBg: "bg-emerald-50/90 text-emerald-600 border border-emerald-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(16,185,129,0.08)]",
      waveGradId: "kpiWaveEmerald",
      waveStart: "#34d399",
      waveEnd: "#10b981",
      stroke: "#10b981",
      wavePath: "M0,40 C20,38 35,32 55,22 C70,16 85,28 100,8",
      fillPath: "M0,40 C20,38 35,32 55,22 C70,16 85,28 100,8 L100,45 L0,45 Z",
    },
  }[variant];

  return (
    <div className="bg-white/75 backdrop-blur-xl backdrop-saturate-150 p-5 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:bg-white/85 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden flex items-center justify-between gap-4">
      {/* Left content: Icon, Title, Value, Subtitle */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Soft rounded squircle Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {loading ? (
              <div className="h-8 w-20 rounded-md bg-slate-200 animate-pulse my-0.5" />
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                {value}
              </span>
            )}

            {!loading && badge && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  badge.positive !== false
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs"
                    : "bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs"
                }`}
              >
                {badge.positive !== false ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                )}
                {badge.text}
              </span>
            )}
          </div>

          {loading ? (
            <div className="h-3 w-28 rounded bg-slate-100 animate-pulse mt-1" />
          ) : (
            subtitle && (
              <p className="text-xs text-slate-400 font-medium truncate">
                {subtitle}
              </p>
            )
          )}
        </div>
      </div>

      {/* Right side: Translucent smooth wave */}
      <div className="shrink-0 hidden sm:block">
        <svg
          viewBox="0 0 100 45"
          className="w-24 lg:w-28 h-12 select-none overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={config.waveGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.waveStart} stopOpacity={0.4} />
              <stop offset="100%" stopColor={config.waveEnd} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <path d={config.fillPath} fill={`url(#${config.waveGradId})`} />
          <path
            d={config.wavePath}
            fill="none"
            stroke={config.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
