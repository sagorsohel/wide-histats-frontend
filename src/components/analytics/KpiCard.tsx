"use client";

import React from "react";
import { LucideIcon, MoreVertical } from "lucide-react";

export type KpiVariant =
  | "purple"
  | "blue"
  | "orange"
  | "amber"
  | "pink"
  | "rose"
  | "green"
  | "emerald";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    positive?: boolean;
  };
  variant?: KpiVariant;
  highlight?: boolean;
  loading?: boolean;
  countBadge?: number | string;
  avatars?: string[];
  className?: string;
}

// High-resolution clean avatars matching modern collaboration dashboards
const defaultAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
];

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  variant = "blue",
  loading = false,
  countBadge = 2,
  avatars,
  className = "",
}) => {
  const avatarList = avatars && avatars.length > 0 ? avatars : defaultAvatars;

  // Vibrant gradient configurations matching reference design
  const config = {
    purple: {
      bg: "bg-gradient-to-r from-[#9461fd] via-[#8555f8] to-[#733cf5]",
      darkBand: "bg-[#5b21b6]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(115,60,245,0.35)]",
    },
    blue: {
      bg: "bg-gradient-to-r from-[#448df9] via-[#2f7bf6] to-[#1c64f2]",
      darkBand: "bg-[#1e40af]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(28,100,242,0.35)]",
    },
    orange: {
      bg: "bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#f97316]",
      darkBand: "bg-[#c2410c]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(249,115,22,0.35)]",
    },
    amber: {
      bg: "bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#f97316]",
      darkBand: "bg-[#c2410c]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(249,115,22,0.35)]",
    },
    pink: {
      bg: "bg-gradient-to-r from-[#f472b6] via-[#ec4899] to-[#f43f5e]",
      darkBand: "bg-[#be123c]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(244,63,94,0.35)]",
    },
    rose: {
      bg: "bg-gradient-to-r from-[#f472b6] via-[#ec4899] to-[#f43f5e]",
      darkBand: "bg-[#be123c]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(244,63,94,0.35)]",
    },
    green: {
      bg: "bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#059669]",
      darkBand: "bg-[#065f46]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(16,185,129,0.35)]",
    },
    emerald: {
      bg: "bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#059669]",
      darkBand: "bg-[#065f46]/60",
      shadow: "shadow-[0_12px_28px_-6px_rgba(16,185,129,0.35)]",
    },
  }[variant];

  return (
    <div
      className={`rounded-[22px] ${config.bg} ${config.shadow} text-white relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group select-none ${className}`}
    >
      {/* Upper Content Section */}
      <div className="p-4 sm:p-5 pb-3">
        {/* 1. Top Row: Avatars & Count Badge on left, Three Dots Menu on right */}

        {/* 2. Middle: Title & Value */}
        <div className="mt-3.5 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
              {title}
            </h3>

            {/* Percentage Pill Badge */}
            {!loading && badge && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white shadow-2xs shrink-0">
                {badge.positive !== false ? "↗" : "↘"} {badge.text}
              </span>
            )}
          </div>

          {/* Main Stat Value */}
          <div className="pt-0.5">
            {loading ? (
              <div className="h-7 w-20 bg-white/30 rounded-lg animate-pulse my-1" />
            ) : (
              <span className="text-2xl  font-black text-white tracking-tight tabular-nums block">
                {value}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-[11px] text-white/80 font-medium truncate pt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 3. Bottom Accent Band (Signature Style from Reference Design) */}
      <div className="h-3 w-full bg-black/15 flex items-stretch mt-2">
        <div className={`w-24 sm:w-28 ${config.darkBand} rounded-r-md`} />
      </div>
    </div>
  );
};
