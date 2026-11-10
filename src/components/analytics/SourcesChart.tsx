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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-slate-100">
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

        {/* Content */}
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1 animate-pulse px-2.5 py-1.5 rounded-xl border border-slate-100 bg-white/50">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3 w-8 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No traffic source data available.
          </div>
        ) : (
          <div className="space-y-1.5">
            {sources.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.sessions / totalSessions) * 100);

              return (
                <div
                  key={index}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 transition-all duration-150 space-y-1 group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Real Favicon + Source Domain Name + Medium Badge */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <WebsiteFavicon
                          domain={item.source}
                          size={13}
                          className="rounded-xs shadow-2xs"
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-xs truncate block group-hover:text-blue-600 transition-colors leading-tight">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full font-medium shrink-0 border border-slate-200/50 leading-tight">
                        {item.medium || "referral"}
                      </span>
                    </div>

                    {/* Right: Count + Percentage */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-extrabold text-slate-900 text-xs tabular-nums leading-tight">
                        {item.sessions.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-semibold text-[11px] w-7 text-right tabular-nums leading-tight">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Thin Cyan/Blue Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
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
