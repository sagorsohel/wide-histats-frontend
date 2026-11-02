"use client";

import React from "react";
import { PageStat } from "@/types/analytics";
import { FileText, ExternalLink } from "lucide-react";

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
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-80 flex items-center justify-center text-muted-foreground text-sm">
        Loading top pages...
      </div>
    );
  }

  const maxViews = pages.length > 0 ? Math.max(...pages.map((p) => p.pageviews)) : 1;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Top Pages</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Most visited URLs across your site
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {pages.length} recorded
        </span>
      </div>

      {pages.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No pageviews recorded yet.
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page, index) => {
            const percentage = Math.round((page.pageviews / maxViews) * 100);

            const cleanDomain = domain ? (domain.startsWith("http") ? domain : `https://${domain}`) : "https://streamespn.org";
            const fullLink = page.url || `${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;

            return (
              <div key={index} className="group relative">
                {/* Background relative progress bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500/10 rounded-lg pointer-events-none transition-all group-hover:bg-blue-500/15"
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative flex items-center justify-between p-2.5 rounded-lg text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 text-slate-400 font-mono font-bold text-[11px] shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-[#1d5b9f]" />
                        <a
                          href={fullLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={fullLink}
                          className="font-bold text-slate-800 hover:text-[#1d5b9f] hover:underline font-mono text-xs truncate block"
                        >
                          {fullLink}
                        </a>
                      </div>
                      {page.title && (
                        <div
                          title={page.title}
                          className="text-[11px] text-slate-600 truncate block font-sans"
                        >
                          {page.title}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 text-right">
                    <div>
                      <div className="font-extrabold text-slate-900 tabular-nums">
                        {page.pageviews}
                      </div>
                      <div className="text-[10px] text-slate-500">views</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-bold text-slate-700 tabular-nums">
                        {page.visitors}
                      </div>
                      <div className="text-[10px] text-slate-500">visitors</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
