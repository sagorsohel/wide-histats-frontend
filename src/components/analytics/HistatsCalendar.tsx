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
      className={`w-[291px] min-w-[291px] max-w-[291px] h-[177px] select-none font-sans shrink-0 flex flex-col justify-between ${className}`}
    >
      {/* ============================================================ */}
      {/* 1. TOP TABS: [Hourly] [Daily] [Monthly] [Active Badge] & Mini 17 Icon */}
      {/* ============================================================ */}
      <div className="flex items-end justify-between px-0.5">
        <div className="flex items-end min-w-0">
          {/* Hourly Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("hourly");
              if (onViewTabChange) onViewTabChange("hourly");
            }}
            className={`px-2.5 py-[2px] text-[11px] rounded-t-[3px] border-t border-x transition-colors cursor-pointer ${
              activeTab === "hourly"
                ? "bg-white border-[#9da8b2] text-[#1565c0] font-bold -mb-[1px] z-10"
                : "bg-[#bcc6cf] border-[#9da8b2] text-[#222] font-normal hover:bg-[#aab6c0]"
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
            className={`px-2.5 py-[2px] text-[11px] rounded-t-[3px] border-t border-x transition-colors cursor-pointer ml-[2px] ${
              activeTab === "daily"
                ? "bg-white border-[#9da8b2] text-[#1565c0] font-bold -mb-[1px] z-10"
                : "bg-[#bcc6cf] border-[#9da8b2] text-[#222] font-normal hover:bg-[#aab6c0]"
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
            className={`px-2.5 py-[2px] text-[11px] rounded-t-[3px] border-t border-x transition-colors cursor-pointer ml-[2px] ${
              activeTab === "monthly"
                ? "bg-white border-[#9da8b2] text-[#1565c0] font-bold -mb-[1px] z-10"
                : "bg-[#bcc6cf] border-[#9da8b2] text-[#222] font-normal hover:bg-[#aab6c0]"
            }`}
          >
            Monthly
          </button>

          {/* Selected Date / Active Window Badge right next to Monthly */}
          <span
            title={`Selected: ${activeLabel}`}
            className="ml-2 px-2.5 py-[4px] text-[11px] rounded-t-[3px] border-t border-x transition-colors cursor-pointer  bg-blue-100/90 border border-blue-200 text-[#1455bb] text-[10px] font-black tracking-tight truncate max-w-[105px] shadow-2xs select-none leading-none inline-block"
          >
            {activeLabel}
          </span>
        </div>

        {/* Far Right: Mini 17 Calendar Icon */}
        <div className="pb-[2px] shrink-0 ml-1">
          <div
            className="w-[15px] h-[15px] border border-[#888] bg-white rounded-[1px] flex flex-col overflow-hidden shadow-2xs"
            title="Current date"
          >
            <div className="bg-[#cc0000] h-[4px] w-full" />
            <span className="text-[7.5px] font-black leading-none text-black text-center mt-[1px]">
              17
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN CALENDAR FRAME (Exact 291x155 Frame)                 */}
      {/* ============================================================ */}
      <div className="w-[291px] h-[155px] bg-white border border-[#9da8b2] rounded-tr-[3px] rounded-b-[3px] px-[6px] py-[4px] shadow-xs flex flex-col justify-between">
        {activeTab !== "monthly" ? (
          <>
            {/* Days of week header: M T W T F S S */}
            <div className="flex items-center text-center font-black text-[12px] text-black leading-none">
              <span className="w-[28px] shrink-0" />
              <div className="grid grid-cols-7 flex-1 gap-[2px] text-center font-black text-[12px] text-black">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
              <span className="w-[28px] shrink-0" />
            </div>

            {/* Calendar Rows with 'oct' on left and 'nov' on right */}
            <div className="flex items-center flex-1 my-[1px]">
              {/* Left Month Label (e.g. 'oct') */}
              <div className="w-[28px] shrink-0 text-[11px] text-[#555] font-normal pl-0.5 leading-none">
                {prevMonthName}
              </div>

              {/* 5 Rows x 7 Columns Day Tiles */}
              <div className="grid grid-cols-7 gap-[2px] flex-1">
                {allGridDays.map((item, index) => {
                  const isFuture = isFutureDate(item.date);
                  const isSelected =
                    !isFuture && isSameDay(item.date, baseDate);
                  const isWeekend = index % 7 === 5 || index % 7 === 6; // Saturday (5) or Sunday (6)

                  // First row empty slot before trailing days
                  const isLeadingEmpty =
                    index < (prevDays.length > 0 ? 0 : startDayOfWeek);

                  if (isLeadingEmpty) {
                    return <div key={index} className="h-[18px] w-full" />;
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
                        isFuture ? "Future date - no data available" : undefined
                      }
                      className={`h-[18px] w-full flex items-center justify-center text-[11px] leading-none rounded-[1px] border select-none transition-all ${
                        isFuture
                          ? "border-[#eaedf1] bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed opacity-40 font-normal"
                          : isSelected
                            ? "bg-[#d2d9e0] border-[#8f9ca8] text-[#0066cc] font-black shadow-inner cursor-pointer"
                            : inRange
                              ? "bg-[#e3f2fd] border-[#90caf9] text-[#0066cc] font-bold cursor-pointer"
                              : isWeekend
                                ? "border-[#cfd6dc] bg-[#fbfcfd] text-[#cc0000] font-normal shadow-[inset_0_1px_0_rgba(255,255,255,1)] hover:border-[#1565c0] cursor-pointer"
                                : "border-[#cfd6dc] bg-[#fbfcfd] text-[#222] font-normal shadow-[inset_0_1px_0_rgba(255,255,255,1)] hover:border-[#1565c0] cursor-pointer"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Right Month Label (e.g. 'nov') */}
              <div className="w-[28px] shrink-0 text-[11px] text-[#555] font-normal text-right pr-0.5 self-end pb-0.5 leading-none">
                {currentMonthName}
              </div>
            </div>

            {/* ============================================================ */}
            {/* 3. BOTTOM MODE TRAY: [ normal ] [ range ] [ compare ]       */}
            {/* ============================================================ */}
            <div className="bg-[#bcc6cf] p-[2.5px] rounded-[2px] border border-[#9da8b2] flex gap-[3px]">
              <button
                type="button"
                onClick={() => {
                  setMode("normal");
                  if (onSelectionModeChange) onSelectionModeChange("normal");
                  setSelectingStart(null);
                }}
                className={`flex-1 py-[1.5px] rounded-[1px] text-[11px] text-center cursor-pointer transition-all ${
                  mode === "normal"
                    ? "bg-gradient-to-b from-[#ffffff] to-[#e8ecef] border border-[#8f9ca8] text-[#008000] font-bold shadow-xs"
                    : "bg-gradient-to-b from-[#dce2e6] to-[#cfd6dc] border border-[#a6b2bd] text-[#222] font-normal hover:bg-white/60"
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
                className={`flex-1 py-[1.5px] rounded-[1px] text-[11px] text-center cursor-pointer transition-all ${
                  mode === "range"
                    ? "bg-gradient-to-b from-[#ffffff] to-[#e8ecef] border border-[#8f9ca8] text-[#008000] font-bold shadow-xs"
                    : "bg-gradient-to-b from-[#dce2e6] to-[#cfd6dc] border border-[#a6b2bd] text-[#222] font-normal hover:bg-white/60"
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
                className={`flex-1 py-[1.5px] rounded-[1px] text-[11px] text-center cursor-pointer transition-all ${
                  mode === "compare"
                    ? "bg-gradient-to-b from-[#ffffff] to-[#e8ecef] border border-[#8f9ca8] text-[#008000] font-bold shadow-xs"
                    : "bg-gradient-to-b from-[#dce2e6] to-[#cfd6dc] border border-[#a6b2bd] text-[#222] font-normal hover:bg-white/60"
                }`}
              >
                compare
              </button>
            </div>
          </>
        ) : (
          /* Monthly Grid View */
          <div className="space-y-1 h-full flex flex-col justify-between py-0.5">
            <div className="text-center font-bold text-[11px] text-slate-800 pb-0.5 border-b border-slate-200">
              Year {viewYear}
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1 py-1">
              {MONTHS_LIST.map((mName, mIdx) => {
                const isCurrentMonth = mIdx === viewMonth;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleMonthSelect(mIdx)}
                    className={`py-1 text-[10px] font-bold rounded-[1px] border transition-all text-center cursor-pointer ${
                      isCurrentMonth
                        ? "bg-[#d2d9e0] border-[#8f9ca8] text-[#0066cc]"
                        : "border-[#cfd6dc] bg-[#fbfcfd] text-[#222] hover:border-blue-400"
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

      {/* Show new and lost referrers checkbox (if needed) */}
      {onToggleNewAndLost && (
        <label className="flex items-center gap-1.5 pt-1 text-[10.5px] text-slate-700 font-medium cursor-pointer select-none">
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
