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
          <span className="text-[22px] font-extrabold text-emerald-700">
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

  const skeleton = loading && !overview && (!items || items.length === 0);

  const tile = (
    item: StatItem | undefined,
    primary: boolean,
    key: number,
  ) => (
    <div
      key={key}
      className={`rounded-xl px-3.5 py-3 min-w-0 border transition-colors ${
        primary
          ? "bg-[#1058d1]/[0.05] border-[#1058d1]/10"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div
        className={`text-[22px] font-extrabold leading-none tracking-tight tabular-nums truncate ${
          primary ? "text-[#1058d1]" : "text-slate-900"
        }`}
      >
        {skeleton ? (
          <div className="h-6 w-16 bg-slate-200/60 rounded animate-pulse" />
        ) : (
          item?.value
        )}
      </div>
      <div className="mt-1.5 text-[11.5px] font-medium text-slate-500 truncate leading-tight">
        {item?.label}
      </div>
    </div>
  );

  return (
    <div className="rounded-[18px] overflow-hidden w-full select-none bg-white font-sans text-slate-800 border border-white/70 shadow-[0_8px_24px_-8px_rgba(8,40,110,0.35)]">
      <div className="flex flex-col lg:flex-row items-stretch justify-between">
        {/* Left: hero header band + stat tiles */}
        <div className="flex-1 w-full flex flex-col">
          <div className="bg-gradient-to-r from-[#0b46ad] to-[#2d7bf0] px-5 py-3 flex items-center justify-between text-white">
            <span className="text-[16px] font-bold tracking-tight">
              {displayTitle}
            </span>
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/20">
              {displayDateText}
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-center">
            {children ? (
              children
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {displayItems.slice(0, 3).map((item, idx) => tile(item, true, idx))}
                {tile(displayItems[3], false, 3)}
                {tile(displayItems[4], false, 4)}
                {displayItems[5] ? (
                  displayItems[5].href ? (
                    <Link
                      href={displayItems[5].href}
                      className="group rounded-xl px-3.5 py-3 min-w-0 border bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/70 transition-colors cursor-pointer"
                      title="Click to view live users online"
                    >
                      <div className="text-[22px] font-extrabold leading-none tracking-tight tabular-nums truncate flex items-center text-emerald-700">
                        {displayItems[5].value}
                      </div>
                      <div className="mt-1.5 text-[11.5px] font-medium text-emerald-800 truncate leading-tight flex items-center gap-1">
                        <span>{displayItems[5].label}</span>
                        <ChevronRight className="w-3 h-3 text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ) : (
                    tile(displayItems[5], false, 5)
                  )
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: calendar panel */}
        {calendar && (
          <div className="shrink-0 w-full lg:w-[276px] p-3 flex items-center justify-center bg-slate-50/70 lg:border-l border-slate-100">
            {calendar}
          </div>
        )}
      </div>
    </div>
  );
};
