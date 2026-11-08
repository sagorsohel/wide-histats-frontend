"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { CountryStat, CityStat } from "@/types/analytics";
import {
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { Globe2, Building2, Info, ArrowUpRight } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";
import { formatCommas } from "@/lib/utils";
import { useTabFocus } from "@/hooks/useTabFocus";
import dynamic from "next/dynamic";

const RealtimeGeoMap = dynamic(
  () =>
    import("@/components/analytics/RealtimeGeoMap").then(
      (m) => m.RealtimeGeoMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-[#0d1726] flex items-center justify-center text-cyan-400/80 text-xs font-mono animate-pulse rounded-2xl">
        Loading Global Distribution Map...
      </div>
    ),
  },
);

export default function GeographyPage() {
  const { selectedWebsite } = useWebsite();

  const [range, setRange] = useState<RangeOption>("today");
  const [customWindow, setCustomWindow] = useState<CustomDateWindow | null>(
    null,
  );
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [cities, setCities] = useState<CityStat[]>([]);
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
  const activeSiteIdRef = React.useRef<string | null>(
    selectedWebsite?.id || null,
  );
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadGeoData = useCallback(
    async (
      isSilent = false,
      overrideSiteId?: string,
      overrideWindow?: CustomDateWindow | null,
    ) => {
      const siteId = overrideSiteId || activeSiteIdRef.current;
      if (!siteId) return;
      const win = overrideWindow !== undefined ? overrideWindow : customWindow;
      let from: string;
      let to: string;
      if (win) {
        from = win.from;
        to = win.to;
      } else {
        const dates = getDateRange(range);
        from = dates.from;
        to = dates.to;
      }
      const q = `websiteId=${siteId}&from=${from}&to=${to}&limit=50`;

      if (!isSilent && !hasDataRef.current) {
        const cached = api.getCached<any>(`/api/v1/analytics/geography?${q}`);
        if (cached?.data?.countries) {
          setCountries(cached.data.countries);
          if (cached.data.cities) setCities(cached.data.cities);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const res = await api.get<{
          countries: CountryStat[];
          cities: CityStat[];
        }>(`/api/v1/analytics/geography?${q}`);

        // Strict race condition check: if user switched website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (res.success && res.data) {
          setCountries(res.data.countries || []);
          setCities(res.data.cities || []);
          hasDataRef.current = true;
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (siteId === activeSiteIdRef.current) {
          setLoading(false);
        }
      }
    },
    [range, customWindow, getDateRange],
  );

  const handleRangeChange = (r: RangeOption) => {
    setRange(r);
    setCustomWindow(null);
    hasDataRef.current = false;
    loadGeoData(false, undefined, null);
  };

  const handleCustomRangeChange = (win: CustomDateWindow | null) => {
    setCustomWindow(win);
    hasDataRef.current = false;
    loadGeoData(false, undefined, win);
  };

  // Instantly handle website switcher change in Geography page
  const prevWebsiteIdRef = React.useRef<string | null>(
    selectedWebsite?.id || null,
  );

  useEffect(() => {
    if (
      selectedWebsite?.id &&
      selectedWebsite.id !== prevWebsiteIdRef.current
    ) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      setCountries([]);
      setCities([]);
      hasDataRef.current = false;
      setLoading(true);
      loadGeoData(false, selectedWebsite.id);
    } else if (selectedWebsite?.id && !hasDataRef.current) {
      loadGeoData(false, selectedWebsite.id);
    }
  }, [selectedWebsite?.id, loadGeoData]);

  // Listen to global website changed event for immediate 0ms update
  useEffect(() => {
    const handleWebsiteChanged = (e: any) => {
      const newSite = e.detail;
      if (newSite?.id) {
        prevWebsiteIdRef.current = newSite.id;
        setCountries([]);
        setCities([]);
        hasDataRef.current = false;
        setLoading(true);
        loadGeoData(false, newSite.id);
      }
    };
    window.addEventListener("histat:website_changed", handleWebsiteChanged);
    return () =>
      window.removeEventListener(
        "histat:website_changed",
        handleWebsiteChanged,
      );
  }, [loadGeoData]);

  // Auto-refresh when user returns to this tab
  useTabFocus(() => loadGeoData(true));

  // Silent sync on socket reconnect or network restore
  useEffect(() => {
    const handleSilentSync = () => {
      if (selectedWebsite) {
        loadGeoData(true);
      }
    };
    window.addEventListener("histat:socket_sync", handleSilentSync);
    window.addEventListener("online", handleSilentSync);
    window.addEventListener("focus", handleSilentSync);
    return () => {
      window.removeEventListener("histat:socket_sync", handleSilentSync);
      window.removeEventListener("online", handleSilentSync);
      window.removeEventListener("focus", handleSilentSync);
    };
  }, [selectedWebsite, loadGeoData]);

  useEffect(() => {
    loadGeoData(hasDataRef.current);
    const interval = setInterval(() => {
      loadGeoData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadGeoData]);

  const totalVisitors = countries.reduce((sum, c) => sum + c.visitors, 0) || 1;
  const citiesTotalVisitors =
    cities.reduce((sum, c) => sum + c.visitors, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#1455bb] to-[#1a62d4] flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Geography &amp; Locations
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#1455bb] border border-blue-200/80 font-bold shadow-2xs">
                {countries.length} Countries
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold shadow-2xs hidden sm:inline-block">
                {cities.length} Cities
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Global audience breakdown resolved via IP geolocation telemetry
            </p>
          </div>
        </div>

        {/* Current Active Range indicator Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              Active Window:
            </span>
            <span className="px-2.5 py-0.5 rounded-xl bg-blue-100/80 text-[#1455bb] border border-blue-200/90 text-xs font-black">
              {customWindow?.label ||
                (range === "today"
                  ? "Today"
                  : range === "yesterday"
                    ? "Yesterday"
                    : range === "7d"
                      ? "Last 7 Days"
                      : "Last 30 Days")}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left (Main Content), Right (Always Shown Calendar) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
        {/* ============================================================ */}
        {/* LEFT / MAIN CONTENT COLUMN                                   */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* Privacy Notice Alert per specification */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 backdrop-blur-md flex items-start gap-3 text-xs text-slate-700 shadow-2xs">
            <Info className="w-4 h-4 text-[#1455bb] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-900 font-semibold">
                Privacy Notice:
              </strong>{" "}
              IP-based geolocation is approximate and derived safely on the
              server side without storing raw IP addresses. Locations may be
              affected by VPNs, proxies, and cellular towers.
            </p>
          </div>

          {/* Interactive Global Telemetry Map */}

          {/* Two Column Breakdown: Countries & Cities (Strictly Equal Height) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Visitors by Country Box */}
            <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all duration-300">
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1455bb] border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                        Visitors by Country
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Geographic distribution of your audience
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1455bb] border border-blue-200/80 shadow-2xs whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1455bb]" />
                    <span>{countries.length} countries</span>
                  </span>
                </div>

                {/* Content List */}
                {loading && countries.length === 0 ? (
                  <div className="space-y-2.5 flex-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-100/80 bg-white/50 p-3 sm:p-3.5 flex items-center justify-between animate-pulse"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-24 bg-slate-200 rounded" />
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <div className="h-3.5 w-12 bg-slate-200 rounded ml-auto" />
                          <div className="h-3 w-10 bg-slate-100 rounded ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : countries.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                    No country data available for this date range.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 flex-1">
                    {countries.map((c, i) => {
                      const percentage = Math.round(
                        (c.visitors / totalVisitors) * 100,
                      );

                      return (
                        <div
                          key={i}
                          className="rounded-2xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 p-3 sm:p-3.5 flex items-center justify-between transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
                        >
                          {/* Left: Flag + Country Name + Share */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                              <CountryFlag
                                code={c.country_code}
                                countryName={c.country}
                                size="md"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                  {c.country}
                                </h4>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">
                                  {c.country_code}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium truncate">
                                {percentage}% of total audience
                              </p>
                            </div>
                          </div>

                          {/* Right: Visitor Count + 'visitors' */}
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base tabular-nums block">
                              {formatCommas(c.visitors)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium block">
                              visitors
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Global territory distribution</span>
                <span className="font-semibold text-slate-500">
                  {formatCommas(totalVisitors)} international visitors
                </span>
              </div>
            </div>

            {/* Top Cities Box */}
            <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all duration-300">
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                        Top Cities
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Metropolitan breakdown of incoming visitors
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200/80 shadow-2xs whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{cities.length} cities</span>
                  </span>
                </div>

                {/* Content List */}
                {loading && cities.length === 0 ? (
                  <div className="space-y-2.5 flex-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-100/80 bg-white/50 p-3 sm:p-3.5 flex items-center justify-between animate-pulse"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-24 bg-slate-200 rounded" />
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <div className="h-3.5 w-12 bg-slate-200 rounded ml-auto" />
                          <div className="h-3 w-10 bg-slate-100 rounded ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cities.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                    No city records found for this period.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 flex-1">
                    {cities.map((city, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 p-3 sm:p-3.5 flex items-center justify-between transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
                      >
                        {/* Left: Flag + City Name + Country */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                            <CountryFlag
                              code={city.country_code}
                              countryName={city.country}
                              city={city.city}
                              size="md"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                              {city.city}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {city.country}
                            </p>
                          </div>
                        </div>

                        {/* Right: Visitor Count + 'visitors' */}
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base tabular-nums block">
                            {formatCommas(city.visitors)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium block">
                            visitors
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Urban centers &amp; regional traffic</span>
                <span className="font-semibold text-slate-500">
                  {formatCommas(citiesTotalVisitors)} visits in top metros
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 p-5 sm:p-6 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50/90 text-cyan-600 border border-cyan-100/80 flex items-center justify-center shrink-0 shadow-xs">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                      Interactive Global Map
                    </h3>
                    <span className="text-[10px] text-blue-700 font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                      Live Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time geographic distribution powered by MapLibre GL
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline-block bg-slate-50/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                MapLibre GL &bull; Open-Source
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
              <RealtimeGeoMap
                countryData={countries.map((c) => ({
                  country: c.country,
                  code: c.country_code,
                  count: c.visitors,
                }))}
                height="360px"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ALWAYS SHOWN CALENDAR                          */}
        {/* ============================================================ */}
        <div className="w-full xl:w-[291px] shrink-0 space-y-5 xl:sticky xl:top-6">
          <div className="flex justify-center xl:justify-end">
            <HistatsCalendar
              selectedPreset={range}
              onPresetChange={handleRangeChange}
              currentWindow={customWindow}
              onDateChange={handleCustomRangeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
