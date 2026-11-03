"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { PageStat } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import { FileText, LogIn, LogOut, ExternalLink } from "lucide-react";
import { useTabFocus } from "@/hooks/useTabFocus";

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

  const hasDataRef = React.useRef(false);

  const loadPageData = useCallback(async (isSilent = false) => {
    if (!selectedWebsite) return;
    if (!isSilent && !hasDataRef.current) {
      setLoading(true);
    }
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
      hasDataRef.current = true;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite, range, getDateRange]);

  // Auto-refresh when user returns to this tab
  useTabFocus(() => loadPageData(true));

  useEffect(() => {
    loadPageData(hasDataRef.current);
    const interval = setInterval(() => {
      loadPageData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadPageData]);

  const maxViews = pages.length > 0 ? Math.max(...pages.map((p) => p.pageviews)) : 1;
  const cleanDomain = selectedWebsite?.domain
    ? (selectedWebsite.domain.startsWith("http") ? selectedWebsite.domain : `https://${selectedWebsite.domain}`)
    : "https://streamespn.org";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pages & Content Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze visitor flow, entry landing pages, and drop-off exit pages
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

      {/* Top Pages Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="font-bold text-base text-slate-900 mb-4">All Visited Pages</h3>

        {loading && pages.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 animate-pulse text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-5 h-4 bg-slate-200 rounded shrink-0" />
                  <div className="space-y-1.5 flex-1 max-w-[420px]">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                  <div className="h-4 w-10 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No pageviews recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => {
              const percentage = Math.round((page.pageviews / maxViews) * 100);
              const fullLink = page.url || `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;

              return (
                <div key={index} className="group relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/10 rounded-lg pointer-events-none transition-all group-hover:bg-blue-500/15"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex items-center justify-between p-3 rounded-lg text-xs gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                      <span className="w-5 text-slate-400 font-mono font-bold text-[11px] shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-[#1d5b9f]" />
                          <a
                            href={fullLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fullLink}
                            className="font-bold text-slate-900 truncate group-hover:text-[#1d5b9f] hover:underline font-mono text-[12px] block"
                          >
                            {fullLink}
                          </a>
                        </div>
                        {page.title && (
                          <div
                            title={page.title}
                            className="text-[11px] text-slate-600 truncate block font-sans"
                          >
                            {page.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 text-right">
                      <div>
                        <div className="font-extrabold text-slate-900 tabular-nums">
                          {page.pageviews}
                        </div>
                        <div className="text-[10px] text-slate-400">views</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-600 tabular-nums">
                          {page.visitors}
                        </div>
                        <div className="text-[10px] text-slate-400">visitors</div>
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Top Landing Pages</h3>
          </div>

          {loading && landingPages.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs animate-pulse"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 w-48 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3.5 w-16 bg-slate-200 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : landingPages.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No landing records.
            </div>
          ) : (
            <div className="space-y-2">
              {landingPages.map((l, i) => {
                const cleanDomain = selectedWebsite?.domain
                  ? (selectedWebsite.domain.startsWith("http") ? selectedWebsite.domain : `https://${selectedWebsite.domain}`)
                  : "https://streamespn.org";
                const fullLandLink = `${cleanDomain}${l.path.startsWith("/") ? l.path : `/${l.path}`}`;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs gap-2"
                  >
                    <a
                      href={fullLandLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={fullLandLink}
                      className="text-slate-800 hover:text-[#1d5b9f] hover:underline truncate font-mono text-[11px] flex items-center gap-1 flex-1 min-w-0"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{fullLandLink}</span>
                    </a>
                    <span className="font-bold text-emerald-700 font-sans tabular-nums shrink-0">
                      {l.sessions} sessions
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Exit Pages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900">Top Exit Pages</h3>
          </div>

          {loading && exitPages.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs animate-pulse"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 w-48 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3.5 w-16 bg-slate-200 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : exitPages.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No exit records.
            </div>
          ) : (
            <div className="space-y-2">
              {exitPages.map((e, i) => {
                const cleanDomain = selectedWebsite?.domain
                  ? (selectedWebsite.domain.startsWith("http") ? selectedWebsite.domain : `https://${selectedWebsite.domain}`)
                  : "https://streamespn.org";
                const fullExitLink = `${cleanDomain}${e.path.startsWith("/") ? e.path : `/${e.path}`}`;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs gap-2"
                  >
                    <a
                      href={fullExitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={fullExitLink}
                      className="text-slate-800 hover:text-[#1d5b9f] hover:underline truncate font-mono text-[11px] flex items-center gap-1 flex-1 min-w-0"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{fullExitLink}</span>
                    </a>
                    <span className="font-bold text-rose-600 font-sans tabular-nums shrink-0">
                      {e.sessions} exits
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
