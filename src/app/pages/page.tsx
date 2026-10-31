"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { PageStat } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import { FileText, LogIn, LogOut } from "lucide-react";

export default function PagesReportPage() {
  const { selectedWebsite } = useWebsite();
  const [range, setRange] = useState<RangeOption>("7d");
  const [pages, setPages] = useState<PageStat[]>([]);
  const [landingPages, setLandingPages] = useState<{ path: string; sessions: number }[]>([]);
  const [exitPages, setExitPages] = useState<{ path: string; sessions: number }[]>([]);
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

  const loadPageData = useCallback(async () => {
    if (!selectedWebsite) return;
    setLoading(true);
    const { from, to } = getDateRange(range);
    const q = `websiteId=${selectedWebsite.id}&from=${from}&to=${to}&limit=50`;

    try {
      const [pRes, landRes, exitRes] = await Promise.all([
        api.get<PageStat[]>(`/api/v1/analytics/pages?${q}`),
        api.get<{ path: string; sessions: number }[]>(`/api/v1/analytics/landing-pages?${q}`),
        api.get<{ path: string; sessions: number }[]>(`/api/v1/analytics/exit-pages?${q}`),
      ]);

      if (pRes.success && pRes.data) setPages(pRes.data);
      if (landRes.success && landRes.data) setLandingPages(landRes.data);
      if (exitRes.success && exitRes.data) setExitPages(exitRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite, range, getDateRange]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const maxViews = pages.length > 0 ? Math.max(...pages.map((p) => p.pageviews)) : 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Pages & Content Performance
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Analyze visitor flow, entry landing pages, and drop-off exit pages
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

      {/* Top Pages Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-bold text-base text-white mb-4">All Visited Pages</h3>

        {pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No pageviews recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => {
              const percentage = Math.round((page.pageviews / maxViews) * 100);

              return (
                <div key={index} className="group relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500/10 rounded-lg pointer-events-none transition-all group-hover:bg-cyan-500/15"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex items-center justify-between p-3 rounded-lg text-xs">
                    <div className="flex items-center gap-3 truncate pr-4">
                      <span className="w-5 text-slate-500 font-mono font-bold text-[11px]">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate group-hover:text-cyan-400 font-mono">
                          {page.path}
                        </div>
                        {page.title && (
                          <div className="text-[11px] text-muted-foreground truncate">
                            {page.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 text-right">
                      <div>
                        <div className="font-extrabold text-white">
                          {page.pageviews}
                        </div>
                        <div className="text-[10px] text-muted-foreground">views</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-300">
                          {page.visitors}
                        </div>
                        <div className="text-[10px] text-muted-foreground">visitors</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Breakdown: Landing vs Exit Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Landing Pages */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Top Landing Pages</h3>
          </div>

          {landingPages.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No landing records.
            </div>
          ) : (
            <div className="space-y-2">
              {landingPages.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 text-xs font-mono"
                >
                  <span className="text-slate-300 truncate max-w-[280px]">
                    {l.path}
                  </span>
                  <span className="font-bold text-emerald-400 font-sans">
                    {l.sessions} sessions
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exit Pages */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-base text-white">Top Exit Pages</h3>
          </div>

          {exitPages.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No exit records.
            </div>
          ) : (
            <div className="space-y-2">
              {exitPages.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 text-xs font-mono"
                >
                  <span className="text-slate-300 truncate max-w-[280px]">
                    {e.path}
                  </span>
                  <span className="font-bold text-rose-400 font-sans">
                    {e.sessions} exits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
