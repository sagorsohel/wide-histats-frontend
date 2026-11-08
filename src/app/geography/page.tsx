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

  const totalVisitors = countries.reduce((sum, c) => sum + (c.visitors || 0), 0);
  const citiesTotalVisitors =
    cities.reduce((sum, c) => sum + (c.visitors || 0), 0);
  const topCountry = countries[0] || null;
  const topCountryVisitors = topCountry?.visitors || 0;
  const topCountryPct =
    totalVisitors > 0 ? (topCountryVisitors / totalVisitors) * 100 : 0;

  const topCity = cities[0] || null;
  const topCityVisitors = topCity?.visitors || 0;
  const topCityPct =
    totalVisitors > 0 ? (topCityVisitors / totalVisitors) * 100 : 0;

  const top3Visitors = countries
    .slice(0, 3)
    .reduce((sum, c) => sum + (c.visitors || 0), 0);
  const top3Pct =
    totalVisitors > 0 ? (top3Visitors / totalVisitors) * 100 : 0;

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

      {/* ============================================================ */}
      {/* 1. TOP ROW: GEO STATS SUMMARY TABLE & COMPACT CALENDAR       */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch relative z-10">
        {/* Left: Histats Summary Comparison Table */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="w-full h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="w-full overflow-x-auto scrollbar-none flex-1 flex flex-col">
              <table className="w-full text-left border-collapse min-w-full flex-1">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1455bb] via-[#165dce] to-[#124cb0] text-white text-[11px] sm:text-xs font-bold border-b border-blue-900/40">
                    <th className="py-2.5 px-3 sm:px-4 tracking-wide text-left font-bold text-white/95">
                      Summary
                    </th>
                    <th className="py-2.5 px-2.5 sm:px-3 text-right tracking-wide font-bold text-white/95 whitespace-nowrap lg:w-28">
                      Global stats
                    </th>
                    <th className="py-2.5 px-2.5 sm:px-3 text-right tracking-wide font-bold text-white/95 whitespace-nowrap lg:w-32">
                      Top territory
                    </th>
                    <th className="py-2.5 px-2.5 sm:px-3 text-right tracking-wide font-bold text-white/95 whitespace-nowrap lg:w-28">
                      (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[11px] sm:text-xs font-medium divide-y divide-slate-100 flex-1">
                  {/* Row 1: Countries & Regions */}
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-slate-800 font-medium">
                      Countries &amp; territories
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading ? "..." : `${countries.length} countries`}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap truncate max-w-[140px]">
                      {loading ? "..." : topCountry?.country || "-"}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-semibold text-[#1455bb] tabular-nums whitespace-nowrap">
                      {loading ? "..." : `(${topCountryPct.toFixed(1)} %)`}
                    </td>
                  </tr>

                  {/* Row 2: Total visitors (Soft Green Highlight) */}
                  <tr className="bg-[#eef8e8] hover:bg-[#e4f3dc] transition-colors border-y border-[#d5ebcc]">
                    <td className="py-2.5 px-3 sm:px-4 text-emerald-950 font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />
                      <span>Total visitors</span>
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-black text-slate-950 tabular-nums whitespace-nowrap">
                      {loading ? "..." : totalVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-black text-slate-950 tabular-nums whitespace-nowrap truncate max-w-[140px]">
                      {loading ? "..." : topCountryVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-[#1455bb] tabular-nums whitespace-nowrap">
                      {loading ? "..." : `(${topCountryPct.toFixed(1)} %)`}
                    </td>
                  </tr>

                  {/* Row 3: Urban centers & Metros */}
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-slate-800 font-medium">
                      Top cities &amp; metros
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading ? "..." : `${cities.length} cities`}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap truncate max-w-[140px]">
                      {loading ? "..." : topCity?.city || "-"}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-semibold text-[#1455bb] tabular-nums whitespace-nowrap">
                      {loading ? "..." : `(${topCityPct.toFixed(1)} %)`}
                    </td>
                  </tr>

                  {/* Row 4: Top 3 Concentration */}
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-slate-800 font-medium">
                      Top 3 countries reach
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading ? "..." : `${top3Pct.toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {loading ? "..." : top3Visitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-semibold text-[#1455bb] tabular-nums whitespace-nowrap">
                      {loading ? "..." : `(${top3Pct.toFixed(1)} %)`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Authentic Compact Histats Calendar (Exact image match) */}
        <div className="shrink-0 flex items-center justify-center lg:justify-end">
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCustomRangeChange}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FULL WIDTH SECTION: TOP COUNTRIES & TOP CITIES (NICHE)    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full">
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
                  const percentage = totalVisitors > 0
                    ? Math.round((c.visitors / totalVisitors) * 100)
                    : 0;

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

      {/* ============================================================ */}
      {/* 3. FULL WIDTH INTERACTIVE GLOBAL MAP                         */}
      {/* ============================================================ */}
      <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 p-5 sm:p-6 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] space-y-4 w-full">
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
  );
}
