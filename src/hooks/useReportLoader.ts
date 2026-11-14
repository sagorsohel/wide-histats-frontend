"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { useTabFocus } from "@/hooks/useTabFocus";
import { api, ApiResponse } from "@/lib/api";
import { resolveRange, ResolvedRange } from "@/lib/dateRange";
import type { RangeOption, CustomDateWindow } from "@/components/analytics/DateRangePicker";
import type { OverviewStats } from "@/types/analytics";

export interface ReportFetchContext extends ResolvedRange {
  siteId: string;
  /** `websiteId=…&from=…&to=…` ready to append to an analytics endpoint. */
  query: string;
  /** Background refresh (no spinner, bypasses the client cache). */
  silent: boolean;
  /** True once a newer load (other site / range / refresh) has started; drop results then. */
  isStale: () => boolean;
  /** `api.get` that bypasses the client cache for background refreshes. */
  get: <T = any>(endpoint: string) => Promise<ApiResponse<T>>;
}

interface Options {
  fetcher: (ctx: ReportFetchContext) => Promise<void>;
  /** Called when the selected website changes, before the new site loads. */
  onSiteChange?: () => void;
  /** Background refresh interval. Paused while the tab is hidden. 0 disables. */
  intervalMs?: number;
}

export const emptyOverview = (from: string, to: string): OverviewStats => ({
  activeVisitors: 0,
  totalPageviews: 0,
  uniqueVisitors: 0,
  totalSessions: 0,
  pagesPerSession: 0,
  bounceRate: 0,
  avgDuration: 0,
  from,
  to,
});

/**
 * Shared data-loading plumbing for the date-ranged report pages.
 *
 * Guarantees:
 *  - exactly one load per (site, timezone, range) change, always with the CURRENT range
 *  - results from superseded requests are discarded (no stale-range / stale-site flashes)
 *  - background refreshes never overlap, skip hidden tabs, and bypass the client cache
 *  - one refresh on tab focus / reconnect instead of several duplicate ones
 */
export function useReportLoader({ fetcher, onSiteChange, intervalMs = 30_000 }: Options) {
  const { selectedWebsite } = useWebsite();
  const siteId = selectedWebsite?.id ?? null;
  const timezone = selectedWebsite?.timezone ?? null;

  const [range, setRangeState] = useState<RangeOption>("today");
  const [customWindow, setCustomWindowState] = useState<CustomDateWindow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const onSiteChangeRef = useRef(onSiteChange);
  onSiteChangeRef.current = onSiteChange;

  const stateRef = useRef({ siteId, timezone, range, customWindow });
  stateRef.current = { siteId, timezone, range, customWindow };

  const seqRef = useRef(0);
  const inFlightRef = useRef(false);

  const load = useCallback(async (silent: boolean) => {
    const { siteId, timezone, range, customWindow } = stateRef.current;
    if (!siteId) {
      setLoading(false);
      return;
    }
    if (silent) {
      if (inFlightRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    }

    const seq = ++seqRef.current;
    const isStale = () => seq !== seqRef.current;
    const bounds = resolveRange(range, customWindow, timezone);
    const query =
      `websiteId=${encodeURIComponent(siteId)}` +
      `&from=${encodeURIComponent(bounds.from)}` +
      `&to=${encodeURIComponent(bounds.to)}`;

    if (!silent) setLoading(true);
    inFlightRef.current = true;
    try {
      await fetcherRef.current({
        ...bounds,
        siteId,
        query,
        silent,
        isStale,
        get: <T,>(endpoint: string) => api.get<T>(endpoint, { skipCache: silent }),
      });
    } catch (err) {
      console.error("Report load failed", err);
    } finally {
      if (!isStale()) {
        inFlightRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  const windowKey = customWindow ? `${customWindow.from}|${customWindow.to}` : "";
  const prevSiteRef = useRef<string | null>(null);

  // Single trigger for site / timezone / range changes.
  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      return;
    }
    if (prevSiteRef.current !== siteId) {
      if (prevSiteRef.current !== null) onSiteChangeRef.current?.();
      prevSiteRef.current = siteId;
    }
    load(false);
  }, [siteId, timezone, range, windowKey, load]);

  // Background refresh.
  useEffect(() => {
    if (!intervalMs) return;
    const timer = setInterval(() => load(true), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, load]);

  // Tab focus / network restore (debounced inside useTabFocus) and socket reconnect.
  useTabFocus(() => load(true));
  useEffect(() => {
    const handleSync = () => load(true);
    window.addEventListener("histat:socket_sync", handleSync);
    return () => window.removeEventListener("histat:socket_sync", handleSync);
  }, [load]);

  const setRange = useCallback((r: RangeOption) => {
    setRangeState(r);
    setCustomWindowState(null);
  }, []);

  const setCustomWindow = useCallback((win: CustomDateWindow | null) => {
    setCustomWindowState(win);
  }, []);

  const bounds = useMemo(
    () => resolveRange(range, customWindow, timezone),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, windowKey, timezone],
  );

  return {
    range,
    customWindow,
    setRange,
    setCustomWindow,
    loading,
    bounds,
    reload: () => load(false),
  };
}
