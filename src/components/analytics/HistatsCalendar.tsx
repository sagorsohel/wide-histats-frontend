"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from "lucide-react";
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
  showNewAndLost?: boolean;
  onToggleNewAndLost?: (val: boolean) => void;
}

export const HistatsCalendar: React.FC<HistatsCalendarProps> = ({
  // Mode A
  selectedDate = new Date(),
  onSelectDate,
  viewTab = "hourly",
  onViewTabChange,
  selectionMode = "normal",
  onSelectionModeChange,
  rangeStart,
  rangeEnd,
  onSelectRange,

  // Mode B
  selectedPreset,
  onPresetChange,
  onDateChange,
  currentWindow,
  showNewAndLost = false,
  onToggleNewAndLost,
}) => {
  // Current month being viewed in calendar
  const activeDate = selectedDate || new Date();
  const [viewYear, setViewYear] = useState<number>(activeDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(activeDate.getMonth()); // 0-indexed
  const [rangeSelectingStart, setRangeSelectingStart] = useState<Date | null>(null);

  const prevMonthName = new Date(viewYear, viewMonth - 1, 1).toLocaleString("en-US", {
    month: "short",
  }).toLowerCase();

  const nextMonthName = new Date(viewYear, viewMonth + 1, 1).toLocaleString("en-US", {
    month: "short",
  }).toLowerCase();

  const currentMonthName = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", {
    month: "short",
  }).toLowerCase();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Build grid starting on Monday (M T W T F S S)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Previous month trailing days
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
  const currentDays: { day: number; date: Date; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentDays.push({
      day: d,
      date: new Date(viewYear, viewMonth, d),
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full weeks
  const totalSlots = prevDays.length + currentDays.length;
  const remainingSlots = (7 - (totalSlots % 7)) % 7;
  const nextDays: { day: number; date: Date; isCurrentMonth: boolean }[] = [];
  for (let n = 1; n <= remainingSlots; n++) {
    nextDays.push({
      day: n,
      date: new Date(viewYear, viewMonth + 1, n),
      isCurrentMonth: false,
    });
  }

  const allGridDays = [...prevDays, ...currentDays, ...nextDays];

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleDayClick = (cellDate: Date) => {
    if (onDateChange) {
      // Mode B (Sources page): single day or custom window
      const from = new Date(cellDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(cellDate);
      to.setHours(23, 59, 59, 999);
      onDateChange({
        from: from.toISOString(),
        to: to.toISOString(),
        label: cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        mode: "daily",
      });
      return;
    }

    if (selectionMode === "normal") {
      if (onSelectDate) onSelectDate(cellDate);
      if (cellDate.getMonth() !== viewMonth) {
        setViewMonth(cellDate.getMonth());
        setViewYear(cellDate.getFullYear());
      }
    } else if (selectionMode === "range" || selectionMode === "compare") {
      if (!rangeSelectingStart) {
        setRangeSelectingStart(cellDate);
      } else {
        const start = rangeSelectingStart < cellDate ? rangeSelectingStart : cellDate;
        const end = rangeSelectingStart < cellDate ? cellDate : rangeSelectingStart;
        if (onSelectRange) {
          onSelectRange(start, end);
        }
        setRangeSelectingStart(null);
      }
    }
  };

  return (
    <div className="w-full max-w-[280px] bg-white border border-[#c4d1db] rounded shadow-xs text-xs font-sans select-none shrink-0">
      {/* Top Tabs: Hourly | Daily | Monthly | [Icon] or Preset Selectors */}
      {selectedPreset !== undefined && onPresetChange ? (
        <div className="flex items-center justify-between bg-[#f0f4f8] border-b border-[#c4d1db] px-1.5 py-1">
          <div className="flex items-center gap-1">
            {(["today", "yesterday", "7d", "30d"] as RangeOption[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPresetChange(p)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold capitalize transition-all ${
                  selectedPreset === p && !currentWindow
                    ? "bg-[#1d5b9f] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {p === "today" ? "Today" : p === "yesterday" ? "Yday" : p}
              </button>
            ))}
          </div>
          <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
        </div>
      ) : (
        <div className="flex items-center justify-between bg-[#f0f4f8] border-b border-[#c4d1db] px-1 pt-1">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onViewTabChange && onViewTabChange("hourly")}
              className={`px-2.5 py-1 text-[11px] font-semibold border-t-2 transition-all ${
                viewTab === "hourly"
                  ? "bg-white border-t-[#1d5b9f] border-x border-[#c4d1db] text-[#1d5b9f] font-bold -mb-[1px] shadow-2xs"
                  : "border-t-transparent text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              Hourly
            </button>
            <button
              type="button"
              onClick={() => onViewTabChange && onViewTabChange("daily")}
              className={`px-2.5 py-1 text-[11px] font-semibold border-t-2 transition-all ${
                viewTab === "daily"
                  ? "bg-white border-t-[#1d5b9f] border-x border-[#c4d1db] text-[#1d5b9f] font-bold -mb-[1px] shadow-2xs"
                  : "border-t-transparent text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => onViewTabChange && onViewTabChange("monthly")}
              className={`px-2.5 py-1 text-[11px] font-semibold border-t-2 transition-all ${
                viewTab === "monthly"
                  ? "bg-white border-t-[#1d5b9f] border-x border-[#c4d1db] text-[#1d5b9f] font-bold -mb-[1px] shadow-2xs"
                  : "border-t-transparent text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-1 pr-1 text-slate-500">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>
      )}

      {/* Month Navigator Row */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#fbfcfd] border-b border-slate-200 text-[11px]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-0.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded"
          title={`Previous Month (${prevMonthName})`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="font-bold text-slate-800 capitalize">
          {currentMonthName} {viewYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-0.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded"
          title={`Next Month (${nextMonthName})`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Days Header: M T W T F S S */}
      <div className="grid grid-cols-7 text-center font-bold text-[11px] py-1 border-b border-slate-100 bg-slate-50/50">
        <span className="text-slate-700">M</span>
        <span className="text-slate-700">T</span>
        <span className="text-slate-700">W</span>
        <span className="text-slate-700">T</span>
        <span className="text-slate-700">F</span>
        <span className="text-[#d9534f]">S</span>
        <span className="text-[#d9534f]">S</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 p-1 gap-y-0.5 text-center text-xs">
        {allGridDays.map((item, index) => {
          const isSelected = isSameDay(item.date, activeDate);
          const isWeekend = index % 7 === 5 || index % 7 === 6; // Saturday or Sunday

          let inRange = false;
          if (rangeStart && rangeEnd) {
            inRange = item.date >= rangeStart && item.date <= rangeEnd;
          }

          return (
            <button
              key={`${item.date.toISOString()}-${index}`}
              type="button"
              onClick={() => handleDayClick(item.date)}
              className={`h-6 w-full flex items-center justify-center text-[11px] transition-all rounded-xs ${
                isSelected
                  ? "border-2 border-[#1d5b9f] text-[#1d5b9f] font-black bg-blue-50 shadow-2xs"
                  : inRange
                  ? "bg-blue-100/70 font-semibold text-blue-900"
                  : !item.isCurrentMonth
                  ? "text-slate-300 font-normal hover:bg-slate-50"
                  : isWeekend
                  ? "text-[#d9534f] font-semibold hover:bg-red-50/50"
                  : "text-slate-700 font-medium hover:bg-slate-100"
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      {/* Bottom Mode Selectors or showNewAndLost */}
      {onToggleNewAndLost ? (
        <div className="flex items-center justify-between p-1.5 bg-[#f0f4f8] border-t border-[#c4d1db] text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showNewAndLost}
              onChange={(e) => onToggleNewAndLost(e.target.checked)}
              className="rounded-xs text-[#1d5b9f] focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
            <span>Show new and lost referrers</span>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-1.5 bg-[#f0f4f8] border-t border-[#c4d1db] gap-1">
          <button
            type="button"
            onClick={() => {
              if (onSelectionModeChange) onSelectionModeChange("normal");
              setRangeSelectingStart(null);
            }}
            className={`flex-1 py-0.5 px-2 text-[11px] rounded transition-all text-center ${
              selectionMode === "normal"
                ? "bg-gradient-to-b from-[#f2f9f0] to-[#e1f0dc] text-[#2e6b27] border border-[#a3d39c] font-bold shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
            }`}
          >
            normal
          </button>

          <button
            type="button"
            onClick={() => onSelectionModeChange && onSelectionModeChange("range")}
            className={`flex-1 py-0.5 px-2 text-[11px] rounded transition-all text-center ${
              selectionMode === "range"
                ? "bg-gradient-to-b from-[#f2f9f0] to-[#e1f0dc] text-[#2e6b27] border border-[#a3d39c] font-bold shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
            }`}
          >
            range
          </button>

          <button
            type="button"
            onClick={() => onSelectionModeChange && onSelectionModeChange("compare")}
            className={`flex-1 py-0.5 px-2 text-[11px] rounded transition-all text-center ${
              selectionMode === "compare"
                ? "bg-gradient-to-b from-[#f2f9f0] to-[#e1f0dc] text-[#2e6b27] border border-[#a3d39c] font-bold shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
            }`}
          >
            compare
          </button>
        </div>
      )}
    </div>
  );
};
