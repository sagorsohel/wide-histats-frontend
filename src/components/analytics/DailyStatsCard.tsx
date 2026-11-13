"use client";

import React from "react";
import { OverviewStats } from "@/types/analytics";
import { RangeOption } from "./DateRangePicker";
import { formatNumber } from "@/lib/utils";

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
  dateText?: string;
  calendar?: React.ReactNode;
  children?: React.ReactNode;
}

export const DailyStatsCard: React.FC<DailyStatsCardProps> = ({
  overview,
  items,
  loading = false,
  range = "today",
  domain,
  title,
  dateText,
  calendar,
  children,
}) => {
  const displayTitle =
    title ||
    (range === "today" || range === "yesterday"
      ? "Daily stats"
      : "Period stats");

  // Format default date like "13 November" matching exact target screenshot
  const displayDateText =
    dateText ||
    (range === "yesterday"
      ? "Yesterday"
      : new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
        }).format(new Date()));

  // Default fallback items from overview if custom items are not provided
  const displayItems: StatItem[] =
    items && items.length >= 5
      ? items
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
        ];

  return (
    <div className="rounded-[4px] border border-[#b0b0b0] overflow-hidden shadow-2xs w-full select-none bg-white font-sans text-slate-800">
      {/* Top Glossy Gradient Blue Banner: Exact text size matching screenshot */}
      <div className="bg-gradient-to-b from-[#4a89c8] via-[#3575b5] to-[#2563a3] border-b border-[#1b5087] px-3.5 py-1.5 flex items-center justify-end text-white">
        {/* <div className="flex items-center gap-2">
          <span className="text-[17px] sm:text-[18px] font-bold text-white tracking-normal font-sans drop-shadow-xs">
            {displayTitle}
          </span>
          {domain && (
            <span className="px-1 py-0.2 rounded text-[9.5px] font-bold bg-white/20 text-white/95 border border-white/25 uppercase tracking-wider hidden sm:inline-block">
              {domain}
            </span>
          )}
        </div> */}
        <div className="text-[17px]  sm:text-[18px] font-bold text-white tracking-normal font-sans drop-shadow-xs">
          {displayDateText}
        </div>
      </div>

      {/* Card Body: Compact metrics with smaller font matching screenshot */}
      <div className="p-2.5 sm:p-3 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
          {/* Left Stats Section: Either custom children (e.g. GeoStackedBarLineChart) or standard 2-row metrics */}
          <div className="flex-1 w-full lg:border-r border-[#d4d4d4] lg:pr-4">
            {children ? (
              children
            ) : (
              <>
                {/* Row 1: Primary Metrics with 1px gray vertical dividers */}
                <div className="grid grid-cols-3 divide-x divide-[#d4d4d4] pb-2 border-b border-[#d4d4d4]">
                  {displayItems.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className={
                        idx === 0 ? "pr-3" : idx === 1 ? "px-3" : "pl-3"
                      }
                    >
                      <div className="text-[18px] sm:text-[19px] font-bold text-[#0055aa] leading-tight tracking-tight tabular-nums truncate">
                        {loading &&
                        !overview &&
                        (!items || items.length === 0) ? (
                          <div className="h-5 w-16 bg-slate-200/60 rounded animate-pulse" />
                        ) : (
                          item.value
                        )}
                      </div>
                      <div className="text-[11px] sm:text-[11.5px] font-normal text-[#222222] mt-0.5 truncate leading-tight">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 2: Secondary Metrics directly under row 1 */}
                <div className="grid grid-cols-3 pt-2">
                  {/* Col 1 */}
                  <div className="pr-3 border-r border-[#d4d4d4]">
                    <div className="text-[17px] sm:text-[18px] font-bold text-[#111111] leading-tight tracking-tight tabular-nums truncate">
                      {loading &&
                      !overview &&
                      (!items || items.length === 0) ? (
                        <div className="h-5 w-12 bg-slate-200/60 rounded animate-pulse" />
                      ) : (
                        displayItems[3]?.value
                      )}
                    </div>
                    <div className="text-[11px] sm:text-[11.5px] font-normal text-[#222222] mt-0.5 truncate leading-tight">
                      {displayItems[3]?.label}
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="px-3">
                    <div className="text-[17px] sm:text-[18px] font-bold text-[#111111] leading-tight tracking-tight tabular-nums truncate">
                      {loading &&
                      !overview &&
                      (!items || items.length === 0) ? (
                        <div className="h-5 w-12 bg-slate-200/60 rounded animate-pulse" />
                      ) : (
                        displayItems[4]?.value
                      )}
                    </div>
                    <div className="text-[11px] sm:text-[11.5px] font-normal text-[#222222] mt-0.5 truncate leading-tight">
                      {displayItems[4]?.label}
                    </div>
                  </div>

                  {/* Col 3: empty or extra item */}
                  {displayItems[5] ? (
                    <div className="pl-3 border-l border-[#d4d4d4]">
                      <div className="text-[17px] sm:text-[18px] font-bold text-[#111111] leading-tight tracking-tight tabular-nums truncate">
                        {displayItems[5].value}
                      </div>
                      <div className="text-[11px] sm:text-[11.5px] font-normal text-[#222222] mt-0.5 truncate leading-tight">
                        {displayItems[5].label}
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Calendar Section: Exact 222px width, strictly 127px height */}
          {calendar && (
            <div className="shrink-0 w-full sm:w-[222px] h-[127px] flex justify-center lg:justify-end overflow-hidden">
              {calendar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
