"use client";

import React from "react";
import { Calendar } from "lucide-react";

export type RangeOption = "today" | "yesterday" | "7d" | "30d";

interface DateRangePickerProps {
  selectedRange: RangeOption;
  onChange: (range: RangeOption) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  onChange,
}) => {
  const options: { id: RangeOption; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
      <div className="px-2 text-slate-400 hidden sm:block">
        <Calendar className="w-3.5 h-3.5" />
      </div>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            selectedRange === opt.id
              ? "bg-[#1d5b9f] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
