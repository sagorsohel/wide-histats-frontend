"use client";

import React, { useMemo } from "react";
import { Users } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  firstTimeVisitors = 0,
  returningVisitors = 0,
  newVisitorsPct = 94.2,
  returningVisitorsPct = 5.8,
  totalVisitors = 0,
  loading = false,
  className = "",
}) => {
  const firstTime = firstTimeVisitors ?? 0;
  const returning = returningVisitors ?? 0;
  const safeTotal = (firstTime + returning) || totalVisitors || 1;

  const computedNewPct = Number(((firstTime / safeTotal) * 100).toFixed(1));
  const computedRetPct = Number((100 - computedNewPct).toFixed(1));

  const newPct = !isNaN(computedNewPct) && computedNewPct > 0 ? computedNewPct : (newVisitorsPct || 94.2);
  const retPct = !isNaN(computedRetPct) && computedRetPct >= 0 ? computedRetPct : (returningVisitorsPct || 5.8);

  // Minimal 2-color palette: Blue (#2563eb) for New, Clean Slate (#94a3b8) for Returning
  const chartData = useMemo(() => [
    {
      name: "First-Time Visitors",
      value: firstTime || Math.round(safeTotal * (newPct / 100)),
      pct: newPct.toFixed(1),
      color: "#2563eb",
    },
    {
      name: "Returning Visitors",
      value: returning || Math.round(safeTotal * (retPct / 100)),
      pct: retPct.toFixed(1),
      color: "#94a3b8",
    },
  ], [firstTime, returning, safeTotal, newPct, retPct]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                New vs. Returning Visitors
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Audience distribution between first-time and repeat visitors
              </p>
            </div>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold tabular-nums">
            Total: {safeTotal.toLocaleString()}
          </div>
        </div>

        {/* Clean Pie Chart & Minimal Stats Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 my-2">
          {/* Left: Recharts Donut Pie Chart */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            {loading ? (
              <div className="w-24 h-24 rounded-full border-2 border-slate-100 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white/95 backdrop-blur-xs p-2 rounded border border-slate-200 shadow-md text-[11px] font-sans">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-0.5 border-b border-slate-100">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1 text-slate-600">
                              <span>Visitors:</span>
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
                    outerRadius={56}
                    innerRadius={32}
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
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                NEW
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight tabular-nums">
                {newPct}%
              </span>
            </div>
          </div>

          {/* Right: Clean & Fresh Minimal Metric Rows */}
          <div className="flex-1 w-full space-y-2.5">
            {/* 1. First-Time Visitors */}
            <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                    First-Time Visitors (New)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block leading-tight">
                    Visiting for the very first time
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums block leading-tight">
                  {firstTime.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tabular-nums leading-tight">
                  {newPct}%
                </span>
              </div>
            </div>

            {/* 2. Returning Visitors */}
            <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                    Returning / Loyal Visitors
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block leading-tight">
                    Repeat and returning audience
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums block leading-tight">
                  {returning.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tabular-nums leading-tight">
                  {retPct}%
                </span>
              </div>
            </div>

            {/* Subtle Dual Segment Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex mt-1">
              <div
                className="bg-[#2563eb] h-full transition-all duration-700"
                style={{ width: `${newPct}%` }}
              />
              <div
                className="bg-[#94a3b8] h-full transition-all duration-700"
                style={{ width: `${retPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Footer */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2563eb] inline-block" />
          <span>New: {newPct}%</span>
          <span className="text-slate-300">•</span>
          <span className="w-2 h-2 rounded-full bg-[#94a3b8] inline-block" />
          <span>Returning: {retPct}%</span>
        </span>
        <span className="text-slate-400 font-medium">
          Total Analyzed: {safeTotal.toLocaleString()} visitors
        </span>
      </div>
    </div>
  );
};
