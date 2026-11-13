"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { CountryStat, CityStat, OverviewStats } from "@/types/analytics";
import {
  RangeOption,
  CustomDateWindow,
} from "@/components/analytics/DateRangePicker";
import { HistatsCalendar } from "@/components/analytics/HistatsCalendar";
import { DailyStatsCard } from "@/components/analytics/DailyStatsCard";
import { GeoPieChart } from "@/components/analytics/GeoPieChart";
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
  const [overview, setOverview] = useState<OverviewStats | null>(null);
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
      const q = `websiteId=${siteId}&from=${from}&to=${to}&limit=10000`;

      // Strict future check: future date has zero traffic
      if (new Date(from).getTime() > Date.now()) {
        setCountries([]);
        setCities([]);
        setOverview({
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
        setLoading(false);
        hasDataRef.current = true;
        return;
      }

      if (!isSilent && !hasDataRef.current) {
        const cached = api.getCached<any>(`/api/v1/analytics/geography?${q}`);
        const cachedOverview = api.getCached<OverviewStats>(
          `/api/v1/analytics/overview?websiteId=${siteId}&from=${from}&to=${to}`,
        );
        if (cached?.data?.countries) {
          setCountries(cached.data.countries);
          if (cached.data.cities) setCities(cached.data.cities);
          if (cachedOverview?.data) setOverview(cachedOverview.data);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      try {
        const [res, overviewRes] = await Promise.all([
          api.get<{
            countries: CountryStat[];
            cities: CityStat[];
          }>(`/api/v1/analytics/geography?${q}`),
          api.get<OverviewStats>(
            `/api/v1/analytics/overview?websiteId=${siteId}&from=${from}&to=${to}`,
          ),
        ]);

        // Strict race condition check: if user switched website while this was in flight, discard!
        if (siteId !== activeSiteIdRef.current) {
          return;
        }

        if (res.success && res.data) {
          setCountries(res.data.countries || []);
          setCities(res.data.cities || []);
        }
        if (overviewRes.success && overviewRes.data) {
          setOverview(overviewRes.data);
        }
        hasDataRef.current = true;
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

  const totalVisitors = countries.reduce(
    (sum, c) => sum + (c.visitors || 0),
    0,
  );
  const citiesTotalVisitors = cities.reduce(
    (sum, c) => sum + (c.visitors || 0),
    0,
  );
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
  const top3Pct = totalVisitors > 0 ? (top3Visitors / totalVisitors) * 100 : 0;

  const geoStatItems = [
    {
      value: totalVisitors.toLocaleString(),
      label: "Total visitors",
      sublabel: "Global audience analyzed",
      highlight: true,
    },
    {
      value: `${countries.length}`,
      label: "Countries & territories",
      sublabel: "Distinct global regions",
      highlight: true,
    },
    {
      value: `${cities.length}`,
      label: "Top cities & metros",
      sublabel: "Urban centers identified",
      highlight: true,
    },
    {
      value: topCountry?.country || "-",
      label: "Top territory",
      sublabel: `${topCountryVisitors.toLocaleString()} (${topCountryPct.toFixed(1)}%)`,
      highlight: false,
    },
    {
      value: topCity?.city || "-",
      label: "Top city",
      sublabel: `${topCityVisitors.toLocaleString()} (${topCityPct.toFixed(1)}%)`,
      highlight: false,
    },
    {
      value: `${top3Pct.toFixed(1)}%`,
      label: "Top 3 countries reach",
      sublabel: `${top3Visitors.toLocaleString()} visitors in top 3`,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}

      {/* ============================================================ */}
      {/* 1. TOP ROW: GEOGRAPHY PIE CHART & COMPACT CALENDAR           */}
      {/* ============================================================ */}
      <DailyStatsCard
        title="Geography stats"
        overview={overview}
        loading={loading}
        range={range}
        domain={selectedWebsite?.domain}
        calendar={
          <HistatsCalendar
            selectedPreset={range}
            onPresetChange={handleRangeChange}
            currentWindow={customWindow}
            onDateChange={handleCustomRangeChange}
          />
        }
      >
        <GeoPieChart countries={countries} loading={loading} />
      </DailyStatsCard>

      {/* ============================================================ */}
      {/* 2. SIDE-BY-SIDE COMPLETE RANKING LISTS                       */}
      {/* Top Cities (Left) & Visitors by Country (Right)               */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 transition-all duration-300 w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1455bb] border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Globe2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                Visitors by Country Map
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Geographic distribution across territories
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1455bb] border border-blue-200/80 shadow-2xs whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1455bb]" />
            <span>Total Countries: {countries.length}</span>
          </span>
        </div>

        {/* Interactive Full-Width Country Map */}
        <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-xs">
          <RealtimeGeoMap
            countryData={countries.map((c) => ({
              country: c.country,
              code: c.country_code,
              count: c.visitors,
            }))}
            height="420px"
            mode="country"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch w-full">
        {/* Top Cities Box (LEFT SIDE) */}
        <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 transition-all duration-300">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                    Top Cities
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Metropolitan visitor breakdown by cities
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Total Cities: {cities.length}</span>
              </span>
            </div>

            {/* Cities Content List */}
            {loading && cities.length === 0 ? (
              <div className="space-y-1.5 flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-md bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : cities.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                No city records found for this period.
              </div>
            ) : (
              <div className="flex-1 max-h-[460px] overflow-y-auto pr-1">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-600 mb-1">
                  <span>Cities</span>
                  <span>Visitors</span>
                </div>

                {/* Cities Rows */}
                <div className="space-y-1">
                  {cities.map((city, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#e8e8e8]"
                      }`}
                    >
                      {/* Left: Flag + City Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200/70 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          <CountryFlag
                            code={city.country_code}
                            countryName={city.country}
                            city={city.city}
                            size="sm"
                          />
                        </div>
                        <span className="font-semibold text-slate-800 text-xs sm:text-[13px] truncate">
                          {city.city}
                        </span>
                      </div>

                      {/* Right: Just Count */}
                      <span className="font-bold text-slate-900 text-xs sm:text-sm tabular-nums text-right shrink-0">
                        {formatCommas(city.visitors)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Urban centers &amp; regional traffic</span>
            <span className="font-semibold text-slate-500">
              {formatCommas(citiesTotalVisitors)} visits in top metros
            </span>
          </div>
        </div>

        {/* Visitors by Country Box (RIGHT SIDE) */}
        <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 transition-all duration-300">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1455bb] border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                    Visitors by Country
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Geographic distribution of your audience
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1455bb] border border-blue-200/80 shadow-2xs whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1455bb]" />
                <span>Total Countries: {countries.length}</span>
              </span>
            </div>

            {/* Content List */}
            {loading && countries.length === 0 ? (
              <div className="space-y-1.5 flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-md bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : countries.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                No country data available for this date range.
              </div>
            ) : (
              <div className="flex-1 max-h-[460px] overflow-y-auto pr-1">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-600 mb-1">
                  <span>Countries</span>
                  <span>Visitors</span>
                </div>

                {/* Countries Rows */}
                <div className="space-y-1">
                  {countries.map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-[#e8e8e8]"
                      }`}
                    >
                      {/* Left: Flag + Country Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200/70 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          <CountryFlag
                            code={c.country_code}
                            countryName={c.country}
                            size="sm"
                          />
                        </div>
                        <span className="font-semibold text-slate-800 text-xs sm:text-[13px] truncate">
                          {c.country}
                        </span>
                      </div>

                      {/* Right: Just Count */}
                      <span className="font-bold text-slate-900 text-xs sm:text-sm tabular-nums text-right shrink-0">
                        {formatCommas(c.visitors)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Global territory distribution</span>
            <span className="font-semibold text-slate-500">
              {formatCommas(totalVisitors)} international visitors
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ONLY ONE FULL-WIDTH COUNTRY MAP                           */}
      {/* ============================================================ */}
    </div>
  );
}
