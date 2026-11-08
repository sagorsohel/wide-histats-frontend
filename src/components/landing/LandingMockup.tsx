"use client";

import React from "react";
import { CountryFlag } from "@/components/common/CountryFlag";
import { AnalycosLogo } from "@/components/common/AnalycosLogo";
import {
  Search,
  Compass,
  Share2,
  Users,
  Folder,
  Calendar,
  ChevronDown,
} from "lucide-react";

export const LandingMockup: React.FC = () => {
  return (
    <section className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">
      {/* Floating Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] p-4 sm:p-7 transition-all hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.12)]">
        {/* Mockup Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <AnalycosLogo size={20} animated={true} speed="normal" />
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">Analycos</span>
            </div>

            {/* Site selector dropdown pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>example.com</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Demo data badge */}
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold">
              Demo data
            </span>
          </div>

          {/* Right: Date Picker */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last 7 days</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-100">
          {/* 1. Online now */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online now</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              128
            </div>
          </div>

          {/* 2. Visitors */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Visitors</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              13,576
            </div>
          </div>

          {/* 3. Pageviews */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Pageviews</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              26,221
            </div>
          </div>

          {/* 4. Avg. visit */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Avg. visit</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              2m 34s
            </div>
          </div>
        </div>

        {/* Line Chart Area */}
        <div className="pt-6 pb-6 border-b border-slate-100">
          <div className="relative w-full h-48 sm:h-56">
            <svg
              viewBox="0 0 700 200"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="40" y1="20" x2="690" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="690" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="690" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="690" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="180" x2="690" y2="180" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y-Axis Value Labels */}
              <text x="32" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">6,000</text>
              <text x="32" y="64" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">5,000</text>
              <text x="32" y="104" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">4,000</text>
              <text x="32" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">3,000</text>
              <text x="32" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">0</text>

              {/* Area Gradient Fill */}
              <path
                d="M 60 110 Q 150 95, 250 100 T 450 90 T 550 50 T 670 65 L 670 180 L 60 180 Z"
                fill="url(#heroChartGrad)"
              />

              {/* Smooth Spline Curve */}
              <path
                d="M 60 110 Q 150 95, 250 100 T 450 90 T 550 50 T 670 65"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { x: 60, y: 110 },
                { x: 160, y: 98 },
                { x: 260, y: 100 },
                { x: 360, y: 102 },
                { x: 460, y: 90 },
                { x: 560, y: 50 },
                { x: 670, y: 65 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-white stroke-[#2563eb] stroke-[2.5]"
                />
              ))}
            </svg>
          </div>

          {/* X-axis date labels */}
          <div className="flex justify-between pl-10 pr-2 pt-2 text-[11px] text-slate-400 font-medium">
            <span>Apr 10</span>
            <span>Apr 11</span>
            <span>Apr 12</span>
            <span>Apr 13</span>
            <span>Apr 14</span>
            <span>Apr 15</span>
            <span>Apr 16</span>
          </div>
        </div>

        {/* Bottom Two Columns: Traffic Sources & Countries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* 1. Traffic Sources */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3.5">
              Traffic sources
            </h4>
            <div className="space-y-2.5 text-xs">
              {[
                { label: "Organic search", icon: Search, pct: 58.4, val: "7,923", width: "58%" },
                { label: "Direct", icon: Compass, pct: 24.7, val: "3,354", width: "25%" },
                { label: "Referrals", icon: Share2, pct: 8.6, val: "1,167", width: "9%" },
                { label: "Social", icon: Users, pct: 6.1, val: "829", width: "6%" },
                { label: "Other", icon: Folder, pct: 2.2, val: "303", width: "2%" },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-slate-600 font-medium">
                      <IconComponent className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#1b5fc9] h-full rounded-full"
                        style={{ width: item.width }}
                      />
                    </div>

                    <div className="w-12 text-right text-slate-500 font-medium shrink-0">
                      {item.pct}%
                    </div>
                    <div className="w-12 text-right text-slate-700 font-semibold shrink-0">
                      {item.val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Countries */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3.5">
              Countries
            </h4>
            <div className="space-y-2.5 text-xs">
              {[
                { code: "US", label: "United States", pct: "41.9%", val: "5,690" },
                { code: "GB", label: "United Kingdom", pct: "11.8%", val: "1,598" },
                { code: "DE", label: "Germany", pct: "7.6%", val: "1,035" },
                { code: "CA", label: "Canada", pct: "5.9%", val: "797" },
                { code: "others", label: "Others", pct: "32.8%", val: "4,456" },
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <CountryFlag code={c.code} countryName={c.label} size="sm" />
                    <span>{c.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-medium w-12 text-right">
                      {c.pct}
                    </span>
                    <span className="text-slate-700 font-semibold w-12 text-right">
                      {c.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

