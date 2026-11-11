"use client";

import React from "react";
import { Users, UserCheck, Sparkles, UserPlus, ShieldCheck } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface AudienceLoyaltyCardProps {
  firstTimeVisitors?: number;
  returningVisitors?: number;
  newVisitorsPct?: number;
  returningVisitorsPct?: number;
  totalVisitors?: number;
  loading?: boolean;
  className?: string;
}

export const AudienceLoyaltyCard: React.FC<AudienceLoyaltyCardProps> = ({
  firstTimeVisitors = 22500,
  returningVisitors = 1400,
  newVisitorsPct = 94.2,
  returningVisitorsPct = 5.8,
  totalVisitors = 23900,
  loading = false,
  className = "",
}) => {
  // Ensure valid percentages
  const safeTotal = (firstTimeVisitors + returningVisitors) || totalVisitors || 1;
  const computedNewPct = Number(((firstTimeVisitors / safeTotal) * 100).toFixed(1));
  const computedRetPct = Number((100 - computedNewPct).toFixed(1));

  const newPct = !isNaN(computedNewPct) && computedNewPct > 0 ? computedNewPct : (newVisitorsPct || 94.2);
  const retPct = !isNaN(computedRetPct) && computedRetPct > 0 ? computedRetPct : (returningVisitorsPct || 5.8);

  // SVG Circular Donut calculations (circumference = 2 * pi * r)
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32
  const newStrokeDash = (newPct / 100) * circumference;
  const retStrokeDash = (retPct / 100) * circumference;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  New vs. Returning Visitors
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100/80">
                  <Sparkles className="w-2.5 h-2.5 text-blue-500" /> Audience Mix
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                First-time discovery ratio versus loyal returning audience
              </p>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden xs:inline">Loyalty:</span>
            <span>{retPct}%</span>
          </div>
        </div>

        {/* Donut and KPI Stats Layout */}
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 my-1">
          {/* Left: SVG Apple Donut Chart */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            {loading ? (
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 animate-pulse" />
            ) : (
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="9"
                  fill="none"
                />

                {/* Returning / Loyal Visitors Ring Segment (Indigo / Emerald) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-1000 ease-out"
                  strokeWidth="9"
                  strokeDasharray={`${retStrokeDash} ${circumference}`}
                  strokeDashoffset={-newStrokeDash}
                  strokeLinecap="round"
                  fill="none"
                />

                {/* First-time Visitors Ring Segment (Electric Royal Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-blue-600 transition-all duration-1000 ease-out"
                  strokeWidth="9"
                  strokeDasharray={`${newStrokeDash} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            )}

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                FIRST-TIME
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight tabular-nums">
                {newPct}%
              </span>
              <span className="text-[9px] font-semibold text-blue-600">
                Discovery
              </span>
            </div>
          </div>

          {/* Right: Dual Progress Metrics */}
          <div className="flex-1 w-full space-y-2">
            {/* 1. First-Time Visitors (New) */}
            <div className="px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-100/70 transition-all">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                    <UserPlus className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                      First-Time Visitors (New)
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Visiting for the very first time
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-blue-600 tabular-nums block leading-tight">
                    {formatNumber(firstTimeVisitors)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums leading-tight">
                    {newPct}% of total
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blue-100/70 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${newPct}%` }}
                />
              </div>
            </div>

            {/* 2. Returning / Loyal Visitors */}
            <div className="px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100/70 transition-all">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                      Returning / Loyal Visitors
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Regularly returning readers
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-emerald-600 tabular-nums block leading-tight">
                    {formatNumber(returningVisitors)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums leading-tight">
                    {retPct}% of total
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-100/70 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(retPct, 4)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
          <span>New: {newPct}%</span>
          <span className="text-slate-300">•</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Loyal: {retPct}%</span>
        </span>
        <span className="text-slate-400 font-medium">
          Total Analyzed: {formatNumber(safeTotal)} visitors
        </span>
      </div>
    </div>
  );
};
