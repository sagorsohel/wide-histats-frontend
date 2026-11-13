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
      className={`w-[260px] max-w-[260px] flex flex-col justify-between select-none font-sans text-xs ${className}`}
    >
      {/* ============================================================ */}
      {/* 1. TOP TABS: Exact Histats Style Tabs (h-[20px])              */}
      {/* ============================================================ */}
      <div className="flex items-end justify-between px-1 h-[20px] shrink-0">
        <div className="flex items-end gap-[3px]">
          {/* Hourly Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("hourly");
              if (onViewTabChange) onViewTabChange("hourly");
            }}
            className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-t-[3px] border-t border-l border-r transition-none cursor-pointer leading-none ${
              activeTab === "hourly"
                ? "bg-[#f6f6f6] text-[#0055aa] border-[#b0b0b0] relative z-10 -mb-[1px] pb-[4px] font-bold"
                : "bg-[#c5c5c5] text-[#333333] border-[#a0a0a0] hover:bg-[#d0d0d0]"
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
            className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-t-[3px] border-t border-l border-r transition-none cursor-pointer leading-none ${
              activeTab === "daily"
                ? "bg-[#f6f6f6] text-[#0055aa] border-[#b0b0b0] relative z-10 -mb-[1px] pb-[4px] font-bold"
                : "bg-[#c5c5c5] text-[#333333] border-[#a0a0a0] hover:bg-[#d0d0d0]"
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
            className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-t-[3px] border-t border-l border-r transition-none cursor-pointer leading-none ${
              activeTab === "monthly"
                ? "bg-[#f6f6f6] text-[#0055aa] border-[#b0b0b0] relative z-10 -mb-[1px] pb-[4px] font-bold"
                : "bg-[#c5c5c5] text-[#333333] border-[#a0a0a0] hover:bg-[#d0d0d0]"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Mini Calendar Icon on top right */}
        <div
          className="w-[15px] h-[14px] bg-white border border-[#a0a0a0] rounded-[1px] flex flex-col overflow-hidden shadow-2xs mb-0.5"
          title={`Today: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        >
          <div className="bg-[#cc3300] h-[3.5px] w-full" />
          <span className="text-[8px] font-bold text-[#333333] text-center leading-none my-auto">
            {new Date().getDate()}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN CALENDAR FRAME: Exact Histats Box                     */}
      {/* ============================================================ */}
      <div className="bg-[#f6f6f6] border border-[#b0b0b0] rounded-b-[2px] rounded-tr-[2px] p-1.5 shadow-2xs flex flex-col justify-between shrink-0">
        {activeTab !== "monthly" ? (
          <>
            {/* Days of week header: M T W T F S S */}
            <div className="flex items-center text-center font-bold text-[10.5px] leading-none pb-1">
              <span className="w-[16px] shrink-0" />
              <div className="grid grid-cols-7 flex-1 gap-1 text-center font-black text-[11px] text-black">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
              <span className="w-[16px] shrink-0" />
            </div>

            {/* Calendar Rows with left and right month indicators */}
            <div className="flex items-center flex-1 my-0.5">
              {/* Left Month Label (e.g. 'oct') */}
              <div className="w-[16px] shrink-0 text-[10px] text-[#666666] font-normal lowercase tracking-tight pl-0.5 leading-none select-none">
                {prevMonthName?.slice(0, 3)}
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

                  // Do not show dates that have not arrived yet (future dates) or leading empty days
                  if (isLeadingEmpty || isFuture) {
                    return (
                      <div
                        key={`${item.date.toISOString()}-${index}`}
                        className="h-[15px] w-full"
                      />
                    );
                  }

                  let inRange = false;
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

                  return (
                    <button
                      key={`${item.date.toISOString()}-${index}`}
                      type="button"
                      onClick={() => handleDayClick(item.date)}
                      title={item.date.toDateString()}
                      className={`h-[15px] w-full flex items-center justify-center text-[10.5px] leading-none rounded-[1.5px] transition-none select-none border cursor-pointer ${
                        isSelected
                          ? "bg-[#dedede] text-[#0066cc] font-bold border-[#999999] shadow-inner"
                          : inRange
                            ? "bg-[#e8f0fe] text-[#0055aa] font-bold border-[#90b8f0]"
                            : isWeekend
                              ? "bg-white text-[#cc0000] font-medium border-[#c8c8c8] hover:bg-[#fff0f0]"
                              : "bg-white text-[#444444] font-medium border-[#c8c8c8] hover:bg-[#eef3fb]"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Right Month Label (e.g. 'nov') */}
              <div className="w-[16px] shrink-0 text-[10px] text-[#666666] font-normal lowercase tracking-tight text-right pr-0.5 self-end leading-none select-none">
                {currentMonthName?.slice(0, 3)}
              </div>
            </div>
          </>
        ) : (
          /* Monthly Grid View */
          <div className="space-y-1 py-1 my-auto">
            <div className="text-center font-bold text-[10px] text-[#0055aa] pb-0.5 border-b border-[#d0d0d0] uppercase tracking-wider leading-none">
              Year {viewYear}
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1 py-1">
              {MONTHS_LIST.map((mName, mIdx) => {
                const now = new Date();
                const isFutureMonth =
                  viewYear > now.getFullYear() ||
                  (viewYear === now.getFullYear() && mIdx > now.getMonth());

                if (isFutureMonth) {
                  return <div key={mName} className="h-[18px] w-full" />;
                }

                const isCurrentMonth = mIdx === viewMonth;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleMonthSelect(mIdx)}
                    className={`py-1 text-[9.5px] font-bold rounded-[2px] border transition-none text-center cursor-pointer leading-tight ${
                      isCurrentMonth
                        ? "bg-[#dedede] text-[#0066cc] border-[#999999] shadow-inner"
                        : "border-[#c8c8c8] bg-white text-[#444444] hover:bg-[#eef3fb] hover:text-[#0055aa]"
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. BOTTOM MODE TRAY: [ normal ] [ range ] [ compare ]       */}
        {/* ============================================================ */}
        <div className="flex gap-1.5 h-[19px] shrink-0 items-center pt-0.5">
          <button
            type="button"
            onClick={() => {
              setMode("normal");
              if (onSelectionModeChange) onSelectionModeChange("normal");
              setSelectingStart(null);
            }}
            className={`flex-1 h-[18px] py-0.5 rounded-[2px] text-[10px] text-center transition-none cursor-pointer border leading-none bg-gradient-to-b from-[#ffffff] to-[#e6e6e6] shadow-2xs ${
              mode === "normal"
                ? "text-[#008800] font-bold border-[#888888]"
                : "text-[#444444] font-normal border-[#aaaaaa] hover:border-[#888888]"
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
            className={`flex-1 h-[18px] py-0.5 rounded-[2px] text-[10px] text-center transition-none cursor-pointer border leading-none bg-gradient-to-b from-[#ffffff] to-[#e6e6e6] shadow-2xs ${
              mode === "range"
                ? "text-[#0055aa] font-bold border-[#888888]"
                : "text-[#444444] font-normal border-[#aaaaaa] hover:border-[#888888]"
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
            className={`flex-1 h-[18px] py-0.5 rounded-[2px] text-[10px] text-center transition-none cursor-pointer border leading-none bg-gradient-to-b from-[#ffffff] to-[#e6e6e6] shadow-2xs ${
              mode === "compare"
                ? "text-[#660099] font-bold border-[#888888]"
                : "text-[#444444] font-normal border-[#aaaaaa] hover:border-[#888888]"
            }`}
          >
            compare
          </button>
        </div>
      </div>
    </div>
  );
};
