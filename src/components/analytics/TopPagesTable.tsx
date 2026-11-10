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
  const pagesHref = site7Digit
    ? `/pages/?id=${site7Digit}`
    : "/pages";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 gap-2.5">
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
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 shadow-2xs shrink-0 whitespace-nowrap"
          >
            <span>{loading ? "..." : `${pages.length} recorded`}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 rounded-xl border border-slate-100 bg-white/50 flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-3.5 h-3.5 bg-slate-200 rounded shrink-0" />
                  <div className="h-3 bg-slate-200 rounded w-3/4 max-w-[240px]" />
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="h-4 w-10 bg-slate-200 rounded" />
                  <div className="h-4 w-10 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No pageviews recorded yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {pages.slice(0, 6).map((page, index) => {
              const cleanDomain = domain
                ? domain.startsWith("http")
                  ? domain
                  : `https://${domain}`
                : "";
              const fullLink =
                page.url ||
                `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;

              // Format display path (let CSS truncate naturally fill full width)
              const displayUrl = fullLink;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-slate-100/90 bg-white/70 hover:bg-white hover:border-slate-200/90 transition-all duration-150 gap-2.5 group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  {/* Left: Rank + Real Favicon + URL */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-3.5 text-center font-bold text-slate-400 text-[11px] shrink-0 font-mono">
                      {index + 1}
                    </span>

                    {/* Official Website Favicon */}
                    <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
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
                      className="font-bold text-slate-800 hover:text-blue-600 font-mono text-xs truncate block tracking-tight transition-colors leading-tight"
                    >
                      {displayUrl}
                    </a>
                  </div>

                  {/* Right: Views & Visitors columns */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                    <div className="min-w-[42px]">
                      <span className="font-extrabold text-slate-900 text-xs block tabular-nums leading-tight">
                        {page.pageviews.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium leading-tight">
                        views
                      </span>
                    </div>

                    <div className="min-w-[42px]">
                      <span className="font-extrabold text-slate-900 text-xs block tabular-nums leading-tight">
                        {(
                          page.visitors || Math.round(page.pageviews * 0.65)
                        ).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium leading-tight">
                        visitors
                      </span>
                    </div>
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
