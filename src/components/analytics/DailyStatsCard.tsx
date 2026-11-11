"use client";

import React from "react";
import { OverviewStats } from "@/types/analytics";
import { RangeOption } from "./DateRangePicker";
import { formatNumber, formatDuration } from "@/lib/utils";

export interface StatItem {
  value: React.ReactNode;
  label: string;
  sublabel?: string;
  highlight?: boolean;
}

interface DailyStatsCardProps {
  overview?: OverviewStats | null;
  items?: StatItem[];
  loading?: boolean;
  range?: RangeOption;
  domain?: string;
  title?: string;
}

export const DailyStatsCard: React.FC<DailyStatsCardProps> = ({
  overview,
  items,
  loading = false,
  range = "today",
  domain = "streamespn.org",
  title,
}) => {
  const displayTitle =
    title ||
    (range === "today" || range === "yesterday"
      ? "Daily stats"
      : "Period stats");

  // Default fallback items from overview if custom items are not provided
  const displayItems: StatItem[] =
    items && items.length >= 6
      ? items.slice(0, 6)
      : [
          {
            value: formatNumber(overview?.totalPageviews || 0),
            label: "Total page views",
            highlight: true,
          },
          {
            value: formatNumber(overview?.uniqueVisitors || 0),
            label: "Total visitors",
            highlight: true,
          },
          {
            value: formatNumber(
              overview?.firstTimeVisitors ||
                Math.round(
                  (overview?.uniqueVisitors || 0) *
                    ((overview?.newVisitorsPct || 59) / 100),
                ),
            ),
            label: "First time visitors",
            highlight: true,
          },
          {
            value: overview?.pagesPerSession
              ? Number(overview.pagesPerSession).toFixed(2)
              : (
                  (overview?.totalPageviews || 0) /
                  Math.max(overview?.uniqueVisitors || 1, 1)
                ).toFixed(2),
            label: "Page views per visit",
            highlight: false,
          },
          {
            value: `${
              overview?.newVisitorsPct ??
              (Math.round(
                ((overview?.firstTimeVisitors || 0) /
                  Math.max(overview?.uniqueVisitors || 1, 1)) *
                  100,
              ) ||
                59)
            }%`,
            label: "New visitors ratio",
            highlight: false,
          },
          {
            value: formatDuration(overview?.avgDuration || 80),
            label: "Average visit length",
            highlight: false,
          },
        ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between h-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1455bb] via-[#1d5b9f] to-[#1e40af] text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm tracking-wide">{displayTitle}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white/95 border border-white/25 uppercase tracking-wider">
            {domain}
          </span>
        </div>
        <div className="text-[11px] font-bold text-blue-100 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {range === "today"
              ? "Today"
              : range === "yesterday"
                ? "Yesterday"
                : range.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Grid Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Row 1: Primary Metrics (Items 0, 1, 2) */}
        <div className="grid grid-cols-3 divide-x divide-slate-200/80">
          {displayItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className={
                idx === 0
                  ? "pr-3 sm:pr-4"
                  : idx === 1
                    ? "px-3 sm:px-4"
                    : "pl-3 sm:pl-4"
              }
            >
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums truncate ${
                  item.highlight !== false ? "text-[#1455bb]" : "text-slate-900"
                }`}
              >
                {loading && !overview && (!items || items.length === 0) ? (
                  <div className="h-8 w-20 bg-slate-200/60 rounded animate-pulse" />
                ) : (
                  item.value
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1 truncate">
                {item.label}
              </div>
              {item.sublabel && (
                <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {item.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-slate-200/80" />

        {/* Row 2: Secondary / Behavioral Metrics (Items 3, 4, 5) */}
        <div className="grid grid-cols-3 divide-x divide-slate-200/80">
          {displayItems.slice(3, 6).map((item, idx) => (
            <div
              key={idx + 3}
              className={
                idx === 0
                  ? "pr-3 sm:pr-4"
                  : idx === 1
                    ? "px-3 sm:px-4"
                    : "pl-3 sm:pl-4"
              }
            >
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums truncate ${
                  item.highlight === true ? "text-[#1455bb]" : "text-slate-900"
                }`}
              >
                {loading && !overview && (!items || items.length === 0) ? (
                  <div className="h-7 w-16 bg-slate-200/60 rounded animate-pulse" />
                ) : (
                  item.value
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1 truncate">
                {item.label}
              </div>
              {item.sublabel && (
                <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {item.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
