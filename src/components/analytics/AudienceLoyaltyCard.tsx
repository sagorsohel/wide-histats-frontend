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

  // Minimal 2-color palette: Blue (#1058D1) for New, Clean Slate (#94a3b8) for Returning
  const chartData = useMemo(() => [
    {
      name: "First-Time Visitors",
      value: firstTime || Math.round(safeTotal * (newPct / 100)),
      pct: newPct.toFixed(1),
      color: "#1058D1",
    },
    {
      name: "Returning Visitors",
      value: returning || Math.round(safeTotal * (retPct / 100)),
      pct: retPct.toFixed(1),
      color: "#94a3b8",
    },
  ], [firstTime, returning, safeTotal, newPct, retPct]);

  return (
    <div className={`bg-white rounded-[18px] border border-white/70 shadow-[0_8px_24px_-8px_rgba(8,40,110,0.35)] p-4 transition-all duration-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#1058D1]/10 text-[#1058D1] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[14px] text-slate-900 tracking-tight leading-tight truncate">
              New vs. Returning
            </h3>
            <p className="text-[11px] text-slate-400 leading-tight truncate">
              First-time and repeat visitors
            </p>
          </div>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-[#1058D1]/10 text-[#1058D1] text-[11px] font-bold tabular-nums shrink-0">
          {safeTotal.toLocaleString()} total
        </div>
      </div>

      {/* Donut + rows */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-[96px] h-[96px] shrink-0 flex items-center justify-center">
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
                        <div className="bg-white/95 p-2 rounded border border-slate-200 shadow-md text-[11px] font-sans">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="pt-1 text-slate-600">
                            {item.value?.toLocaleString()} ({item.pct}%)
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
                  outerRadius={46}
                  innerRadius={30}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[15px] font-extrabold text-slate-900 tracking-tight tabular-nums leading-none">
              {newPct}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              new
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {[
            { label: "New visitors", sub: "First visit", color: "#1058D1", count: firstTime, pct: newPct },
            { label: "Returning", sub: "Came back", color: "#94a3b8", count: returning, pct: retPct },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-[12.5px] block leading-tight truncate">
                    {row.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400 block leading-tight truncate">
                    {row.sub}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[15px] font-extrabold text-slate-900 tabular-nums block leading-tight">
                  {row.count.toLocaleString()}
                </span>
                <span className="text-[10.5px] font-semibold text-slate-500 tabular-nums leading-tight">
                  {row.pct}%
                </span>
              </div>
            </div>
          ))}

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
            <div className="bg-[#1058D1] h-full transition-all duration-700" style={{ width: `${newPct}%` }} />
            <div className="bg-[#94a3b8] h-full transition-all duration-700" style={{ width: `${retPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
