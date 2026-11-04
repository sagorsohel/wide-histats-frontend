"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { CountryStat, CityStat } from "@/types/analytics";
import {
  DateRangePicker,
  RangeOption,
} from "@/components/analytics/DateRangePicker";
import { Globe2, MapPin, Info, ArrowUpRight } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";
import { useTabFocus } from "@/hooks/useTabFocus";

export default function GeographyPage() {
  const { selectedWebsite } = useWebsite();
  const [range, setRange] = useState<RangeOption>("today");
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
  const activeSiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);
  activeSiteIdRef.current = selectedWebsite?.id || null;

  const loadGeoData = useCallback(async (isSilent = false, overrideSiteId?: string) => {
    const siteId = overrideSiteId || activeSiteIdRef.current;
    if (!siteId) return;
    if (!isSilent && !hasDataRef.current) {
      setLoading(true);
    }
    const { from, to } = getDateRange(range);
    const q = `websiteId=${siteId}&from=${from}&to=${to}&limit=50`;

    try {
      const res = await api.get<{ countries: CountryStat[]; cities: CityStat[] }>(
        `/api/v1/analytics/geography?${q}`
      );

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
  }, [range, getDateRange]);

  // Instantly handle website switcher change in Geography page
  const prevWebsiteIdRef = React.useRef<string | null>(selectedWebsite?.id || null);

  useEffect(() => {
    if (selectedWebsite?.id && selectedWebsite.id !== prevWebsiteIdRef.current) {
      prevWebsiteIdRef.current = selectedWebsite.id;
      activeSiteIdRef.current = selectedWebsite.id;
      setCountries([]);
      setCities([]);
      hasDataRef.current = false;
      setLoading(true);
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
    return () => window.removeEventListener("histat:website_changed", handleWebsiteChanged);
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

  const totalVisitors =
    countries.reduce((sum, c) => sum + c.visitors, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Geography & Locations
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d5b9f] border border-blue-200 font-bold">
              {countries.length} Countries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global audience breakdown resolved via IP geolocation
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

      {/* Privacy Notice Alert per specification */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-[#1d5b9f] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Privacy Notice:</strong> IP-based geolocation is approximate and derived safely on the server side without storing raw IP addresses. Locations may be affected by VPNs, proxies, and cellular towers.
        </p>
      </div>

      {/* Two Column Breakdown: Countries & Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Visitors by Country</h3>
            <span className="text-xs text-slate-500 font-semibold">
              Ranked by visitors
            </span>
          </div>

          {loading && countries.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1.5 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-3.5 bg-slate-200 rounded" />
                      <div className="w-5 h-4 bg-slate-200 rounded" />
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-12 bg-slate-200 rounded" />
                      <div className="h-4 w-8 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5" />
                </div>
              ))}
            </div>
          ) : countries.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No country data available for this date range.
            </div>
          ) : (
            <div className="space-y-3">
              {countries.map((c, i) => {
                const percentage = Math.round((c.visitors / totalVisitors) * 100);

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-slate-400 font-mono text-[11px]">
                          {i + 1}
                        </span>
                        <CountryFlag code={c.country_code} size="md" />
                        <span className="font-semibold text-slate-800">
                          {c.country}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {c.country_code}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {c.visitors}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            visitors
                          </span>
                        </div>
                        <span className="text-[11px] text-[#1d5b9f] font-bold w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#1d5b9f] to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cities Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Top Cities</h3>
            <span className="text-xs text-slate-500 font-semibold">
              Urban regions
            </span>
          </div>

          {loading && cities.length === 0 ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-pulse"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-14 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No city records found for this period.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {cities.map((city, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#1d5b9f] shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">{city.city}</div>
                      <div className="text-[11px] text-slate-500">
                        {city.country}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-slate-900 tabular-nums">
                      {city.visitors}
                    </div>
                    <div className="text-[10px] text-slate-400">visitors</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
