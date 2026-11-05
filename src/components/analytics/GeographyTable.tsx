"use client";

import React from "react";
import { CountryStat } from "@/types/analytics";
import { Globe2, ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";
import Link from "next/link";

interface GeographyTableProps {
  countries: CountryStat[];
  loading?: boolean;
}

export const GeographyTable: React.FC<GeographyTableProps> = ({
  countries,
  loading = false,
}) => {
  const totalVisitors =
    countries.reduce((sum, c) => sum + c.visitors, 0) || 1;

  return (
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50/90 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0 shadow-xs">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Top Countries
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Geographic distribution of your audience
              </p>
            </div>
          </div>

          <Link
            href="/geography"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors px-2.5 py-1 rounded-full bg-blue-50/60 border border-blue-100/60"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-3.5 bg-slate-200 rounded shrink-0" />
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-10 bg-slate-200 rounded" />
                    <div className="h-3.5 w-8 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1" />
              </div>
            ))}
          </div>
        ) : countries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No location data recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {countries.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.visitors / totalVisitors) * 100);

              return (
                <div key={index} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Flag + Name + Country Code */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-5 h-3.5 rounded-xs overflow-hidden shrink-0 shadow-2xs">
                        <CountryFlag code={item.country_code} />
                      </div>
                      <span className="font-bold text-slate-800 truncate block group-hover:text-blue-600 transition-colors">
                        {item.country}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold shrink-0">
                        {item.country_code}
                      </span>
                    </div>

                    {/* Right: Count + Percentage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {item.visitors.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-semibold w-8 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Blue Gradient Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
