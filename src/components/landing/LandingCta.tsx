"use client";

import React from "react";
import Link from "next/link";
import { CountryFlag } from "@/components/common/CountryFlag";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Eye,
  Users,
  Clock,
  Radio,
} from "lucide-react";

export const LandingCta: React.FC = () => {
  return (
    <section className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Container Card with Soft Gradient & Clean 2-Column Split */}
      <div className="bg-gradient-to-br from-[#eff6ff] via-[#f6faff] to-[#edf4fc] rounded-[32px] border border-blue-100 p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        {/* ======================================================== */}
        {/* LEFT COLUMN: Heading, Subtitle & Action Buttons          */}
        {/* ======================================================== */}
        <div className="w-full lg:max-w-xl shrink-0 z-10 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0f172a] tracking-[-0.02em] leading-[1.14] mb-4">
            Ready to Transform Your
            <br />
            <span className="text-[#0052ff]">Website Insights?</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg font-normal">
            Experience the next generation of real-time web analytics. Start
            tracking active visitors, pageviews, and global traffic sources in
            under two minutes.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0052ff] hover:bg-[#0045d6] text-white text-sm sm:text-base font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#0052ff] hover:text-[#0040c7] transition-colors group cursor-pointer"
            >
              <span>Explore live demo</span>
              <ArrowUpRight className="w-4 h-4 text-[#0052ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: System Analytics UI Mockup / SVG Card      */}
        {/* ======================================================== */}
        <div className="w-full lg:w-auto flex-1 flex items-center justify-center lg:justify-end z-10">
          <div className="w-full max-w-[380px] sm:max-w-[410px] bg-white rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 transition-transform hover:-translate-y-1">
            {/* Top Period Selector Pills */}
            <div className="flex items-center justify-between bg-slate-50 p-1 rounded-xl mb-5 border border-slate-100 text-xs font-semibold">
              <span className="flex-1 py-1.5 text-center text-slate-500 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
              <span className="flex-1 py-1.5 text-center bg-white text-[#0052ff] rounded-lg shadow-2xs font-bold">
                Daily
              </span>
              <span className="flex-1 py-1.5 text-center text-slate-500">
                Monthly
              </span>
            </div>

            {/* 2x2 Analytics Metric Grid (Exact Style from Image) */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Stat 1: Live Users */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#f8fbff] border border-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 truncate">
                    Live Users
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  1,664
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>●</span>
                  <span>Active right now</span>
                </div>
              </div>

              {/* Stat 2: Page Views */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#f8fbff] border border-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 truncate">
                    Pageviews
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  25,529
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Today total
                </div>
              </div>

              {/* Stat 3: Visitors */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#f8fbff] border border-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 truncate">
                    Visitors
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  13,220
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Unique hosts
                </div>
              </div>

              {/* Stat 4: Avg. Time */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#f8fbff] border border-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 truncate">
                    Avg. Time
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  2m 34s
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Per session
                </div>
              </div>
            </div>

            {/* Bottom Live Feed / Mini Telemetry Stream */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>Real-time Stream</span>
                </span>
                <span className="text-[10px] font-bold text-[#0052ff]">
                  Live feed
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <CountryFlag code="US" countryName="United States" size="sm" />
                    <span className="font-mono text-slate-700 truncate">
                      /live-match-score
                    </span>
                  </div>
                  <span className="text-emerald-600 font-bold shrink-0">
                    +1 hit
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <CountryFlag code="GB" countryName="United Kingdom" size="sm" />
                    <span className="font-mono text-slate-700 truncate">
                      /popular-pages
                    </span>
                  </div>
                  <span className="text-emerald-600 font-bold shrink-0">
                    +1 hit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
