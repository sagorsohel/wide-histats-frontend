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
import { TrafficStatsChart } from "@/components/analytics/TrafficStatsChart";
import { TrafficHourlyTable } from "@/components/analytics/TrafficHourlyTable";
import { Eye, Users, UserPlus, RefreshCw, Layers } from "lucide-react";

export default function TrafficStatsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { selectedWebsite, websites } = useWebsite();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewTab, setViewTab] = useState<CalendarViewTab>("hourly");
  const [selectionMode, setSelectionMode] = useState<CalendarSelectionMode>("normal");
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
        const res = await api.get<TrafficStatsData>(endpoint, { skipCache: isSilent });

        if (res.success && res.data) {
          setTrafficData(res.data);
        }
      } catch (err) {
        console.error("Failed to load traffic stats:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedWebsite?.id, trafficData]
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

  return (
    <div className="min-h-screen bg-[#f1f4f8] text-slate-800 font-sans pb-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pt-3 sm:pt-5 space-y-3">
        {/* Top Glossy Blue Banner: Daily stats | 5 November */}
        <div className="bg-gradient-to-r from-[#2968a3] via-[#337ab7] to-[#2968a3] border border-[#1b4b79] rounded-t shadow-md px-3 sm:px-5 py-2.5 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-xl tracking-tight text-white drop-shadow-xs">
              Daily stats
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white/90 hidden sm:inline-block">
              {selectedWebsite?.domain || "Analytics"}
            </span>
          </div>

          <div className="font-extrabold text-sm sm:text-lg tracking-tight text-white drop-shadow-xs flex items-center gap-2">
            <span>{trafficData?.dateFormatted || headerDateStr}</span>
            {loading && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white/70" />
            )}
          </div>
        </div>

        {/* Upper Card: 5 Metric Boxes (Left) + Histats Calendar (Right) */}
        <div className="bg-white border-x border-b border-[#c4d1db] shadow-xs p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 8 Cols: Metric Statistics */}
            <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-6 order-2 lg:order-1">
              {/* Row 1: 3 Primary Big Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-5">
                {/* 1. Total page views */}
                <div className="sm:border-r border-slate-200 sm:pr-4">
                  <div className="text-2xl sm:text-3xl font-black text-[#1d5b9f] tracking-tight">
                    {trafficData
                      ? formatCommas(trafficData.totalPageviews)
                      : "..."}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    Total page views
                  </div>
                </div>

                {/* 2. Total visitors */}
                <div className="sm:border-r border-slate-200 sm:pr-4">
                  <div className="text-2xl sm:text-3xl font-black text-[#1d5b9f] tracking-tight">
                    {trafficData
                      ? formatCommas(trafficData.totalVisitors)
                      : "..."}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    Total visitors
                  </div>
                </div>

                {/* 3. First time visitors */}
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1d5b9f] tracking-tight">
                    {trafficData
                      ? formatCommas(trafficData.firstTimeVisitors)
                      : "..."}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    First time visitors
                  </div>
                </div>
              </div>

              {/* Row 2: 2 Secondary Ratio Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 4. Page views per visit */}
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {trafficData
                      ? trafficData.pagesPerVisit.toFixed(2)
                      : "..."}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    Page views per visit
                  </div>
                </div>

                {/* 5. New visitors ratio */}
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {trafficData
                      ? `${trafficData.newVisitorsRatio.toFixed(0)}%`
                      : "..."}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    New visitors ratio
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Histats Calendar */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end order-1 lg:order-2">
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
            </div>
          </div>
        </div>

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
