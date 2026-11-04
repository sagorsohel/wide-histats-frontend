"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrafficHourlyPoint } from "@/types/analytics";
import { formatCommas } from "@/lib/utils";
import {
  Table as TableIcon,
  BarChart2,
  Camera,
  Layers,
  Activity,
  TrendingUp,
  Users,
  Radio,
} from "lucide-react";

interface TrafficStatsChartProps {
  data: TrafficHourlyPoint[];
  liveUsersCount?: number;
  onScrollToTable?: () => void;
}

export const TrafficStatsChart: React.FC<TrafficStatsChartProps> = ({
  data,
  liveUsersCount = 0,
  onScrollToTable,
}) => {
  const [showBounce, setShowBounce] = useState(true);
  const [showPpv, setShowPpv] = useState(true);
  const [showNvis, setShowNvis] = useState(true);

  // Custom Histats Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as TrafficHourlyPoint;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded border border-slate-300 shadow-md text-xs font-sans min-w-[170px]">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
            <span>Hour {point.time}</span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({point.visitorsPct}%)
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[#337ab7]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#337ab7]"></span>
                Page views:
              </span>
              <span className="font-bold">{formatCommas(point.pageviews)}</span>
            </div>

            <div className="flex items-center justify-between text-[#d68a14]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#f0ad4e]"></span>
                Visitors:
              </span>
              <span className="font-bold">{formatCommas(point.visitors)}</span>
            </div>

            <div className="flex items-center justify-between text-[#c9302c]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#d9534f]"></span>
                First time:
              </span>
              <span className="font-bold">{formatCommas(point.firstTimeVisitors)}</span>
            </div>

            <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-slate-600 text-[11px]">
              <span>Ppv: <b>{point.ppv.toFixed(2)}</b></span>
              <span>Bounce: <b>{point.bounceRate.toFixed(1)}%</b></span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleCapture = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-[#c4d1db] rounded-b shadow-xs overflow-hidden">
      {/* Top Legend & Tool icons */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-slate-200 bg-[#fafbfc] gap-2">
        {/* Left: Legend squares */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-2xs bg-[#d9534f] border border-[#b83838] shadow-2xs"></span>
            <span className="font-medium text-slate-700">First time visitors</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-2xs bg-[#f0ad4e] border border-[#cf8a17] shadow-2xs"></span>
            <span className="font-medium text-slate-700">Visitors</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-2xs bg-[#337ab7] border border-[#214f7d] shadow-2xs"></span>
            <span className="font-medium text-slate-700">Page views</span>
          </div>
        </div>

        {/* Right: Small icons */}
        <div className="flex items-center gap-1 text-slate-500">
          <button
            type="button"
            onClick={onScrollToTable}
            title="Jump to Table"
            className="p-1 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
          >
            <TableIcon className="w-4 h-4 text-emerald-700" />
          </button>
          <button
            type="button"
            title="Chart view"
            className="p-1 text-blue-600 bg-blue-50 border border-blue-200 rounded transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            title="Export / Print Chart"
            className="p-1 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
          >
            <Camera className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="p-2 sm:p-4 h-[280px] sm:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 10, left: -15, bottom: 0 }}
            barGap={1}
            barCategoryGap="16%"
          >
            <CartesianGrid
              vertical={false}
              stroke="#e2e8f0"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={{ stroke: "#94a3b8" }}
              tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(v) => {
                if (v >= 1000) return `${Math.round(v / 1000)}k`;
                return v;
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 3 side-by-side Histats bars */}
            <Bar
              dataKey="firstTimeVisitors"
              name="First time visitors"
              fill="#d9534f"
              stroke="#b83838"
              strokeWidth={1}
              radius={[1, 1, 0, 0]}
            />
            <Bar
              dataKey="visitors"
              name="Visitors"
              fill="#f0ad4e"
              stroke="#cf8a17"
              strokeWidth={1}
              radius={[1, 1, 0, 0]}
            />
            <Bar
              dataKey="pageviews"
              name="Page views"
              fill="#337ab7"
              stroke="#214f7d"
              strokeWidth={1}
              radius={[1, 1, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-bar directly beneath the chart */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-gradient-to-b from-[#f8fafc] to-[#e8eef5] border-t border-[#c4d1db] text-xs gap-2">
        {/* Left: [COMPARE] button */}
        <button
          type="button"
          onClick={() => alert("Comparison mode activated")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-300 bg-gradient-to-b from-white to-[#f1f5f9] text-[#1d5b9f] hover:text-blue-900 font-bold text-xs shadow-2xs transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-[#1d5b9f]" />
          <span>COMPARE</span>
        </button>

        {/* Right: Quick toggles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
          <label className="flex items-center gap-1 cursor-pointer select-none text-emerald-800">
            <input
              type="checkbox"
              checked={showBounce}
              onChange={(e) => setShowBounce(e.target.checked)}
              className="rounded-xs text-emerald-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600" />
              bounce
            </span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer select-none text-blue-800">
            <input
              type="checkbox"
              checked={showPpv}
              onChange={(e) => setShowPpv(e.target.checked)}
              className="rounded-xs text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              Ppv
            </span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer select-none text-red-800">
            <input
              type="checkbox"
              checked={showNvis}
              onChange={(e) => setShowNvis(e.target.checked)}
              className="rounded-xs text-red-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-red-600" />
              Nvis
            </span>
          </label>

          <div className="flex items-center gap-1 text-red-600 font-bold pl-2 border-l border-slate-300">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>Online: {formatCommas(liveUsersCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
