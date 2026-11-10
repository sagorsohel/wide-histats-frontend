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
    <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 transition-all duration-200">
      {/* Top Header */}
      <div>
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
                Metropolitan breakdown of incoming visitors
              </p>
            </div>
          </div>

          <Link
            href={geographyHref}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group transition-colors px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 shadow-2xs shrink-0 whitespace-nowrap"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100/80 bg-white/50 px-2.5 py-1.5 flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="h-2.5 w-14 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-3 w-10 bg-slate-200 rounded ml-auto" />
                  <div className="h-2.5 w-8 bg-slate-100 rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : displayCities.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No city telemetry recorded yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayCities.map((item, index) => {
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 px-2.5 py-1.5 flex items-center justify-between transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
                >
                  {/* Left: Country Flag + City Name + Country */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                      <CountryFlag
                        code={item.country_code}
                        countryName={item.country}
                        city={item.city}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight truncate group-hover:text-indigo-600 transition-colors">
                        {item.city}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">
                        {item.country}
                      </p>
                    </div>
                  </div>

                  {/* Right: Visitor Count + 'visitors' */}
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm tabular-nums block leading-tight">
                      {formatCommas(item.visitors)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block leading-tight">
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
      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
        <span>Urban centers &amp; regional traffic</span>
        <span className="font-semibold text-slate-500">
          {formatCommas(totalVisitors)} visits in top metros
        </span>
      </div>
    </div>
  );
};
