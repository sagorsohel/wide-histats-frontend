"use client";

import React from "react";
import { CityStat } from "@/types/analytics";
import { Building2, ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";
import Link from "next/link";
import { formatCommas, getSite7DigitId } from "@/lib/utils";
import { useWebsite } from "@/context/WebsiteContext";

interface TopCitiesTableProps {
  cities: CityStat[];
  loading?: boolean;
}

export const TopCitiesTable: React.FC<TopCitiesTableProps> = ({
  cities,
  loading = false,
}) => {
  const { selectedWebsite } = useWebsite();
  // Take top 7 to match Visitors by Country height perfectly
  const displayCities = cities.slice(0, 7);
  const totalVisitors =
    displayCities.reduce((sum, c) => sum + c.visitors, 0) || 1;

  const site7Digit = getSite7DigitId(selectedWebsite);
  const geographyHref = site7Digit
    ? `/geography/?id=${site7Digit}`
    : "/geography";

  return (
    <div className="h-full flex flex-col justify-between bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50/90 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Top Cities
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Metropolitan breakdown of incoming visitors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Urban regions
            </span>
            <Link
              href={geographyHref}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group transition-colors px-2.5 py-1 rounded-full bg-indigo-50/60 border border-indigo-100/60 shrink-0"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-2.5">
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
        ) : displayCities.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No city telemetry recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayCities.map((item, index) => {
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 p-3 sm:p-3.5 flex items-center justify-between transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
                >
                  {/* Left: Country Flag + City Name + Country */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                      <CountryFlag
                        code={item.country_code}
                        countryName={item.country}
                        city={item.city}
                        size="md"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                        {item.city}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {item.country}
                      </p>
                    </div>
                  </div>

                  {/* Right: Visitor Count + 'visitors' */}
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base tabular-nums block">
                      {formatCommas(item.visitors)}
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
        <span>Urban centers &amp; regional traffic</span>
        <span className="font-semibold text-slate-500">
          {formatCommas(totalVisitors)} visits in top metros
        </span>
      </div>
    </div>
  );
};
