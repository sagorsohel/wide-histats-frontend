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
  const totalSessions = sources.reduce((sum, s) => sum + s.sessions, 0) || 1;

  return (
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100/80">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50/90 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Traffic Sources
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Channels and referrers driving visitors
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded" />
                    <div className="h-3.5 w-32 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-100 rounded-full" />
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
        ) : sources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No traffic source data available.
          </div>
        ) : (
          <div className="space-y-3.5">
            {sources.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.sessions / totalSessions) * 100);

              return (
                <div key={index} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Real Favicon + Source Domain Name + Medium Badge */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                        <WebsiteFavicon
                          domain={item.source}
                          size={15}
                          className="rounded-xs shadow-2xs"
                        />
                      </div>
                      <span className="font-bold text-slate-800 truncate block group-hover:text-blue-600 transition-colors">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full font-medium shrink-0 border border-slate-200/50">
                        {item.medium || "referral"}
                      </span>
                    </div>

                    {/* Right: Count + Percentage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {item.sessions.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-semibold w-8 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Thin Cyan/Blue Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
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
