"use client";

import React, { useState } from "react";
import { LandingExitPageStat } from "@/types/analytics";
import { LogIn, LogOut, ExternalLink, Compass } from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";
import { formatNumber } from "@/lib/utils";

interface LandingExitPagesCardProps {
  landingPages: LandingExitPageStat[];
  exitPages: LandingExitPageStat[];
  domain?: string;
  loading?: boolean;
}

export const LandingExitPagesCard: React.FC<LandingExitPagesCardProps> = ({
  landingPages,
  exitPages,
  domain,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"landing" | "exit">("landing");

  const currentList = activeTab === "landing" ? landingPages : exitPages;
  const totalSessions =
    currentList.reduce((sum, p) => sum + (p.sessions || p.pageviews || 0), 0) || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header with Segmented Pill Controls */}
      <div>
        <div className="flex items-center justify-between gap-2.5 mb-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border transition-colors ${
                activeTab === "landing"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-rose-50 text-rose-600 border-rose-100"
              }`}
            >
              {activeTab === "landing" ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                {activeTab === "landing"
                  ? "Top Landing Pages"
                  : "Top Exit Pages"}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {activeTab === "landing"
                  ? "Where visitors enter your site"
                  : "Last visited pages before bounce"}
              </p>
            </div>
          </div>

          {/* Apple Segmented Pill Switcher */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/50 shrink-0">
            <button
              onClick={() => setActiveTab("landing")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                activeTab === "landing"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogIn className="w-3 h-3" />
              <span>Landing</span>
            </button>
            <button
              onClick={() => setActiveTab("exit")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                activeTab === "exit"
                  ? "bg-white text-rose-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1 animate-pulse">
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl border border-slate-100 bg-white/50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-8 bg-slate-200 rounded" />
                    <div className="h-3 w-6 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No {activeTab} page data recorded yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {currentList.slice(0, 6).map((item, index) => {
              const sessionsCount = item.sessions || item.pageviews || 0;
              const percentage = Math.round((sessionsCount / totalSessions) * 100);

              const gradientClass =
                activeTab === "landing"
                  ? "from-emerald-600 to-teal-400"
                  : "from-rose-500 to-amber-400";

              return (
                <div
                  key={index}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 transition-all duration-150 space-y-1 group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Favicon + Page Path */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-4 h-4 rounded bg-white border border-slate-200/60 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
                        <WebsiteFavicon domain={domain} size={13} />
                      </div>

                      <a
                        href={domain ? `https://${domain}${item.path}` : item.path}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-800 text-xs truncate block group-hover:text-blue-600 transition-colors leading-tight font-mono"
                      >
                        {item.path}
                      </a>

                      <a
                        href={domain ? `https://${domain}${item.path}` : item.path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Right: Sessions Count + Percentage */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-extrabold text-slate-900 text-xs tabular-nums leading-tight">
                        {formatNumber(sessionsCount)}
                      </span>
                      <span className="text-slate-400 font-semibold text-[11px] w-7 text-right tabular-nums leading-tight">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${gradientClass} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-slate-400" />
          <span>
            {activeTab === "landing" ? "Top entry channels" : "Bounce & exit points"}
          </span>
        </span>
        <span className="font-semibold text-slate-500">
          {formatNumber(totalSessions)} sessions tracked
        </span>
      </div>
    </div>
  );
};
