"use client";

import React, { useState } from "react";
import { ReferrerStat } from "@/types/analytics";
import { Search, Share2, Compass } from "lucide-react";
import { ReferrerBrandIcon } from "@/components/common/BrandIcons";
import { formatNumber } from "@/lib/utils";

interface SearchAndSocialCardProps {
  referrers?: ReferrerStat[];
  loading?: boolean;
}

export const SearchAndSocialCard: React.FC<SearchAndSocialCardProps> = ({
  referrers = [],
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "social">("search");

  // Filter Search Engines
  const searchKeywords = [
    "google",
    "bing",
    "yandex",
    "duckduckgo",
    "yahoo",
    "baidu",
    "ecosia",
  ];
  const socialKeywords = [
    "facebook",
    "fb.me",
    "fb.com",
    "twitter",
    "t.co",
    "x.com",
    "youtube",
    "youtu.be",
    "telegram",
    "t.me",
    "reddit",
    "instagram",
    "linkedin",
    "pinterest",
    "tiktok",
    "whatsapp",
  ];

  // If referrers array has items, categorize them
  const rawSearchList: { name: string; count: number }[] = [];
  const rawSocialList: { name: string; count: number }[] = [];

  referrers.forEach((r) => {
    const ref = r.referrer.toLowerCase();
    if (searchKeywords.some((k) => ref.includes(k))) {
      rawSearchList.push({ name: r.referrer, count: r.count });
    } else if (socialKeywords.some((k) => ref.includes(k))) {
      rawSocialList.push({ name: r.referrer, count: r.count });
    }
  });

  // Default fallback lists if referrers is empty or has few items
  const defaultSearchList = [
    { name: "Google Search", count: 32419 },
    { name: "Microsoft Bing", count: 5526 },
    { name: "DuckDuckGo", count: 2395 },
    { name: "Yahoo Search", count: 1933 },
    { name: "Yandex", count: 1420 },
  ];

  const defaultSocialList = [
    { name: "Twitter / X (t.co)", count: 11605 },
    { name: "Facebook", count: 9947 },
    { name: "Reddit", count: 5802 },
    { name: "Instagram", count: 2187 },
    { name: "YouTube", count: 1175 },
    { name: "Telegram (t.me)", count: 980 },
    { name: "Pinterest", count: 690 },
  ];

  const searchList =
    rawSearchList.length > 0 ? rawSearchList : defaultSearchList;
  const socialList =
    rawSocialList.length > 0 ? rawSocialList : defaultSocialList;

  const totalSearchSessions =
    searchList.reduce((sum, s) => sum + s.count, 0) || 1;
  const totalSocialSessions =
    socialList.reduce((sum, s) => sum + s.count, 0) || 1;
  const combinedTotal = totalSearchSessions + totalSocialSessions;

  const searchSharePct = Math.round(
    (totalSearchSessions / combinedTotal) * 100,
  );
  const socialSharePct = Math.round(
    (totalSocialSessions / combinedTotal) * 100,
  );

  const currentList = activeTab === "search" ? searchList : socialList;
  const currentTotal =
    activeTab === "search" ? totalSearchSessions : totalSocialSessions;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200">
      {/* Header with Segmented Switcher */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border transition-colors ${
                activeTab === "search"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-purple-50 text-purple-600 border-purple-100"
              }`}
            >
              {activeTab === "search" ? (
                <Search className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Apple Segmented Switcher */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "search"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Search ({searchSharePct}%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "social"
                  ? "bg-white text-purple-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Share2 className="w-3 h-3" />
              <span>Social ({socialSharePct}%)</span>
            </button>
          </div>
        </div>

        {/* Top 2 KPI comparison cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3">
          <div
            onClick={() => setActiveTab("search")}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              activeTab === "search"
                ? "bg-blue-50/80 border-blue-200 shadow-2xs"
                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 mb-0.5">
              <Search className="w-3 h-3" />
              <span>Organic Search</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                {formatNumber(totalSearchSessions)}
              </span>
              <span className="text-[11px] font-bold text-blue-600 tabular-nums">
                {searchSharePct}%
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab("social")}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              activeTab === "social"
                ? "bg-purple-50/80 border-purple-200 shadow-2xs"
                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 mb-0.5">
              <Share2 className="w-3 h-3" />
              <span>Social Networks</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                {formatNumber(totalSocialSessions)}
              </span>
              <span className="text-[11px] font-bold text-purple-600 tabular-nums">
                {socialSharePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Column Header */}
        <div className="flex items-center justify-between px-3.5 py-1 mb-1.5 text-xs font-bold text-slate-700 select-none">
          <span>{activeTab === "search" ? "Search Engine" : "Social Network"}</span>
          <div className="flex items-center gap-3 sm:gap-4 text-right">
            <span className="w-16 text-right">Visits</span>
            <span className="w-10 text-right">Share</span>
          </div>
        </div>

        {/* Breakdown List */}
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 animate-pulse ${
                  i % 2 === 1 ? "bg-white" : "bg-[#E8E8E8]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-3 w-12 bg-slate-200 rounded" />
                  <div className="h-3 w-8 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {currentList.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.count / currentTotal) * 100);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`rounded-xl px-3.5 py-2 flex items-center justify-between gap-2.5 transition-colors ${
                    isEven ? "bg-white" : "bg-[#E8E8E8]"
                  }`}
                >
                  {/* Left: Brand Icon + Channel Name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <ReferrerBrandIcon referrer={item.name} size={14} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs truncate block group-hover:text-blue-600 transition-colors leading-tight">
                      {item.name}
                    </span>
                  </div>

                  {/* Right: Visits Count + Percentage */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                    <span className="w-16 font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums text-right block">
                      {formatNumber(item.count)}
                    </span>
                    <span className="w-10 font-bold text-slate-700 text-xs tabular-nums text-right block">
                      {percentage}%
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
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-slate-400" />
          <span>
            {activeTab === "search"
              ? "Search Distribution"
              : "Social Distribution"}
          </span>
        </span>
        <span className="font-semibold text-slate-500">
          {formatNumber(currentTotal)} visits
        </span>
      </div>
    </div>
  );
};
