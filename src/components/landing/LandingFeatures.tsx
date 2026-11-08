"use client";

import React from "react";
import { Zap, Link2, BarChart3, FileText } from "lucide-react";

export const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Top Split Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Less noise.
            <br />
            More understanding.
          </h2>
        </div>
        <div className="md:max-w-md">
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            The essential insights you need to understand your audience, discover what drives traffic, and focus on what works.
          </p>
        </div>
      </div>

      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: See visitors live */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b5fc9] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">
              See visitors live
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Watch your website activity in real time and see how many are on your site now.
            </p>
          </div>

          {/* Mini Preview Box */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online now</span>
              </div>
              <div className="text-2xl font-black text-slate-900">128</div>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-8">
              {[40, 65, 30, 85, 45, 90, 70, 100, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-[#1b5fc9] rounded-t-sm"
                  style={{ height: `${h}%`, opacity: 0.35 + (i * 0.08) }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Discover what brings them */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b5fc9] flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">
              Discover what brings them
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              See where your visitors come from, from search and social to direct traffic.
            </p>
          </div>

          {/* Mini Preview Box */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-2.5">
            {[
              { label: "Organic search", width: "70%", pct: "58.4%" },
              { label: "Direct", width: "40%", pct: "24.7%" },
              { label: "Referrals", width: "20%", pct: "8.6%" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-600 font-medium w-24 truncate">
                  {item.label}
                </span>
                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#1b5fc9] h-full rounded-full"
                    style={{ width: item.width }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-bold shrink-0">
                  {item.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Find what works */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b5fc9] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">
              Find what works
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              See which pages get the most attention and identify what resonates with visitors.
            </p>
          </div>

          {/* Mini Preview Box */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-2">
            {[
              { path: "/", val: "9,421" },
              { path: "/features", val: "4,318" },
              { path: "/blog/analytics-tips", val: "2,893" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px]">{p.path}</span>
                </div>
                <span className="font-semibold text-slate-700 text-xs">{p.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

