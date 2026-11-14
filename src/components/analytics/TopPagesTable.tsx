"use client";

import React from "react";
import { PageStat } from "@/types/analytics";
import { FileText, ArrowRight } from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";
import Link from "next/link";
import { useWebsite } from "@/context/WebsiteContext";
import { getSite7DigitId } from "@/lib/utils";

interface TopPagesTableProps {
  pages: PageStat[];
  domain?: string;
  loading?: boolean;
}

export const TopPagesTable: React.FC<TopPagesTableProps> = ({
  pages,
  domain,
  loading = false,
}) => {
  const { selectedWebsite } = useWebsite();
  const site7Digit = getSite7DigitId(selectedWebsite);
  const pagesHref = site7Digit ? `/pages/?id=${site7Digit}` : "/pages";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                Top Pages
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Most visited URLs across your site
              </p>
            </div>
          </div>

          <Link
            href={pagesHref}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#eef2ff] text-blue-700 border border-blue-200/60 hover:bg-blue-100/80 transition-colors shadow-2xs shrink-0 whitespace-nowrap"
          >
            <span>{loading ? "..." : `${pages.length} recorded`}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Fixed Column Header */}
        <div className="flex items-center justify-between px-3.5 py-1 mb-1.5 text-xs font-bold text-slate-700 select-none">
          <span>Pages</span>
          <div className="flex items-center gap-6 sm:gap-8 text-right">
            <span className="w-16 text-right">Views</span>
            <span className="w-16 text-right">Visitors</span>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 animate-pulse ${
                  i % 2 === 1 ? "bg-white" : "bg-[#E8E8E8]"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                  <div className="h-3 bg-slate-200 rounded w-3/4 max-w-[280px]" />
                </div>
                <div className="flex items-center gap-6 sm:gap-8 shrink-0">
                  <div className="h-3.5 w-14 bg-slate-200 rounded" />
                  <div className="h-3.5 w-14 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No pageviews recorded yet.
          </div>
        ) : (
          <div className="space-y-1">
            {pages.slice(0, 6).map((page, index) => {
              const cleanDomain = domain
                ? domain.startsWith("http")
                  ? domain
                  : `https://${domain}`
                : "";
              const fullLink =
                page.url ||
                `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;
              const displayUrl = fullLink;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 transition-colors ${
                    isEven ? "bg-white" : "bg-[#E8E8E8]"
                  }`}
                >
                  {/* Left: Rank + Favicon + Full URL */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-4 text-center font-bold text-slate-500 text-xs shrink-0 font-mono">
                      {index + 1}
                    </span>

                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                      <WebsiteFavicon
                        url={fullLink}
                        domain={domain}
                        size={14}
                        className="rounded-xs shadow-2xs"
                      />
                    </div>

                    <a
                      href={fullLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={fullLink}
                      className="font-bold text-slate-800 hover:text-blue-600 font-mono text-xs truncate block tracking-tight transition-colors leading-tight min-w-0"
                    >
                      {displayUrl}
                    </a>
                  </div>

                  {/* Right: Views & Visitors */}
                  <div className="flex items-center gap-6 sm:gap-8 shrink-0 text-right">
                    <span className="w-16 font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums block text-right">
                      {page.pageviews.toLocaleString()}
                    </span>
                    <span className="w-16 font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums block text-right">
                      {(
                        page.visitors || Math.round(page.pageviews * 0.65)
                      ).toLocaleString()}
                    </span>
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
