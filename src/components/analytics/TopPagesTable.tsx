"use client";

import React from "react";
import { PageStat } from "@/types/analytics";
import { FileText, ArrowRight } from "lucide-react";
import { WebsiteFavicon } from "@/components/common/WebsiteFavicon";
import Link from "next/link";

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
  return (
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50/90 text-purple-600 border border-purple-100/80 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Top Pages
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Most visited URLs across your site
              </p>
            </div>
          </div>

          <Link
            href="/pages"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors px-2.5 py-1 rounded-full bg-blue-50/60 border border-blue-100/60"
          >
            <span>{loading ? "..." : `${pages.length} recorded`}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-2xl border border-slate-100 bg-white/50 flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                  <div className="h-3.5 bg-slate-200 rounded w-3/4 max-w-[240px]" />
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="h-5 w-12 bg-slate-200 rounded" />
                  <div className="h-5 w-12 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No pageviews recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
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
                  className="flex items-center justify-between p-2 hover:bg-slate-50/70 rounded-2xl transition-all duration-200 gap-3 group"
                >
                  {/* Left: Rank + Real Favicon + URL */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-4 text-center font-bold text-slate-400 text-xs shrink-0 font-mono">
                      {index + 1}
                    </span>

                    {/* Official Website Favicon */}
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                      <WebsiteFavicon
                        url={fullLink}
                        domain={domain}
                        size={15}
                        className="rounded-xs shadow-2xs"
                      />
                    </div>

                    <a
                      href={fullLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={fullLink}
                      className="font-bold text-slate-800 hover:text-blue-600 font-mono text-xs truncate block tracking-tight transition-colors"
                    >
                      {displayUrl}
                    </a>
                  </div>

                  {/* Right: Views & Visitors columns */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                    <div className="min-w-[48px]">
                      <span className="font-extrabold text-slate-900 text-xs block tabular-nums">
                        {page.pageviews.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        views
                      </span>
                    </div>

                    <div className="min-w-[48px]">
                      <span className="font-extrabold text-slate-900 text-xs block tabular-nums">
                        {(
                          page.visitors || Math.round(page.pageviews * 0.65)
                        ).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
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
