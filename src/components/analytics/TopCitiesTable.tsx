"use client";

import React from "react";
import { CityStat } from "@/types/analytics";
import { Building2 } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";
import Link from "next/link";
import { formatCommas, getSite7DigitId } from "@/lib/utils";
import { useWebsite } from "@/context/WebsiteContext";

interface TopCitiesTableProps {
  cities: CityStat[];
  totalCities?: number;
  loading?: boolean;
}

export const TopCitiesTable: React.FC<TopCitiesTableProps> = ({
  cities,
  totalCities,
  loading = false,
}) => {
  const { selectedWebsite } = useWebsite();
  const displayCities = cities.slice(0, 15);

  const site7Digit = getSite7DigitId(selectedWebsite);
  const geographyHref = site7Digit
    ? `/geography/?id=${site7Digit}`
    : "/geography";

  const countBadge = totalCities ?? cities.length;

  return (
    <div className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 transition-all duration-200">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 gap-2.5">
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

          <Link
            href={geographyHref}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#eef2ff] text-blue-700 border border-blue-200/60 hover:bg-blue-100/80 transition-colors shadow-2xs shrink-0 whitespace-nowrap"
            title="View all city telemetry"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Total Cities: {formatCommas(countBadge)}</span>
          </Link>
        </div>

        {/* Fixed Column Header */}
        <div className="flex items-center justify-between px-3.5 py-1 mb-1.5 text-xs font-bold text-slate-700 select-none">
          <span>Cities</span>
          <span>Visitors</span>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between animate-pulse ${
                  i % 2 === 1 ? "bg-white" : "bg-[#E8E8E8]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-3.5 rounded bg-slate-200 shrink-0" />
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-10 bg-slate-200 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : displayCities.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No city telemetry recorded yet.
          </div>
        ) : (
          <div className="space-y-1 overflow-y-auto max-h-[380px] pr-1">
            {displayCities.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`rounded-xl px-3.5 py-2 flex items-center justify-between transition-colors ${
                    isEven ? "bg-white" : "bg-[#E8E8E8]"
                  }`}
                >
                  {/* Left: Country Flag + City Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag
                      code={item.country_code}
                      countryName={item.country}
                      city={item.city}
                      size="sm"
                    />
                    <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                      {item.city}
                    </span>
                  </div>

                  {/* Right: Visitor Count */}
                  <span className="font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums shrink-0">
                    {formatCommas(item.visitors)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
