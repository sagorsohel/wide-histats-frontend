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

export default function GeographyPage() {
  const { selectedWebsite } = useWebsite();
  const [range, setRange] = useState<RangeOption>("7d");
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

  const loadGeoData = useCallback(async () => {
    if (!selectedWebsite) return;
    setLoading(true);
    const { from, to } = getDateRange(range);
    const q = `websiteId=${selectedWebsite.id}&from=${from}&to=${to}&limit=50`;

    try {
      const res = await api.get<{ countries: CountryStat[]; cities: CityStat[] }>(
        `/api/v1/analytics/geography?${q}`
      );
      if (res.success && res.data) {
        setCountries(res.data.countries || []);
        setCities(res.data.cities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite, range, getDateRange]);

  useEffect(() => {
    loadGeoData();
  }, [loadGeoData]);

  const totalVisitors =
    countries.reduce((sum, c) => sum + c.visitors, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Geography & Locations
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              {countries.length} Countries
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global audience breakdown resolved via IP geolocation
          </p>
        </div>

        <DateRangePicker selectedRange={range} onChange={setRange} />
      </div>

      {/* Privacy Notice Alert per specification */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Privacy Notice:</strong> IP-based geolocation is approximate and derived safely on the server side without storing raw IP addresses. Locations may be affected by VPNs, proxies, and cellular towers.
        </p>
      </div>

      {/* Two Column Breakdown: Countries & Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries Table */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Visitors by Country</h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Ranked by visitors
            </span>
          </div>

          {countries.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
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
                        <span className="w-5 text-slate-500 font-mono text-[11px]">
                          {i + 1}
                        </span>
                        <CountryFlag code={c.country_code} size="md" />
                        <span className="font-semibold text-slate-200">
                          {c.country}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          {c.country_code}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-extrabold text-white">
                            {c.visitors}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1">
                            visitors
                          </span>
                        </div>
                        <span className="text-[11px] text-cyan-400 font-bold w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
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
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Top Cities</h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Urban regions
            </span>
          </div>

          {cities.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No city records found for this period.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {cities.map((city, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-border/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200">{city.city}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {city.country}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-white">
                      {city.visitors}
                    </div>
                    <div className="text-[10px] text-muted-foreground">visitors</div>
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
