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
}

export const AudienceLoyaltyCard: React.FC<AudienceLoyaltyCardProps> = ({
  firstTimeVisitors = 22500,
  returningVisitors = 1400,
  newVisitorsPct = 94.2,
  returningVisitorsPct = 5.8,
  totalVisitors = 23900,
  loading = false,
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
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/15 to-indigo-500/15 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  New vs. Returning Visitors
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100/80">
                  <Sparkles className="w-3 h-3 text-blue-500" /> Audience Mix
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                First-time discovery ratio versus loyal returning audience
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Loyalty Index:</span>
            <span>{retPct}%</span>
          </div>
        </div>

        {/* Donut and KPI Stats Layout */}
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 my-2">
          {/* Left: SVG Apple Donut Chart */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
            {loading ? (
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 animate-pulse" />
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                FIRST-TIME
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {newPct}%
              </span>
              <span className="text-[9px] font-semibold text-blue-600">
                Discovery
              </span>
            </div>
          </div>

          {/* Right: Dual Progress Metrics */}
          <div className="flex-1 w-full space-y-4">
            {/* 1. First-Time Visitors (New) */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 backdrop-blur-md border border-blue-100/70 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(59,130,246,0.04)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">
                      First-Time Visitors (New)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Visiting for the very first time
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-blue-600 tabular-nums block">
                    {formatNumber(firstTimeVisitors)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                    {newPct}% of total
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blue-100/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${newPct}%` }}
                />
              </div>
            </div>

            {/* 2. Returning / Loyal Visitors */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 backdrop-blur-md border border-emerald-100/70 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(16,185,129,0.04)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">
                      Returning / Loyal Visitors
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Regularly returning readers &amp; customers
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-emerald-600 tabular-nums block">
                    {formatNumber(returningVisitors)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                    {retPct}% of total
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-100/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${Math.max(retPct, 4)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
          <span>New Traffic: {newPct}%</span>
          <span className="mx-1 text-slate-300">•</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Loyal Traffic: {retPct}%</span>
        </span>
        <span className="text-slate-400 font-medium">
          Total Analyzed: {formatNumber(safeTotal)} visitors
        </span>
      </div>
    </div>
  );
};
