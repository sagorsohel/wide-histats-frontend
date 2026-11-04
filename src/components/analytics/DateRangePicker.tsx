"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Check,
  Sparkles,
} from "lucide-react";

export type RangeOption = "today" | "yesterday" | "7d" | "30d";

export interface CustomDateWindow {
  from: string;
  to: string;
  label?: string;
  mode?: "daily" | "monthly" | "range";
}

export interface DateRangePickerProps {
  selectedRange: RangeOption;
  onChange: (range: RangeOption) => void;
  customWindow?: CustomDateWindow | null;
  onCustomRangeChange?: (window: CustomDateWindow | null) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  onChange,
  customWindow,
  onCustomRangeChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"daily" | "range" | "monthly">("daily");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calendar month/year navigation state
  const [viewYear, setViewYear] = useState<number>(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => today.getMonth());

  // Date selection states
  const [selectedSingleDate, setSelectedSingleDate] = useState<Date>(today);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close popover on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Generate calendar days for the current viewMonth & viewYear
  const calendarDays = useMemo(() => {
    const days: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      isToday: boolean;
    }[] = [];

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
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

    // Next month leading days (fill to multiple of 7, 35 or 42)
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
  }, [viewYear, viewMonth, today]);

  // Handle Preset selection
  const handlePresetSelect = (preset: RangeOption) => {
    onChange(preset);
    if (onCustomRangeChange) {
      onCustomRangeChange(null);
    }
    setRangeStart(null);
    setRangeEnd(null);
    setIsOpen(false);
  };

  // Handle Reset to Today
  const handleReset = () => {
    onChange("today");
    if (onCustomRangeChange) {
      onCustomRangeChange(null);
    }
    setSelectedSingleDate(today);
    setRangeStart(null);
    setRangeEnd(null);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setIsOpen(false);
  };

  // Handle Date Click inside Calendar
  const handleDateClick = (dayDate: Date) => {
    // If clicked date belongs to another month, jump view
    if (dayDate.getMonth() !== viewMonth) {
      setViewMonth(dayDate.getMonth());
      setViewYear(dayDate.getFullYear());
    }

    if (calendarMode === "range") {
      // Range selection
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Step 1: select start date
        setRangeStart(dayDate);
        setRangeEnd(null);
      } else {
        // Step 2: select end date and apply
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

        if (onCustomRangeChange) {
          onCustomRangeChange({
            from: from.toISOString(),
            to: to.toISOString(),
            label,
            mode: "range",
          });
        }
        setIsOpen(false);
      }
    } else {
      // Daily selection
      setSelectedSingleDate(dayDate);
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

      const label = isToday
        ? "Today"
        : isYesterday
        ? "Yesterday"
        : dayDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

      if (onCustomRangeChange) {
        onCustomRangeChange({
          from: from.toISOString(),
          to: to.toISOString(),
          label,
          mode: "daily",
        });
      }
      setIsOpen(false);
    }
  };

  // Handle Monthly selection
  const handleMonthlySelect = () => {
    setCalendarMode("monthly");
    const from = new Date(viewYear, viewMonth, 1, 0, 0, 0, 0);
    const to = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999);

    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) {
      to.setTime(Date.now());
    }

    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (onCustomRangeChange) {
      onCustomRangeChange({
        from: from.toISOString(),
        to: to.toISOString(),
        label: monthLabel,
        mode: "monthly",
      });
    }
    setIsOpen(false);
  };

  // Month Title
  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleString("en-US", { month: "short" }).toUpperCase() + " " + viewYear;
  }, [viewYear, viewMonth]);

  const presetOptions: { id: RangeOption; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
  ];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* MAIN PICKER BAR */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-slate-200 shadow-2xs max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
        {/* INTERACTIVE CALENDAR ICON BUTTON (Pressing opens calendar on all pages & mobile) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`p-1.5 sm:px-2 rounded-md transition-all flex items-center justify-center cursor-pointer shrink-0 relative ${
            isOpen || customWindow
              ? "bg-blue-50 text-[#1d5b9f] ring-1 ring-blue-300"
              : "text-slate-500 hover:text-[#1d5b9f] hover:bg-slate-100"
          }`}
          title="Open interactive calendar to pick any date or custom range"
        >
          <CalendarIcon className="w-4 h-4" />
          {customWindow && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>

        {/* ACTIVE CUSTOM RANGE BADGE (When custom date range is selected) */}
        {customWindow?.label ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#1d5b9f] border border-blue-200 rounded-md text-xs font-bold shrink-0">
            <span>{customWindow.label}</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-700 ml-0.5 font-bold text-sm"
              title="Reset to Today"
            >
              ×
            </button>
          </div>
        ) : null}

        {/* STANDARD PRESET BUTTONS (Today, Yesterday, Last 7 Days, Last 30 Days) */}
        {presetOptions.map((opt) => {
          const isActive = !customWindow && selectedRange === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePresetSelect(opt.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#1d5b9f] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* CALENDAR POPOVER / MODAL */}
      {isOpen && (
        <>
          {/* Backdrop Overlay for closing when clicking outside */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 sm:bg-transparent backdrop-blur-2xs sm:backdrop-blur-none"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover Container: Centered modal on mobile, anchored dropdown on desktop */}
          <div
            className="fixed inset-x-3 top-20 z-50 mx-auto max-w-sm sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-84 sm:max-w-none bg-white rounded-2xl sm:rounded-xl border border-slate-200 shadow-2xl p-3.5 select-none animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Popover Header: Mode Switcher, Reset & Close */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 gap-2">
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarMode("daily");
                    setRangeStart(null);
                    setRangeEnd(null);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
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
                    if (!rangeStart) {
                      setRangeStart(today);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    calendarMode === "range"
                      ? "bg-white text-[#1d5b9f] shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Range</span>
                  {calendarMode === "range" && !rangeEnd && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleMonthlySelect}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    calendarMode === "monthly"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 rounded text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to Today"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Month Navigation */}
            <div className="flex items-center justify-between pb-2 mb-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 tracking-wider">
                <CalendarIcon className="w-3.5 h-3.5 text-[#1d5b9f]" />
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

            {/* 3. Range Mode Helper Prompt */}
            {calendarMode === "range" && (
              <div className="bg-blue-50/90 border border-blue-200 text-blue-900 text-[11px] rounded-lg px-2.5 py-1.5 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                  <span className="truncate">
                    {!rangeStart
                      ? "Click start date"
                      : !rangeEnd
                      ? "Now click end date"
                      : `Selected: ${rangeStart.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} - ${rangeEnd.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`}
                  </span>
                </div>
                {rangeStart && !rangeEnd && (
                  <button
                    type="button"
                    onClick={() => {
                      setRangeStart(null);
                      setRangeEnd(null);
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] shrink-0 ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* 4. Calendar Days Grid */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-2 mb-3">
              {/* Day of Week Header: M T W T F S S */}
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

                  const isSingleSelected =
                    calendarMode === "daily" &&
                    selectedSingleDate &&
                    time === selectedSingleDate.getTime() &&
                    item.isCurrentMonth;

                  const isRangeStart = rangeStart && time === rangeStart.getTime();
                  const isRangeEnd = rangeEnd && time === rangeEnd.getTime();
                  const inRange =
                    rangeStart &&
                    rangeEnd &&
                    time >= rangeStart.getTime() &&
                    time <= rangeEnd.getTime();

                  const inHoverRange =
                    calendarMode === "range" &&
                    rangeStart &&
                    !rangeEnd &&
                    hoverDate &&
                    ((time >= rangeStart.getTime() && time <= hoverDate.getTime()) ||
                      (time <= rangeStart.getTime() && time >= hoverDate.getTime()));

                  let cellClass =
                    "py-1 transition-all cursor-pointer rounded flex items-center justify-center font-semibold ";

                  if (isSingleSelected || isRangeStart || isRangeEnd) {
                    cellClass += "bg-[#1d5b9f] text-white font-bold shadow-xs scale-102 ";
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

            {/* 5. Quick Presets Footer */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1 flex-wrap">
                {presetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePresetSelect(opt.id)}
                    className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                <span className="text-rose-500 font-bold">Red</span>: Weekend
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
