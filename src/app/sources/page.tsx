"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { SourcesData } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import { Compass, Search, Share2, Link as LinkIcon, Target } from "lucide-react";

export default function SourcesPage() {
  const { selectedWebsite } = useWebsite();
  const [range, setRange] = useState<RangeOption>("7d");
  const [data, setData] = useState<SourcesData | null>(null);
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback((option: RangeOption) => {
    const now = new Date();
    let from = new Date();
    if (option === "today") from.setHours(0, 0, 0, 0);
    else if (option === "yesterday") {
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
    } else if (option === "7d") from.setDate(from.getDate() - 7);
    else if (option === "30d") from.setDate(from.getDate() - 30);

    return { from: from.toISOString(), to: now.toISOString() };
  }, []);

  const loadSources = useCallback(async () => {
    if (!selectedWebsite) return;
    setLoading(true);
    const { from, to } = getDateRange(range);
    const q = `websiteId=${selectedWebsite.id}&from=${from}&to=${to}&limit=50`;

    try {
      const res = await api.get<SourcesData>(`/api/v1/analytics/sources?${q}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite, range, getDateRange]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const totalSessions =
    data?.sources.reduce((sum, s) => sum + s.sessions, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Traffic Sources & Attribution
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Where your visitors originated: Organic Search, Social, Referrals, and Campaigns
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

      {/* Main Channels Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="font-bold text-base text-slate-900 mb-4">Traffic Channels</h3>

        {!data?.sources || data.sources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No source records found for this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sources.map((s, idx) => {
              const percentage = Math.round((s.sessions / totalSessions) * 100);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-[#1d5b9f]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-sm capitalize">
                      {s.source}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#1d5b9f] border border-blue-200">
                      {s.medium}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {s.sessions}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#1d5b9f] to-blue-500 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Breakdown: Referring Domains & UTM Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referring Domains */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-4 h-4 text-[#1d5b9f]" />
            <h3 className="font-bold text-base text-slate-900">Referring Domains</h3>
          </div>

          {!data?.referrers || data.referrers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No external referrer URLs.
            </div>
          ) : (
            <div className="space-y-2">
              {data.referrers.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-slate-700 truncate font-mono max-w-[280px]">
                    {r.referrer}
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UTM Campaigns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">UTM Campaigns</h3>
          </div>

          {!data?.campaigns || data.campaigns.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No active UTM campaigns detected in this window. Add <code className="px-1 text-[#1d5b9f] font-mono bg-blue-50 rounded">?utm_campaign=...</code> to your marketing links.
            </div>
          ) : (
            <div className="space-y-2">
              {data.campaigns.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-emerald-700 font-semibold truncate">
                    {c.campaign}
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">{c.sessions} visits</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
