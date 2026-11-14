"use client";

import React from "react";
import Link from "next/link";
import { OverviewStats } from "@/types/analytics";
import { RangeOption } from "./DateRangePicker";
import { formatNumber } from "@/lib/utils";
import { useWebsite } from "@/context/WebsiteContext";
import { useAppSelector } from "@/store";
import { ChevronRight } from "lucide-react";

export interface StatItem {
  value: React.ReactNode;
  label: string;
  sublabel?: string;
  highlight?: boolean;
  href?: string;
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
  liveOnlineCount?: number;
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
  liveOnlineCount,
}) => {
  const { selectedWebsite } = useWebsite();
  const realtimeActiveCount = useAppSelector((state) =>
    selectedWebsite?.id
      ? state.realtime.byWebsite[selectedWebsite.id]?.data?.activeCount
      : undefined,
  );

  const liveCount =
    (liveOnlineCount && liveOnlineCount > 0 ? liveOnlineCount : undefined) ??
    (realtimeActiveCount && realtimeActiveCount > 0
      ? realtimeActiveCount
      : undefined) ??
    (overview?.activeVisitors && overview.activeVisitors > 0
      ? overview.activeVisitors
      : undefined) ??
    (selectedWebsite?.usersOnline && selectedWebsite.usersOnline > 0
      ? selectedWebsite.usersOnline
      : undefined) ??
    realtimeActiveCount ??
    overview?.activeVisitors ??
    0;

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
  const baseItems: StatItem[] =
    items && items.length >= 5
      ? [...items]
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

  // If slot 6 is missing (like on Overview or Traffic Stats), automatically add live User online with click navigation to /realtime!
  if (baseItems.length === 5) {
    baseItems.push({
      value: (
        <span className="flex items-center gap-1.5">
          <span className="text-[17px] sm:text-[18px] font-bold text-[#0055aa] group-hover:text-blue-700 transition-colors">
            {liveCount.toLocaleString()}
          </span>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[8.5px] font-black uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 border border-emerald-300">
            LIVE
          </span>
        </span>
      ),
      label: "User online",
      highlight: true,
      href: "/realtime",
    });
  }

  const displayItems: StatItem[] = baseItems;

  return (
    <div className="rounded-[4px] border border-[#b0b0b0] shadow-[inset_1px_0px_20px_8px_#a1a1aabf] w-full select-none bg-white font-sans text-slate-800">
      <div className="flex flex-col lg:flex-row items-stretch justify-between">
        {/* Left Stats Section: Header bar extends only up to before the calendar */}
        <div className="flex-1 w-full lg:border-r border-[#d4d4d4] flex flex-col justify-between">
          {/* Blue Header Bar: Ends before the calendar */}
          <div className="bg-[#1058d1] px-3.5 py-1.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-[17px] sm:text-[18px] font-bold text-white tracking-normal font-sans drop-shadow-xs">
                {displayTitle}
              </span>
            </div>
            <div className="text-[17px] sm:text-[18px] font-bold text-white tracking-normal font-sans drop-shadow-xs">
              {displayDateText}
            </div>
          </div>

          {/* Card Body: Compact metrics */}
          <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-center">
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

                  {/* Col 3: Users online (Clickable link to /realtime) */}
                  {displayItems[5] ? (
                    displayItems[5].href ? (
                      <Link
                        href={displayItems[5].href}
                        className="pl-3 border-l border-[#d4d4d4] flex flex-col justify-center group hover:bg-[#eef8ee] -my-1 py-1 px-2 rounded transition-colors cursor-pointer"
                        title="Click to view live users online"
                      >
                        <div className="text-[17px] sm:text-[18px] font-bold text-[#0055aa] group-hover:text-[#1b5e20] leading-tight tracking-tight tabular-nums truncate flex items-center">
                          {displayItems[5].value}
                        </div>
                        <div className="text-[11px] sm:text-[11.5px] font-normal text-[#222222] group-hover:text-[#1b5e20] mt-0.5 truncate leading-tight flex items-center gap-1">
                          <span className="text-[8.5px] font-black uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            LIVE
                          </span>
                          <span>{displayItems[5].label}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ) : (
                      <div className="pl-3 border-l border-[#d4d4d4]">
                        <div className="text-[17px] sm:text-[18px] font-bold text-[#111111] leading-tight tracking-tight tabular-nums truncate">
                          {displayItems[5].value}
                        </div>
                        <div className="text-[11px] sm:text-[11.5px] font-normal text-[#222222] mt-0.5 truncate leading-tight">
                          {displayItems[5].label}
                        </div>
                      </div>
                    )
                  ) : (
                    <div />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Calendar Section: Cleanly rendered without clipping */}
        {calendar && (
          <div className="shrink-0 w-full lg:w-[276px] p-2 flex items-center justify-center bg-white">
            {calendar}
          </div>
        )}
      </div>
    </div>
  );
};
