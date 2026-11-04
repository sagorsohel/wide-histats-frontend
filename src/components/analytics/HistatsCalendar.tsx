"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface CustomDateWindow {
  from: string;
  to: string;
  label?: string;
  mode?: "daily" | "monthly" | "range";
}

interface HistatsCalendarProps {
  onDateChange: (window: CustomDateWindow) => void;
  showNewAndLost?: boolean;
  onToggleNewAndLost?: (val: boolean) => void;
  initialDate?: Date;
}

export const HistatsCalendar: React.FC<HistatsCalendarProps> = ({
  onDateChange,
  showNewAndLost = false,
  onToggleNewAndLost,
  initialDate,
}) => {
  const [calendarMode, setCalendarMode] = useState<"daily" | "monthly">("daily");
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

  // Handle single date click
  const handleDateClick = (dayDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If day is from another month, adjust view
    if (dayDate.getMonth() !== viewMonth) {
      setViewMonth(dayDate.getMonth());
      setViewYear(dayDate.getFullYear());
    }

    if (viewFilter === "range") {
      // Range selection mode
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(dayDate);
        setRangeEnd(null);
      } else {
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

        onDateChange({
          from: from.toISOString(),
          to: to.toISOString(),
          label: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          mode: "range",
        });
      }
    } else {
      // Daily normal selection mode
      setSelectedDate(dayDate);
      setRangeStart(null);
      setRangeEnd(null);

      const from = new Date(dayDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dayDate);

      // If clicked day is today, end at current time
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
          : dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
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

    const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    onDateChange({
      from: from.toISOString(),
      to: to.toISOString(),
      label: monthName,
      mode: "monthly",
    });
  };

  // Handle Daily Mode Click
  const handleDailyMode = () => {
    setCalendarMode("daily");
    handleDateClick(selectedDate);
  };

  // Month title formatting
  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleString("en-US", { month: "short" }).toUpperCase() + " " + viewYear;
  }, [viewYear, viewMonth]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between select-none">
      <div>
        {/* Top Header: Daily / Monthly Toggle & Month Title with Nav */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={handleDailyMode}
              className={`px-3 py-1 rounded-md transition-all ${
                calendarMode === "daily"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={handleMonthlyMode}
              className={`px-3 py-1 rounded-md transition-all ${
                calendarMode === "monthly"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5 text-[#1d5b9f]" />
              <span>{monthTitle}</span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real Interactive Calendar Grid */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-2 mb-3">
          {/* Day of Week Header: M T W T F S S (Saturday and Sunday in Red) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span className="text-rose-600">S</span>
            <span className="text-rose-600">S</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center text-[11px] font-mono">
            {calendarDays.map((item, idx) => {
              const time = item.date.getTime();
              const isSelected =
                calendarMode === "daily" &&
                selectedDate &&
                item.date.getTime() === selectedDate.getTime();

              const inRange =
                rangeStart &&
                rangeEnd &&
                time >= rangeStart.getTime() &&
                time <= rangeEnd.getTime();

              const isRangeBoundary =
                (rangeStart && time === rangeStart.getTime()) ||
                (rangeEnd && time === rangeEnd.getTime());

              // Styling
              let cellClass = "py-0.5 transition-all cursor-pointer rounded ";
              if (isSelected || isRangeBoundary) {
                cellClass += "bg-[#1d5b9f] text-white font-bold shadow-xs scale-105 ";
              } else if (inRange) {
                cellClass += "bg-blue-100 text-[#1d5b9f] font-semibold ";
              } else if (!item.isCurrentMonth) {
                cellClass += "text-slate-300 hover:text-slate-500 hover:bg-slate-200/60 ";
              } else if (item.isWeekend) {
                cellClass += "text-rose-600 font-semibold hover:bg-rose-50 ";
              } else {
                cellClass += "text-slate-700 hover:bg-blue-50 hover:text-[#1d5b9f] font-medium ";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateClick(item.date)}
                  className={`w-full text-center ${cellClass}`}
                >
                  {item.dayNumber}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar: normal, range, compare & new & lost */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
          {(["normal", "range", "compare"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setViewFilter(mode);
                if (mode === "normal") {
                  setRangeStart(null);
                  setRangeEnd(null);
                  handleDateClick(selectedDate);
                }
              }}
              className={`px-2 py-0.5 rounded capitalize transition-all ${
                viewFilter === mode
                  ? "bg-white text-emerald-800 font-bold border border-emerald-400 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {onToggleNewAndLost && (
          <button
            type="button"
            onClick={() => onToggleNewAndLost(!showNewAndLost)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all border ${
              showNewAndLost
                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                : "bg-slate-900 text-white border-slate-950 hover:bg-slate-800"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 border border-emerald-200 inline-block" />
            new & lost
          </button>
        )}
      </div>
    </div>
  );
};
