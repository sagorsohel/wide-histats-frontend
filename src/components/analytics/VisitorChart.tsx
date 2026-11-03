"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TimeseriesPoint } from "@/types/analytics";

interface VisitorChartProps {
  data: TimeseriesPoint[];
  loading?: boolean;
}

export const VisitorChart: React.FC<VisitorChartProps> = ({
  data,
  loading = false,
}) => {
  const [metric, setMetric] = useState<"both" | "pageviews" | "visitors">("both");

  // Format date labels (e.g. "Oct 25")
  const formattedData = (data || []).map((item) => {
    let label = item.date;
    try {
      const parts = item.date.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch {
      // Keep original
    }
    return {
      ...item,
      label,
    };
  });

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-base text-slate-900">Visitors & Pageviews Over Time</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily distribution of traffic volume
          </p>
        </div>

        {/* Metric toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setMetric("both")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metric === "both"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setMetric("pageviews")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metric === "pageviews"
                ? "bg-blue-100 text-[#1d5b9f] border border-blue-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Pageviews
          </button>
          <button
            onClick={() => setMetric("visitors")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metric === "visitors"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Visitors
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] w-full flex flex-col justify-end gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 animate-pulse">
          <div className="flex items-end justify-between gap-2 h-full pt-8 pb-4">
            {[40, 65, 30, 85, 55, 90, 70, 45, 60, 80, 50, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-slate-200 rounded-t"
                  style={{ height: `${h}%` }}
                />
                <div className="w-6 h-2.5 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (!data || data.length === 0) ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm bg-slate-50/40 rounded-xl border border-slate-100">
          <p className="font-semibold text-slate-600">No activity recorded for this period.</p>
          <p className="text-xs mt-1 text-slate-400">
            Install the tracking snippet on your site to see live analytics.
          </p>
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d5b9f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1d5b9f" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs space-y-1.5">
                      <div className="font-bold text-slate-900 mb-1">{label}</div>
                      {payload.map((entry: any) => (
                        <div
                          key={entry.dataKey}
                          className="flex items-center justify-between gap-4"
                        >
                          <span
                            className="flex items-center gap-1.5 font-medium"
                            style={{ color: entry.color }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name === "pageviews" ? "Pageviews" : "Visitors"}
                          </span>
                          <span className="font-extrabold text-slate-900">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {(metric === "both" || metric === "pageviews") && (
              <Area
                type="monotone"
                dataKey="pageviews"
                stroke="#1d5b9f"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPageviews)"
                name="pageviews"
              />
            )}
            {(metric === "both" || metric === "visitors") && (
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVisitors)"
                name="visitors"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
};
