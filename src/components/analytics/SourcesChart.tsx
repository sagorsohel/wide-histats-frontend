"use client";

import React from "react";
import { SourceStat } from "@/types/analytics";
import { Share2 } from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";

interface SourcesChartProps {
  sources: SourceStat[];
  loading?: boolean;
}

export const SourcesChart: React.FC<SourcesChartProps> = ({
  sources,
  loading = false,
}) => {
  const displaySources = sources;
  const totalSessions =
    displaySources.reduce((sum, s) => sum + s.sessions, 0) || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                Traffic Sources
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Channels and referrers driving visitors
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Column Header */}
        <div className="flex items-center justify-between px-3.5 py-1 mb-1.5 text-xs font-bold text-slate-700 select-none">
          <span>Sources</span>
          <div className="flex items-center gap-3 sm:gap-4 text-right">
            <span className="w-16 text-center">Medium</span>
            <span className="w-14 text-right">Visitors</span>
            <span className="w-10 text-right">Share</span>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 animate-pulse ${
                  i % 2 === 1 ? "bg-white" : "bg-[#E8E8E8]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-3 w-12 bg-slate-200 rounded" />
                  <div className="h-3 w-10 bg-slate-200 rounded" />
                  <div className="h-3 w-8 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displaySources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No traffic source data available.
          </div>
        ) : (
          <div className="space-y-1">
            {displaySources.slice(0, 6).map((item, index) => {
              const percentage = Math.round(
                (item.sessions / totalSessions) * 100,
              );
              const rawUrl = item.fullUrl || item.url || item.source;
              const isDirect =
                !rawUrl ||
                rawUrl.toLowerCase() === "direct" ||
                rawUrl.toLowerCase() === "none";
              const fullUrl = isDirect
                ? "direct"
                : rawUrl.startsWith("http")
                  ? rawUrl
                  : `https://${rawUrl}`;
              const displayUrl = fullUrl;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`rounded-xl px-3.5 py-2 flex items-center justify-between gap-2.5 transition-colors ${
                    isEven ? "bg-white" : "bg-[#E8E8E8]"
                  }`}
                >
                  {/* Left: Rank + Favicon + Full URL */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-3.5 text-center font-bold text-slate-500 text-[11px] shrink-0 font-mono">
                      {index + 1}
                    </span>
                    <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                      <WebsiteFavicon
                        url={isDirect ? undefined : fullUrl}
                        domain={item.source}
                        size={13}
                        className="rounded-xs shadow-2xs"
                      />
                    </div>
                    {!isDirect ? (
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={fullUrl}
                        className="font-bold text-slate-800 hover:text-blue-600 font-mono text-xs truncate block tracking-tight transition-colors leading-tight min-w-0 flex-1"
                      >
                        {displayUrl}
                      </a>
                    ) : (
                      <span className="font-bold text-slate-800 text-xs truncate block leading-tight min-w-0 flex-1">
                        direct
                      </span>
                    )}
                  </div>

                  {/* Right: Medium + Visitors + Share */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                    <span className="w-16 text-[10px] text-slate-600 bg-white/80 border border-slate-200/80 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-center inline-block truncate">
                      {item.medium || "referral"}
                    </span>
                    <span className="w-14 font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums text-right block">
                      {item.sessions.toLocaleString()}
                    </span>
                    <span className="w-10 font-bold text-slate-700 text-xs tabular-nums text-right block">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
