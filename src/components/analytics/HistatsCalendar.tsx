"use client";

import React, { useState, useMemo } from "react";
import { RangeOption, CustomDateWindow } from "./DateRangePicker";

export type { CustomDateWindow, RangeOption };

export type CalendarViewTab = "hourly" | "daily" | "monthly";
export type CalendarSelectionMode = "normal" | "range" | "compare";

export interface HistatsCalendarProps {
  // Mode A: Daily / Traffic Stats props
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  viewTab?: CalendarViewTab;
  onViewTabChange?: (tab: CalendarViewTab) => void;
  selectionMode?: CalendarSelectionMode;
  onSelectionModeChange?: (mode: CalendarSelectionMode) => void;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  onSelectRange?: (start: Date, end: Date) => void;

  // Mode B: Sources / referring sites props
  selectedPreset?: RangeOption;
  onPresetChange?: (r: RangeOption) => void;
  onDateChange?: (win: CustomDateWindow | null) => void;
  currentWindow?: CustomDateWindow | null;
  selectedLabel?: string;
  showNewAndLost?: boolean;
  onToggleNewAndLost?: (val: boolean) => void;
  className?: string;
}

export const HistatsCalendar: React.FC<HistatsCalendarProps> = ({
  // Mode A
  selectedDate,
  onSelectDate,
  viewTab: initialViewTab = "hourly",
  onViewTabChange,
  selectionMode: initialSelectionMode = "normal",
  onSelectionModeChange,
  rangeStart: initialRangeStart,
  rangeEnd: initialRangeEnd,
  onSelectRange,

  // Mode B
  selectedPreset,
  onPresetChange,
  onDateChange,
  currentWindow,
  selectedLabel,
  showNewAndLost = false,
  onToggleNewAndLost,
  className = "",
}) => {
  // Active tab: hourly | daily | monthly
  const [activeTab, setActiveTab] = useState<CalendarViewTab>(initialViewTab);

  // Selection mode: normal vs range vs compare
  const [mode, setMode] = useState<CalendarSelectionMode>(initialSelectionMode);

  // Reference date (strictly clamped to today or earlier, never future)
  const baseDate = useMemo(() => {
    const today = new Date();
    if (currentWindow?.from) {
      const d = new Date(currentWindow.from);
      if (!isNaN(d.getTime())) return d > today ? today : d;
    }
    if (selectedDate) return selectedDate > today ? today : selectedDate;
    return today;
  }, [currentWindow, selectedDate]);

  const [viewYear, setViewYear] = useState<number>(() =>
    baseDate.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState<number>(() => baseDate.getMonth()); // 0-indexed

  // Range selection internal state
  const [rangeStartInternal, setRangeStartInternal] = useState<Date | null>(
    () => {
      if (
        currentWindow?.from &&
        currentWindow?.to &&
        currentWindow.from !== currentWindow.to
      ) {
        return new Date(currentWindow.from);
      }
      return initialRangeStart || null;
    },
  );

  const [rangeEndInternal, setRangeEndInternal] = useState<Date | null>(() => {
    if (
      currentWindow?.from &&
      currentWindow?.to &&
      currentWindow.from !== currentWindow.to
    ) {
      return new Date(currentWindow.to);
    }
    return initialRangeEnd || null;
  });

  const [selectingStart, setSelectingStart] = useState<Date | null>(null);

  const prevMonthName = useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1)
      .toLocaleString("en-US", {
        month: "short",
      })
      .toLowerCase();
  }, [viewYear, viewMonth]);

  const currentMonthName = useMemo(() => {
    return new Date(viewYear, viewMonth, 1)
      .toLocaleString("en-US", {
        month: "short",
      })
      .toLowerCase();
  }, [viewYear, viewMonth]);

  // Build grid starting on Monday (M T W T F S S)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

  // Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Trailing previous month days
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
  const prevDays: { day: number; date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    prevDays.push({
      day,
      date: new Date(viewYear, viewMonth - 1, day),
      isCurrentMonth: false,
    });
  }

  // Current month days
  const currentDays: { day: number; date: Date; isCurrentMonth: boolean }[] =
    [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentDays.push({
      day: d,
      date: new Date(viewYear, viewMonth, d),
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full weeks (up to 35 slots = 5 rows)
  const totalSlots = prevDays.length + currentDays.length;
  const targetSlots = totalSlots <= 35 ? 35 : 42;
  const remainingSlots = targetSlots - totalSlots;
  const nextDays: { day: number; date: Date; isCurrentMonth: boolean }[] = [];
  for (let n = 1; n <= remainingSlots; n++) {
    nextDays.push({
      day: n,
      date: new Date(viewYear, viewMonth + 1, n),
      isCurrentMonth: false,
    });
  }

  // Slice exactly to 5 rows (35 slots)
  const allGridDays = [...prevDays, ...currentDays, ...nextDays].slice(0, 35);

  const isSameDay = (d1?: Date | null, d2?: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isFutureDate = (d: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d.getTime() > today.getTime();
  };

  // Handle day click (strictly ignores future dates)
  const handleDayClick = (cellDate: Date) => {
    if (isFutureDate(cellDate)) return;

    if (mode === "normal") {
      if (onSelectDate) onSelectDate(cellDate);
      if (onDateChange) {
        const from = new Date(cellDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(cellDate);
        to.setHours(23, 59, 59, 999);
        onDateChange({
          from: from.toISOString(),
          to: to.toISOString(),
          label: cellDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          mode: "daily",
        });
      }
      setRangeStartInternal(cellDate);
      setRangeEndInternal(cellDate);
      setSelectingStart(null);
    } else if (mode === "range" || mode === "compare") {
      if (!selectingStart) {
        setSelectingStart(cellDate);
        setRangeStartInternal(cellDate);
        setRangeEndInternal(null);
      } else {
        const start = selectingStart < cellDate ? selectingStart : cellDate;
        const end = selectingStart < cellDate ? cellDate : selectingStart;
        setRangeStartInternal(start);
        setRangeEndInternal(end);
        setSelectingStart(null);

        if (onSelectRange) {
          onSelectRange(start, end);
        }

        if (onDateChange) {
          const from = new Date(start);
          from.setHours(0, 0, 0, 0);
          const to = new Date(end);
          to.setHours(23, 59, 59, 999);
          const startLabel = start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const endLabel = end.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          onDateChange({
            from: from.toISOString(),
            to: to.toISOString(),
            label: `${startLabel} - ${endLabel}`,
            mode: "range",
          });
        }
      }
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const now = new Date();
    if (
      viewYear > now.getFullYear() ||
      (viewYear === now.getFullYear() && monthIndex > now.getMonth())
    ) {
      return;
    }

    const from = new Date(viewYear, monthIndex, 1, 0, 0, 0, 0);
    const to = new Date(viewYear, monthIndex + 1, 0, 23, 59, 59, 999);
    const monthLabel = from.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (onDateChange) {
      onDateChange({
        from: from.toISOString(),
        to: to.toISOString(),
        label: monthLabel,
        mode: "monthly",
      });
    }

    setViewMonth(monthIndex);
  };

  const MONTHS_LIST = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Derive the active label (e.g., "Today", "Yesterday", "Nov 9", "Oct 26 - Nov 9", "Last 7 Days")
  const activeLabel = useMemo(() => {
    if (selectedLabel) return selectedLabel;
    if (currentWindow?.label) return currentWindow.label;
    if (selectedPreset) {
      if (selectedPreset === "today") return "Today";
      if (selectedPreset === "yesterday") return "Yesterday";
      if (selectedPreset === "7d") return "Last 7 Days";
      if (selectedPreset === "30d") return "Last 30 Days";
      return selectedPreset;
    }
    if (
      rangeStartInternal &&
      rangeEndInternal &&
      !isSameDay(rangeStartInternal, rangeEndInternal)
    ) {
      const s = rangeStartInternal.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const e = rangeEndInternal.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${s} - ${e}`;
    }
    const d = selectedDate || baseDate;
    if (d) {
      const today = new Date();
      if (isSameDay(d, today)) return "Today";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return "Today";
  }, [
    selectedLabel,
    currentWindow,
    selectedPreset,
    rangeStartInternal,
    rangeEndInternal,
    selectedDate,
    baseDate,
  ]);

  return (
    <div
      className={`w-full select-none font-sans bg-white border border-slate-200/90 rounded-2xl shadow-xs p-2.5 flex flex-col justify-between space-y-2 ${className}`}
    >
      {/* ============================================================ */}
      {/* 1. TOP TABS: [Hourly] [Daily] [Monthly] & [Active Badge] & Mini Today Icon */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-100">
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
          {/* Hourly Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("hourly");
              if (onViewTabChange) onViewTabChange("hourly");
            }}
            className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "hourly"
                ? "bg-white text-[#1455bb] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hourly
          </button>

          {/* Daily Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("daily");
              if (onViewTabChange) onViewTabChange("daily");
            }}
            className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "daily"
                ? "bg-white text-[#1455bb] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Daily
          </button>

          {/* Monthly Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("monthly");
              if (onViewTabChange) onViewTabChange("monthly");
            }}
            className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "monthly"
                ? "bg-white text-[#1455bb] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Selected Date Badge & Today Icon */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            title={`Selected: ${activeLabel}`}
            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1455bb] border border-blue-200/80 shadow-2xs truncate max-w-[80px]"
          >
            {activeLabel}
          </span>

          {/* Mini Calendar Day Icon */}
          <div
            className="w-5 h-5 rounded-md border border-slate-200 bg-white flex flex-col overflow-hidden shadow-2xs shrink-0"
            title={`Today: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          >
            <div className="bg-[#1455bb] h-[4px] w-full" />
            <span className="text-[8px] font-black leading-tight text-slate-800 text-center my-auto">
              {new Date().getDate()}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN CALENDAR FRAME                                       */}
      {/* ============================================================ */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-1.5 shadow-2xs flex flex-col justify-between">
        {activeTab !== "monthly" ? (
          <>
            {/* Days of week header: M T W T F S S */}
            <div className="flex items-center text-center font-bold text-[10px] text-slate-400 pb-1 mb-1 border-b border-slate-200/60 leading-none">
              <span className="w-[24px] shrink-0" />
              <div className="grid grid-cols-7 flex-1 gap-1 text-center font-bold text-[10px]">
                <span className="text-slate-500">M</span>
                <span className="text-slate-500">T</span>
                <span className="text-slate-500">W</span>
                <span className="text-slate-500">T</span>
                <span className="text-slate-500">F</span>
                <span className="text-rose-500 font-extrabold">S</span>
                <span className="text-rose-500 font-extrabold">S</span>
              </div>
              <span className="w-[24px] shrink-0" />
            </div>

            {/* Calendar Rows with left and right month indicators */}
            <div className="flex items-center flex-1 my-0.5">
              {/* Left Month Label (e.g. 'oct') */}
              <div className="w-[24px] shrink-0 text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-0.5 leading-none select-none">
                {prevMonthName}
              </div>

              {/* 5 Rows x 7 Columns Day Tiles */}
              <div className="grid grid-cols-7 gap-1 flex-1">
                {allGridDays.map((item, index) => {
                  const isFuture = isFutureDate(item.date);
                  const isSelected =
                    !isFuture && isSameDay(item.date, baseDate);
                  const isWeekend = index % 7 === 5 || index % 7 === 6;

                  const isLeadingEmpty =
                    index < (prevDays.length > 0 ? 0 : startDayOfWeek);

                  if (isLeadingEmpty) {
                    return <div key={index} className="h-[20px] w-full" />;
                  }

                  let inRange = false;
                  if (!isFuture) {
                    if (rangeStartInternal && rangeEndInternal) {
                      inRange =
                        item.date >= rangeStartInternal &&
                        item.date <= rangeEndInternal;
                    } else if (rangeStartInternal && selectingStart) {
                      const start =
                        rangeStartInternal < selectingStart
                          ? rangeStartInternal
                          : selectingStart;
                      const end =
                        rangeStartInternal < selectingStart
                          ? selectingStart
                          : rangeStartInternal;
                      inRange = item.date >= start && item.date <= end;
                    }
                  }

                  return (
                    <button
                      key={`${item.date.toISOString()}-${index}`}
                      type="button"
                      disabled={isFuture}
                      onClick={() => !isFuture && handleDayClick(item.date)}
                      title={
                        isFuture
                          ? "Future date - no data available"
                          : item.date.toDateString()
                      }
                      className={`h-[20px] w-full flex items-center justify-center text-[10.5px] leading-none rounded-md transition-all select-none ${
                        isFuture
                          ? "text-slate-300 opacity-35 cursor-not-allowed font-normal"
                          : isSelected
                            ? "bg-gradient-to-r from-[#1455bb] to-blue-600 text-white font-black shadow-xs ring-2 ring-blue-300/40 cursor-pointer scale-[1.05]"
                            : inRange
                              ? "bg-blue-100 text-[#1455bb] font-bold cursor-pointer"
                              : isWeekend
                                ? "bg-white text-rose-500 font-semibold border border-slate-200/80 hover:bg-rose-50 hover:border-rose-300 shadow-2xs cursor-pointer"
                                : "bg-white text-slate-700 font-medium border border-slate-200/80 hover:bg-blue-50/50 hover:text-[#1455bb] hover:border-blue-300 shadow-2xs cursor-pointer"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Right Month Label (e.g. 'nov') */}
              <div className="w-[24px] shrink-0 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right pr-0.5 self-end pb-0.5 leading-none select-none">
                {currentMonthName}
              </div>
            </div>
          </>
        ) : (
          /* Monthly Grid View */
          <div className="space-y-1.5 h-full flex flex-col justify-between py-1">
            <div className="text-center font-bold text-[11px] text-[#1455bb] pb-1 border-b border-slate-200/80 uppercase tracking-wider">
              Year {viewYear}
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1 py-0.5">
              {MONTHS_LIST.map((mName, mIdx) => {
                const isCurrentMonth = mIdx === viewMonth;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleMonthSelect(mIdx)}
                    className={`py-1.5 text-[10.5px] font-bold rounded-md border transition-all text-center cursor-pointer ${
                      isCurrentMonth
                        ? "bg-gradient-to-r from-[#1455bb] to-blue-600 text-white border-[#1455bb] shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-[#1455bb] hover:bg-blue-50/40 shadow-2xs"
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM MODE TRAY: [ normal ] [ range ] [ compare ]       */}
      {/* ============================================================ */}
      <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 flex gap-1">
        <button
          type="button"
          onClick={() => {
            setMode("normal");
            if (onSelectionModeChange) onSelectionModeChange("normal");
            setSelectingStart(null);
          }}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
            mode === "normal"
              ? "bg-white text-emerald-700 font-black shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          normal
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("range");
            if (onSelectionModeChange) onSelectionModeChange("range");
            setSelectingStart(null);
          }}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
            mode === "range"
              ? "bg-white text-[#1455bb] font-black shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          range
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("compare");
            if (onSelectionModeChange) onSelectionModeChange("compare");
            setSelectingStart(null);
          }}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
            mode === "compare"
              ? "bg-white text-purple-700 font-black shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          compare
        </button>
      </div>

      {/* Show new and lost referrers checkbox (if needed) */}
      {onToggleNewAndLost && (
        <label className="flex items-center gap-1.5 pt-0.5 text-[10.5px] text-slate-700 font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showNewAndLost}
            onChange={(e) => onToggleNewAndLost(e.target.checked)}
            className="rounded-xs text-[#1455bb] focus:ring-0 cursor-pointer h-3 w-3"
          />
          <span>Show new and lost referrers</span>
        </label>
      )}
    </div>
  );
};
