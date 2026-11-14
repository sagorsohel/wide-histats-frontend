"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebsite } from "@/context/WebsiteContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
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
import { Eye, Users, UserPlus, RefreshCw, Layers } from "lucide-react";

export default function TrafficStatsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { selectedWebsite, websites } = useWebsite();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewTab, setViewTab] = useState<CalendarViewTab>("hourly");
  const [selectionMode, setSelectionMode] =
    useState<CalendarSelectionMode>("normal");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const [trafficData, setTrafficData] = useState<TrafficStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveUsersCount, setLiveUsersCount] = useState<number>(0);

  const tableRef = useRef<HTMLDivElement>(null);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadTrafficData = useCallback(
    async (targetDate: Date, isSilent = false) => {
      if (!selectedWebsite?.id) {
        setLoading(false);
        return;
      }

      // Format start and end of selected day in local time
      const from = new Date(targetDate);
      from.setHours(0, 0, 0, 0);

      // Strict future check: future date has zero traffic
      if (from.getTime() > Date.now()) {
        setTrafficData({
          date: targetDate.toISOString(),
          dateFormatted: targetDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          dateFull: targetDate.toDateString(),
          totalPageviews: 0,
          totalVisitors: 0,
          firstTimeVisitors: 0,
          pagesPerVisit: 0,
          newVisitorsRatio: 0,
          avgBounceRate: 0,
          hourly: [],
        });
        setLoading(false);
        return;
      }

      const to = new Date(targetDate);
      to.setHours(23, 59, 59, 999);

      const endpoint = `/api/v1/analytics/traffic?websiteId=${selectedWebsite.id}&from=${from.toISOString()}&to=${to.toISOString()}`;

      if (!isSilent && !trafficData) {
        const cached = api.getCached<TrafficStatsData>(endpoint);
        if (cached?.data) {
          setTrafficData(cached.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const res = await api.get<TrafficStatsData>(endpoint, {
          skipCache: isSilent,
        });

        if (res.success && res.data) {
          setTrafficData(res.data);
        }
      } catch (err) {
        console.error("Failed to load traffic stats:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedWebsite?.id, trafficData],
  );

  // Initial and reactive load on website or date change
  useEffect(() => {
    if (selectedWebsite?.id) {
      loadTrafficData(selectedDate);
    }
  }, [selectedWebsite?.id, selectedDate, loadTrafficData]);

  // Real-time socket listener for live active visitor pulse
  useEffect(() => {
    if (!selectedWebsite?.id) return;

    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (data && typeof data.activeCount === "number") {
        setLiveUsersCount(data.activeCount);
      }
    };

    socket.on("realtime_update", handleRealtimeUpdate);

    return () => {
      socket.off("realtime_update", handleRealtimeUpdate);
    };
  }, [selectedWebsite?.id]);

  // Background auto-refresh every 20 seconds
  useEffect(() => {
    if (!selectedWebsite?.id) return;
    const interval = setInterval(() => {
      loadTrafficData(selectedDate, true);
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedWebsite?.id, selectedDate, loadTrafficData]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadTrafficData(date);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
    setSelectedDate(start);
    loadTrafficData(start);
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format header date string, e.g. "5 November"
  const headerDateStr = selectedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });

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
          dateText={trafficData?.dateFormatted || headerDateStr}
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
