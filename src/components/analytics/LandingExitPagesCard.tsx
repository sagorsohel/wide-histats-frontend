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
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header with Segmented Pill Controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border transition-colors ${
                activeTab === "landing"
                  ? "bg-emerald-50/90 text-emerald-600 border-emerald-100/80"
                  : "bg-rose-50/90 text-rose-600 border-rose-100/80"
              }`}
            >
              {activeTab === "landing" ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                {activeTab === "landing"
                  ? "Top Landing Pages (Entry Points)"
                  : "Top Exit Pages (Drop-off Points)"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === "landing"
                  ? "Where first-time & returning visitors enter your site"
                  : "Last visited pages before visitors leave or bounce"}
              </p>
            </div>
          </div>

          {/* Apple Segmented Pill Switcher */}
          <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/50 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("landing")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "landing"
                  ? "bg-white text-emerald-700 shadow-sm shadow-slate-200/70"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Landing</span>
            </button>
            <button
              onClick={() => setActiveTab("exit")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "exit"
                  ? "bg-white text-rose-700 shadow-sm shadow-slate-200/70"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-200 rounded-md shrink-0" />
                    <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-10 bg-slate-200 rounded" />
                    <div className="h-3.5 w-8 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1" />
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No {activeTab} page data recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {currentList.slice(0, 6).map((item, index) => {
              const sessionsCount = item.sessions || item.pageviews || 0;
              const percentage = Math.round((sessionsCount / totalSessions) * 100);

              const gradientClass =
                activeTab === "landing"
                  ? "from-emerald-600 to-teal-400"
                  : "from-rose-500 to-amber-400";

              return (
                <div key={index} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Favicon + Page Path */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-md bg-white border border-slate-200/60 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
                        <WebsiteFavicon domain={domain} size={14} />
                      </div>

                      <a
                        href={domain ? `https://${domain}${item.path}` : item.path}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-800 truncate block group-hover:text-blue-600 transition-colors"
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
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {formatNumber(sessionsCount)}
                      </span>
                      <span className="text-slate-400 font-semibold w-8 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${gradientClass} h-full rounded-full transition-all duration-500 shadow-xs`}
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
      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
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
