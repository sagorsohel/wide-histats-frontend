"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";

export type RangeOption = "today" | "yesterday" | "7d" | "30d";

export interface CustomDateWindow {
  from: string;
  to: string;
  label?: string;
  mode?: "daily" | "monthly" | "range";
}

interface HistatsCalendarProps {
  selectedPreset?: RangeOption;
  onPresetChange?: (preset: RangeOption) => void;
  onDateChange: (window: CustomDateWindow) => void;
  currentWindow?: CustomDateWindow | null;
  showNewAndLost?: boolean;
  onToggleNewAndLost?: (val: boolean) => void;
  initialDate?: Date;
}

export const HistatsCalendar: React.FC<HistatsCalendarProps> = ({
  selectedPreset = "today",
  onPresetChange,
  onDateChange,
  currentWindow,
  showNewAndLost = false,
  onToggleNewAndLost,
  initialDate,
}) => {
  const [calendarMode, setCalendarMode] = useState<"daily" | "range" | "monthly">("daily");
  const [viewFilter, setViewFilter] = useState<"normal" | "range" | "compare">("normal");

  // Current calendar view (year & month)
  const [viewYear, setViewYear] = useState<number>(() => (initialDate || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => (initialDate || new Date()).getMonth());

  // Currently selected date (for daily mode)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = initialDate || new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Range mode selection state
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate real calendar days for the current viewMonth & viewYear
  const calendarDays = useMemo(() => {
    const days: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      isToday: boolean;
    }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Number of days in current view month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Day of week of the 1st day of month (0 = Sun, 1 = Mon ... 6 = Sat)
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    // Monday-based offset (0 = Monday, 6 = Sunday)
    const mondayOffset = (firstDayOfWeek + 6) % 7;

    // Previous month trailing days
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, prevMonthDays - i);
      d.setHours(0, 0, 0, 0);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: d.getTime() === today.getTime(),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      d.setHours(0, 0, 0, 0);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: d.getTime() === today.getTime(),
      });
    }

    // Next month leading days (fill to multiple of 7, up to 35 or 42)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      d.setHours(0, 0, 0, 0);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: d.getTime() === today.getTime(),
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Handle Preset Click (Today, Yesterday, Last 7 Days, Last 30 Days)
  const handlePresetClick = (preset: RangeOption) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preset === "today") {
      setCalendarMode("daily");
      setSelectedDate(today);
      setRangeStart(null);
      setRangeEnd(null);
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      if (onPresetChange) onPresetChange("today");
    } else if (preset === "yesterday") {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      setCalendarMode("daily");
      setSelectedDate(yest);
      setRangeStart(null);
      setRangeEnd(null);
      setViewMonth(yest.getMonth());
      setViewYear(yest.getFullYear());
      if (onPresetChange) onPresetChange("yesterday");
    } else if (preset === "7d") {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      setCalendarMode("range");
      setRangeStart(start);
      setRangeEnd(today);
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      if (onPresetChange) onPresetChange("7d");
    } else if (preset === "30d") {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      setCalendarMode("range");
      setRangeStart(start);
      setRangeEnd(today);
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      if (onPresetChange) onPresetChange("30d");
    }
  };

  // Handle Single or Range Date Click
  const handleDateClick = (dayDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If day is from another month, adjust view
    if (dayDate.getMonth() !== viewMonth) {
      setViewMonth(dayDate.getMonth());
      setViewYear(dayDate.getFullYear());
    }

    if (calendarMode === "range") {
      // Range mode
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range selection
        setRangeStart(dayDate);
        setRangeEnd(null);
      } else {
        // Complete range selection
        const start = rangeStart < dayDate ? rangeStart : dayDate;
        const end = rangeStart < dayDate ? dayDate : rangeStart;
        setRangeStart(start);
        setRangeEnd(end);

        const from = new Date(start);
        from.setHours(0, 0, 0, 0);
        const to = new Date(end);
        if (end.getTime() === today.getTime()) {
          to.setTime(Date.now());
        } else {
          to.setHours(23, 59, 59, 999);
        }

        const label = `${start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;

        onDateChange({
          from: from.toISOString(),
          to: to.toISOString(),
          label,
          mode: "range",
        });
      }
    } else {
      // Daily mode
      setSelectedDate(dayDate);
      setRangeStart(null);
      setRangeEnd(null);

      const from = new Date(dayDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dayDate);

      if (dayDate.getTime() === today.getTime()) {
        to.setTime(Date.now());
      } else {
        to.setHours(23, 59, 59, 999);
      }

      const isToday = dayDate.getTime() === today.getTime();
      const isYesterday = dayDate.getTime() === today.getTime() - 86400000;

      onDateChange({
        from: from.toISOString(),
        to: to.toISOString(),
        label: isToday
          ? "Today"
          : isYesterday
          ? "Yesterday"
          : dayDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
        mode: "daily",
      });
    }
  };

  // Handle Monthly Mode Click
  const handleMonthlyMode = () => {
    setCalendarMode("monthly");
    const today = new Date();
    const from = new Date(viewYear, viewMonth, 1, 0, 0, 0, 0);
    const to = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999);

    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) {
      to.setTime(Date.now());
    }

    const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    onDateChange({
      from: from.toISOString(),
      to: to.toISOString(),
      label: monthName,
      mode: "monthly",
    });
  };

  // Month title formatting
  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleString("en-US", { month: "short" }).toUpperCase() + " " + viewYear;
  }, [viewYear, viewMonth]);

  // Current active label for badge
  const activeLabel = useMemo(() => {
    if (currentWindow?.label) return currentWindow.label;
    if (selectedPreset === "today") return "Today";
    if (selectedPreset === "yesterday") return "Yesterday";
    if (selectedPreset === "7d") return "Last 7 Days";
    if (selectedPreset === "30d") return "Last 30 Days";
    return "Today";
  }, [currentWindow, selectedPreset]);

  return (
    <div className="w-full bg-white select-none">
      {/* 1. TOP QUICK PRESETS BAR (Today, Yesterday, Last 7 Days, Last 30 Days) - MOBILE ONLY (lg:hidden) */}
      <div className="lg:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Preset:
          </span>
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "7d", label: "Last 7 days" },
            { id: "30d", label: "Last 30 days" },
          ].map((preset) => {
            const isActive = !currentWindow && selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.id as RangeOption)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#1d5b9f] text-white shadow-xs scale-102 ring-1 ring-blue-700/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Active Filter Indicator Badge on Mobile */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/90 text-[#1d5b9f] border border-blue-200/90 rounded-lg text-xs font-bold self-start sm:self-auto">
          <CalendarIcon className="w-3.5 h-3.5 text-[#1d5b9f] shrink-0" />
          <span>Active: {activeLabel}</span>
          {currentWindow && (
            <button
              type="button"
              onClick={() => handlePresetClick("today")}
              className="text-slate-400 hover:text-slate-800 ml-1 font-black text-sm"
              title="Reset to today"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 2. CALENDAR HEADER (Daily / Monthly Toggles + Month Navigation) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setCalendarMode("daily");
              setViewFilter("normal");
              setRangeStart(null);
              setRangeEnd(null);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-md transition-all cursor-pointer ${
              calendarMode === "daily"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => {
              setCalendarMode("range");
              setViewFilter("range");
              if (!rangeStart) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setRangeStart(today);
              }
            }}
            className={`lg:hidden px-2.5 sm:px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              calendarMode === "range"
                ? "bg-white text-[#1d5b9f] shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Date Range</span>
            {calendarMode === "range" && !rangeEnd && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
            )}
          </button>
          <button
            type="button"
            onClick={handleMonthlyMode}
            className={`px-2.5 sm:px-3 py-1 rounded-md transition-all cursor-pointer ${
              calendarMode === "monthly"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 tracking-wider px-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#1d5b9f] hidden lg:inline-block" />
            <span className="text-[#1d5b9f]">{monthTitle}</span>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. RANGE HELPER PROMPT */}
      {calendarMode === "range" && (
        <div className="bg-blue-50/80 border border-blue-200 text-blue-900 text-[11px] rounded-lg px-3 py-1.5 mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
            <span>
              {!rangeStart
                ? "Click on start date"
                : !rangeEnd
                ? "Now click on end date to filter by this range"
                : `Range selected: ${rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} to ${rangeEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </span>
          </div>
          {rangeStart && !rangeEnd && (
            <button
              type="button"
              onClick={() => {
                setRangeStart(null);
                setRangeEnd(null);
              }}
              className="text-blue-700 hover:underline font-bold text-[10px]"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* 4. REAL INTERACTIVE CALENDAR GRID */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-2.5 sm:p-3 mb-3">
        {/* Day of Week Header: M T W T F S S (Saturday and Sunday in Red font) */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-[11px] font-bold text-slate-500 mb-1.5 border-b border-slate-200 pb-1.5">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span className="text-rose-600">S</span>
          <span className="text-rose-600">S</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center text-[11px] sm:text-xs font-mono">
          {calendarDays.map((item, idx) => {
            const time = item.date.getTime();

            // Single date selected
            const isSingleSelected =
              calendarMode === "daily" &&
              selectedDate &&
              time === selectedDate.getTime();

            // Range mode check
            const isRangeStart = rangeStart && time === rangeStart.getTime();
            const isRangeEnd = rangeEnd && time === rangeEnd.getTime();
            const inRange =
              rangeStart &&
              rangeEnd &&
              time >= rangeStart.getTime() &&
              time <= rangeEnd.getTime();

            // Hover preview for range selection
            const inHoverRange =
              calendarMode === "range" &&
              rangeStart &&
              !rangeEnd &&
              hoverDate &&
              ((time >= rangeStart.getTime() && time <= hoverDate.getTime()) ||
                (time <= rangeStart.getTime() && time >= hoverDate.getTime()));

            let cellClass =
              "py-1 sm:py-1.5 transition-all cursor-pointer rounded flex items-center justify-center font-semibold ";

            if (isSingleSelected || isRangeStart || isRangeEnd) {
              cellClass += "bg-[#1d5b9f] text-white font-bold shadow-xs scale-102 ring-1 ring-blue-700/30 ";
            } else if (inRange) {
              cellClass += "bg-blue-100 text-[#1d5b9f] font-bold ";
            } else if (inHoverRange) {
              cellClass += "bg-blue-50 text-blue-800 border border-dashed border-blue-300 ";
            } else if (!item.isCurrentMonth) {
              cellClass += "text-slate-300 hover:text-slate-600 hover:bg-slate-200/50 ";
            } else if (item.isWeekend) {
              cellClass += "text-rose-600 hover:bg-rose-50 font-bold ";
            } else {
              cellClass += "text-slate-700 hover:bg-blue-50 hover:text-[#1d5b9f] ";
            }

            if (item.isToday && !isSingleSelected && !isRangeStart && !isRangeEnd) {
              cellClass += "ring-1 ring-blue-400 font-bold ";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDateClick(item.date)}
                onMouseEnter={() => {
                  if (calendarMode === "range" && rangeStart && !rangeEnd) {
                    setHoverDate(item.date);
                  }
                }}
                className={cellClass}
              >
                {item.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. BOTTOM BAR: normal | range | compare (Desktop) / Legend (Mobile) + New & Lost toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
        {/* Desktop: classic Histats normal | range | compare selector */}
        <div className="hidden lg:inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
          {(["normal", "range", "compare"] as const).map((mode) => {
            const isModeActive =
              (mode === "normal" && calendarMode === "daily") ||
              (mode === "range" && calendarMode === "range") ||
              (mode === "compare" && viewFilter === "compare");
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setViewFilter(mode);
                  if (mode === "normal") {
                    setCalendarMode("daily");
                    setRangeStart(null);
                    setRangeEnd(null);
                    handleDateClick(selectedDate);
                  } else if (mode === "range") {
                    setCalendarMode("range");
                    if (!rangeStart) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      setRangeStart(today);
                    }
                  } else if (mode === "compare") {
                    setViewFilter("compare");
                  }
                }}
                className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                  isModeActive
                    ? "bg-white text-emerald-800 font-bold border border-emerald-400 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>

        {/* Mobile: Red = Weekend | Blue = Active legend */}
        <div className="lg:hidden flex items-center gap-2 text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-0.5" />
          <span className="text-slate-500 font-medium">Red = Weekend</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Blue = Active</span>
        </div>

        {onToggleNewAndLost && (
          <button
            type="button"
            onClick={() => onToggleNewAndLost(!showNewAndLost)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              showNewAndLost
                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                : "bg-slate-900 text-white border-slate-950 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-xs bg-emerald-400 inline-block" />
            <span>new & lost</span>
          </button>
        )}
      </div>
    </div>
  );
};
