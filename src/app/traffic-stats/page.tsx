"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { useAppSelector } from "@/store";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { resolveRange } from "@/lib/dateRange";
import { useTabFocus } from "@/hooks/useTabFocus";
import { TrafficStatsData } from "@/types/analytics";
import { formatCommas } from "@/lib/utils";
import {
  HistatsCalendar,
  CalendarViewTab,
  CalendarSelectionMode,
} from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import { TrafficStatsChart } from "@/components/analytics/TrafficStatsChart";
import { TrafficHourlyTable } from "@/components/analytics/TrafficHourlyTable";

const REFRESH_MS = 30_000;

const emptyTraffic = (start: Date): TrafficStatsData => ({
  date: start.toISOString(),
  dateFormatted: start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  dateFull: start.toDateString(),
  totalPageviews: 0,
  totalVisitors: 0,
  firstTimeVisitors: 0,
  pagesPerVisit: 0,
  newVisitorsRatio: 0,
  avgBounceRate: 0,
  hourly: [],
});

export default function TrafficStatsPage() {
  const { selectedWebsite } = useWebsite();
  const siteId = selectedWebsite?.id ?? null;
  const timezone = selectedWebsite?.timezone ?? null;

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewTab, setViewTab] = useState<CalendarViewTab>("hourly");
  const [selectionMode, setSelectionMode] =
    useState<CalendarSelectionMode>("normal");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const [trafficData, setTrafficData] = useState<TrafficStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Seed the live counter from the shared realtime store, then follow socket updates.
  const storeActiveCount = useAppSelector((state) =>
    siteId ? state.realtime.byWebsite[siteId]?.data?.activeCount : undefined,
  );
  const [liveUsersCount, setLiveUsersCount] = useState<number>(0);
  useEffect(() => {
    if (typeof storeActiveCount === "number") setLiveUsersCount(storeActiveCount);
  }, [storeActiveCount]);

  const tableRef = useRef<HTMLDivElement>(null);

  // The window being shown: a selected range, or the single selected day.
  const windowStart = rangeStart && rangeEnd ? rangeStart : selectedDate;
  const windowEnd = rangeStart && rangeEnd ? rangeEnd : selectedDate;
  const windowKey = `${windowStart.toDateString()}|${windowEnd.toDateString()}`;

  const bounds = useMemo(
    () =>
      resolveRange(
        "today",
        { from: windowStart.toISOString(), to: windowEnd.toISOString(), mode: "range" },
        timezone,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windowKey, timezone],
  );

  const seqRef = useRef(0);
  const inFlightRef = useRef(false);
  const loadArgsRef = useRef({ siteId, bounds, windowStart });
  loadArgsRef.current = { siteId, bounds, windowStart };

  const loadTrafficData = useCallback(async (silent: boolean) => {
    const { siteId, bounds, windowStart } = loadArgsRef.current;
    if (!siteId) {
      setLoading(false);
      return;
    }
    if (silent && (inFlightRef.current || document.visibilityState === "hidden")) return;

    const seq = ++seqRef.current;
    const isStale = () => seq !== seqRef.current;

    if (bounds.isFuture) {
      setTrafficData(emptyTraffic(windowStart));
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    inFlightRef.current = true;
    try {
      const endpoint =
        `/api/v1/analytics/traffic?websiteId=${encodeURIComponent(siteId)}` +
        `&from=${encodeURIComponent(bounds.from)}&to=${encodeURIComponent(bounds.to)}`;
      const res = await api.get<TrafficStatsData>(endpoint, { skipCache: silent });
      if (isStale()) return;
      if (res.success && res.data) setTrafficData(res.data);
    } catch (err) {
      console.error("Failed to load traffic stats:", err);
    } finally {
      if (!isStale()) {
        inFlightRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // One load per website / window change. Clear the previous site's numbers on switch.
  const prevSiteRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevSiteRef.current && prevSiteRef.current !== siteId) {
      setTrafficData(null);
      setLiveUsersCount(0);
    }
    prevSiteRef.current = siteId;
    loadTrafficData(false);
  }, [siteId, bounds, loadTrafficData]);

  // Background refresh (paused while hidden) + refresh on focus / reconnect.
  useEffect(() => {
    const timer = setInterval(() => loadTrafficData(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadTrafficData]);
  useTabFocus(() => loadTrafficData(true));
  useEffect(() => {
    const handleSync = () => loadTrafficData(true);
    window.addEventListener("histat:socket_sync", handleSync);
    return () => window.removeEventListener("histat:socket_sync", handleSync);
  }, [loadTrafficData]);

  // Live active-visitor count. Backend event names are namespaced with "website:".
  useEffect(() => {
    if (!siteId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (data?.websiteId === siteId && typeof data.activeCount === "number") {
        setLiveUsersCount(data.activeCount);
      }
    };

    socket.on("website:realtime_update", handleRealtimeUpdate);
    socket.on("website:realtime_init", handleRealtimeUpdate);
    return () => {
      socket.off("website:realtime_update", handleRealtimeUpdate);
      socket.off("website:realtime_init", handleRealtimeUpdate);
    };
  }, [siteId]);

  const handleDateSelect = (date: Date) => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelectedDate(date);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
    setSelectedDate(start);
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Header date, e.g. "5 November" or "1 November – 7 November" for a range
  const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  const isRange = !!(rangeStart && rangeEnd && rangeStart.toDateString() !== rangeEnd.toDateString());
  const headerDateStr = isRange ? `${fmtDay(rangeStart!)} – ${fmtDay(rangeEnd!)}` : fmtDay(selectedDate);

  // Prepare stat items for DailyStatsCard
  const trafficStatItems = [
    {
      value: trafficData ? formatCommas(trafficData.totalPageviews) : "...",
      label: "Total page views",
      highlight: true,
    },
    {
      value: trafficData ? formatCommas(trafficData.totalVisitors) : "...",
      label: "Total visitors",
      highlight: true,
    },
    {
      value: trafficData ? formatCommas(trafficData.firstTimeVisitors) : "...",
      label: "First time visitors",
      highlight: true,
    },
    {
      value: trafficData ? trafficData.pagesPerVisit.toFixed(2) : "...",
      label: "Page views per visit",
      highlight: false,
    },
    {
      value: trafficData
        ? `${trafficData.newVisitorsRatio.toFixed(0)}%`
        : "...",
      label: "New visitors ratio",
      highlight: false,
    },
  ];

  return (
    <div className="w-full text-slate-800 font-sans pb-2">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Unified DailyStatsCard with Integrated Calendar */}
        <DailyStatsCard
          title="Daily stats"
          items={trafficStatItems}
          loading={loading}
          domain={selectedWebsite?.domain}
          dateText={isRange ? headerDateStr : trafficData?.dateFormatted || headerDateStr}
          calendar={
            <HistatsCalendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              viewTab={viewTab}
              onViewTabChange={setViewTab}
              selectionMode={selectionMode}
              onSelectionModeChange={setSelectionMode}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onSelectRange={handleRangeSelect}
            />
          }
        />

        {/* Multi-Bar Chart Section (Screenshot 1) */}
        <TrafficStatsChart
          data={trafficData?.hourly || []}
          liveUsersCount={liveUsersCount}
          onScrollToTable={scrollToTable}
        />

        {/* Detailed 24-Hour Table Section (Screenshot 2) */}
        <div ref={tableRef}>
          <TrafficHourlyTable
            hourly={trafficData?.hourly || []}
            totalVisitors={trafficData?.totalVisitors || 0}
            totalPageviews={trafficData?.totalPageviews || 0}
            firstTimeVisitors={trafficData?.firstTimeVisitors || 0}
            pagesPerVisit={trafficData?.pagesPerVisit || 0}
            newVisitorsRatio={trafficData?.newVisitorsRatio || 0}
            avgBounceRate={trafficData?.avgBounceRate || 0}
          />
        </div>
      </div>
    </div>
  );
}
