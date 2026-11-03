"use client";

import React from "react";
import { CountryStat } from "@/types/analytics";
import { Globe2 } from "lucide-react";
import { CountryFlag } from "@/components/common/CountryFlag";

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
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Top Countries</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic distribution of your audience
          </p>
        </div>
        <Globe2 className="w-4 h-4 text-[#1d5b9f]" />
      </div>

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
                  <div className="h-3.5 w-12 bg-slate-200 rounded" />
                  <div className="h-3.5 w-8 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-slate-200 h-full rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No location data recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {countries.map((item, index) => {
            const percentage = Math.round((item.visitors / totalVisitors) * 100);

            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag code={item.country_code} size="md" />
                    <span className="font-semibold text-slate-800">
                      {item.country}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {item.country_code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.visitors}</span>
                    <span className="text-slate-500 text-[11px] w-9 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1d5b9f] to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
