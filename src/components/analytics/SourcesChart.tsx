"use client";

import React from "react";
import { SourceStat } from "@/types/analytics";
import { Compass, Search, Share2, Link as LinkIcon, Mail } from "lucide-react";

interface SourcesChartProps {
  sources: SourceStat[];
  loading?: boolean;
}

export const SourcesChart: React.FC<SourcesChartProps> = ({
  sources,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-80 flex items-center justify-center text-muted-foreground text-sm">
        Loading sources...
      </div>
    );
  }

  const totalSessions = sources.reduce((sum, s) => sum + s.sessions, 0) || 1;

  const getSourceIcon = (source: string, medium: string) => {
    if (medium === "organic" || source.includes("google") || source.includes("bing")) {
      return <Search className="w-4 h-4 text-emerald-400" />;
    }
    if (
      medium === "social" ||
      source.includes("facebook") ||
      source.includes("twitter") ||
      source.includes("linkedin")
    ) {
      return <Share2 className="w-4 h-4 text-cyan-400" />;
    }
    if (medium === "email") {
      return <Mail className="w-4 h-4 text-amber-400" />;
    }
    if (source === "direct") {
      return <Compass className="w-4 h-4 text-indigo-400" />;
    }
    return <LinkIcon className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Traffic Sources</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Channels and referrers driving visitors
          </p>
        </div>
      </div>

      {sources.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No traffic source data available.
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((item, index) => {
            const percentage = Math.round((item.sessions / totalSessions) * 100);

            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(item.source, item.medium)}
                    <span className="font-semibold text-slate-800 capitalize">
                      {item.source}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.medium}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.sessions}</span>
                    <span className="text-slate-500 text-[11px] w-9 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1d5b9f] to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
