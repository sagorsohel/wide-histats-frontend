"use client";

import React from "react";
import { CountryStat } from "@/types/analytics";
import { Globe2, ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";
import Link from "next/link";
import { formatCommas, getSite7DigitId } from "@/lib/utils";
import { useWebsite } from "@/context/WebsiteContext";

interface GeographyTableProps {
  countries: CountryStat[];
  loading?: boolean;
}

export const GeographyTable: React.FC<GeographyTableProps> = ({
  countries,
  loading = false,
}) => {
  const { selectedWebsite } = useWebsite();
  // Take top 7 to match Top Cities height perfectly
  const displayCountries = countries.slice(0, 7);
  const totalVisitors =
    countries.reduce((sum, c) => sum + c.visitors, 0) || 1;

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

          <Link
            href={geographyHref}
            className="text-[11px] font-bold text-[#1455bb] hover:text-blue-700 flex items-center gap-1 group transition-colors px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 shadow-2xs shrink-0 whitespace-nowrap"
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
        ) : displayCountries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No location data recorded yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayCountries.map((item, index) => {
              const percentage = Math.round((item.visitors / totalVisitors) * 100);

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 px-2.5 py-1.5 flex items-center justify-between transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
                >
                  {/* Left: Country Flag + Country Name + Percentage */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                      <CountryFlag
                        code={item.country_code}
                        countryName={item.country}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight truncate group-hover:text-blue-600 transition-colors">
                          {item.country}
                        </h4>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {item.country_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">
                        {percentage}% of total audience
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
        <span>Global territory distribution</span>
        <span className="font-semibold text-slate-500">
          {formatCommas(totalVisitors)} international visitors
        </span>
      </div>
    </div>
  );
};
