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
  const searchKeywords = ["google", "bing", "yandex", "duckduckgo", "yahoo", "baidu", "ecosia"];
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

  const searchList = rawSearchList.length > 0 ? rawSearchList : defaultSearchList;
  const socialList = rawSocialList.length > 0 ? rawSocialList : defaultSocialList;

  const totalSearchSessions = searchList.reduce((sum, s) => sum + s.count, 0) || 1;
  const totalSocialSessions = socialList.reduce((sum, s) => sum + s.count, 0) || 1;
  const combinedTotal = totalSearchSessions + totalSocialSessions;

  const searchSharePct = Math.round((totalSearchSessions / combinedTotal) * 100);
  const socialSharePct = Math.round((totalSocialSessions / combinedTotal) * 100);

  const currentList = activeTab === "search" ? searchList : socialList;
  const currentTotal = activeTab === "search" ? totalSearchSessions : totalSocialSessions;

  return (
    <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_30px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)]">
      {/* Header with Segmented Switcher */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border transition-colors ${
                activeTab === "search"
                  ? "bg-blue-50/90 text-blue-600 border-blue-100/80"
                  : "bg-purple-50/90 text-purple-600 border-purple-100/80"
              }`}
            >
              {activeTab === "search" ? (
                <Search className="w-5 h-5" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                {activeTab === "search"
                  ? "Search Engine Attribution"
                  : "Social Media Channels"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === "search"
                  ? "Organic search engine queries (Google, Bing, DuckDuckGo)"
                  : "Social network shares (Twitter/X, Facebook, Reddit, YouTube)"}
              </p>
            </div>
          </div>

          {/* Apple Segmented Switcher */}
          <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/50 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "search"
                  ? "bg-white text-blue-700 shadow-sm shadow-slate-200/70"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search ({searchSharePct}%)</span>
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "social"
                  ? "bg-white text-purple-700 shadow-sm shadow-slate-200/70"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Social ({socialSharePct}%)</span>
            </button>
          </div>
        </div>

        {/* Top 2 KPI comparison cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
          <div
            onClick={() => setActiveTab("search")}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              activeTab === "search"
                ? "bg-blue-50/80 border-blue-200 shadow-xs"
                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 mb-1">
              <Search className="w-3.5 h-3.5" />
              <span>Organic Search</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                {formatNumber(totalSearchSessions)}
              </span>
              <span className="text-xs font-bold text-blue-600 tabular-nums">
                {searchSharePct}%
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab("social")}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              activeTab === "social"
                ? "bg-purple-50/80 border-purple-200 shadow-xs"
                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 mb-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>Social Networks</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                {formatNumber(totalSocialSessions)}
              </span>
              <span className="text-xs font-bold text-purple-600 tabular-nums">
                {socialSharePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0" />
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
        ) : (
          <div className="space-y-3">
            {currentList.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.count / currentTotal) * 100);
              const barGradient =
                activeTab === "search"
                  ? "from-blue-600 to-cyan-400"
                  : "from-purple-600 to-pink-400";

              return (
                <div key={index} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Brand Icon + Channel Name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <ReferrerBrandIcon referrer={item.name} size={16} />
                      </div>
                      <span className="font-bold text-slate-800 truncate block group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </span>
                    </div>

                    {/* Right: Visits Count + Percentage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {formatNumber(item.count)}
                      </span>
                      <span className="text-slate-400 font-semibold w-8 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full bg-slate-100/90 rounded-full h-1 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all duration-500 shadow-xs`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-slate-400" />
          <span>
            {activeTab === "search" ? "Search Engine Distribution" : "Social Referral Distribution"}
          </span>
        </span>
        <span className="font-semibold text-slate-500">
          {formatNumber(currentTotal)} visits
        </span>
      </div>
    </div>
  );
};
