"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    positive?: boolean;
  };
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  highlight = false,
}) => {
  return (
    <div
      className={`bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden transition-all duration-200 hover:border-[#1d5b9f]/50 ${
        highlight
          ? "ring-1 ring-[#1d5b9f]/30 bg-gradient-to-b from-blue-50/40 to-white"
          : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            highlight
              ? "bg-blue-100 text-[#1d5b9f] border border-blue-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              badge.positive
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-rose-100 text-rose-800 border border-rose-300"
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
};
