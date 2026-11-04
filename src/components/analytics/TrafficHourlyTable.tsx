"use client";

import React from "react";
import { TrafficHourlyPoint } from "@/types/analytics";
import { formatCommas } from "@/lib/utils";

interface TrafficHourlyTableProps {
  hourly: TrafficHourlyPoint[];
  totalVisitors: number;
  totalPageviews: number;
  firstTimeVisitors: number;
  pagesPerVisit: number;
  newVisitorsRatio: number;
  avgBounceRate: number;
}

export const TrafficHourlyTable: React.FC<TrafficHourlyTableProps> = ({
  hourly,
  totalVisitors,
  totalPageviews,
  firstTimeVisitors,
  pagesPerVisit,
  newVisitorsRatio,
  avgBounceRate,
}) => {
  return (
    <div className="bg-white border border-[#c4d1db] rounded shadow-xs overflow-hidden mt-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-gradient-to-b from-[#eef2f6] to-[#dfe5eb] border-b border-[#c4d1db] text-slate-800 font-bold text-left">
              <th className="py-2 px-3 text-left w-28 whitespace-nowrap">Time</th>
              <th className="py-2 px-3 text-left min-w-[200px]">Visitors Graph</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Visitors</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Pages (Ppv )</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">newvis(%)</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">%Bounce</th>
            </tr>
          </thead>
          <tbody>
            {hourly.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const hasTraffic = row.visitors > 0;

              return (
                <tr
                  key={row.hour}
                  className={`border-b border-slate-200 hover:bg-blue-50/40 transition-colors ${
                    isEven ? "bg-white" : "bg-[#f8fafc]"
                  }`}
                >
                  {/* Time */}
                  <td className="py-1.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {row.time}
                  </td>

                  {/* Visitors Graph: Green bar + (pct) % */}
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      {hasTraffic && row.visitorsPct > 0 ? (
                        <div
                          className="h-3.5 rounded-2xs bg-[#8bc34a] border border-[#689f38] shadow-2xs transition-all"
                          style={{
                            width: `${Math.max(6, Math.min(100, row.visitorsPct * 1.4))}%`,
                            maxWidth: "140px",
                          }}
                        />
                      ) : null}
                      <span className="text-slate-700 text-[11px] font-medium whitespace-nowrap">
                        ({row.visitorsPct.toFixed(1)}) %
                      </span>
                    </div>
                  </td>

                  {/* Visitors */}
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                    {hasTraffic ? formatCommas(row.visitors) : "0"}
                  </td>

                  {/* Pages (Ppv ) */}
                  <td className="py-1.5 px-3 text-right text-slate-800 whitespace-nowrap">
                    {hasTraffic ? (
                      <>
                        <span className="font-bold">{formatCommas(row.pageviews)}</span>{" "}
                        <span className="text-slate-600 font-medium">({row.ppv.toFixed(2)})</span>
                      </>
                    ) : (
                      "0 (0)"
                    )}
                  </td>

                  {/* newvis(%) */}
                  <td className="py-1.5 px-3 text-right text-slate-800 whitespace-nowrap">
                    {hasTraffic ? (
                      <>
                        <span className="font-bold">{formatCommas(row.firstTimeVisitors)}</span>{" "}
                        <span className="text-slate-600 font-medium">({row.newvisPct} %)</span>
                      </>
                    ) : (
                      "0 (0 %)"
                    )}
                  </td>

                  {/* %Bounce */}
                  <td className="py-1.5 px-3 text-right font-medium text-slate-800 whitespace-nowrap">
                    {hasTraffic ? `${row.bounceRate.toFixed(1)} %` : "0 %"}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer Total Row */}
          <tfoot>
            <tr className="bg-gradient-to-b from-[#eef2f6] to-[#dfe5eb] border-t-2 border-[#c4d1db] text-slate-900 font-black">
              <td className="py-2 px-3 text-left font-extrabold uppercase tracking-wide">
                Total
              </td>
              <td className="py-2 px-3">
                <span className="text-[11px] font-bold text-slate-600">(100.0) %</span>
              </td>
              <td className="py-2 px-3 text-right font-extrabold">
                {formatCommas(totalVisitors)}
              </td>
              <td className="py-2 px-3 text-right font-extrabold">
                {formatCommas(totalPageviews)}{" "}
                <span className="text-slate-700 font-bold">({pagesPerVisit.toFixed(2)})</span>
              </td>
              <td className="py-2 px-3 text-right font-extrabold">
                {formatCommas(firstTimeVisitors)}{" "}
                <span className="text-slate-700 font-bold">({newVisitorsRatio.toFixed(0)} %)</span>
              </td>
              <td className="py-2 px-3 text-right font-extrabold">
                {avgBounceRate.toFixed(1)} %
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
