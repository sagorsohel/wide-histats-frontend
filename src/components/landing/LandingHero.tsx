"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const LandingHero: React.FC = () => {
  return (
    <section className="pt-14 sm:pt-20 pb-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* 1. Top Freestanding Badge (No border, pure green dot + tracking-wider uppercase text) */}
      <div className="flex items-center justify-center gap-2.5 mb-6 text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-[#00c982] shrink-0" />
        <span>Website analytics, simplified</span>
      </div>

      {/* 2. Main Bold Headline (Know your audience. Grow with clarity.) */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black text-[#0f172a] tracking-[-0.03em] leading-[1.08] mb-6">
        Know your audience.
        <br />
        Grow with <span className="text-[#0052ff]">clarity.</span>
      </h1>

      {/* 3. Subtitle (Two lines centered) */}
      <p className="text-slate-600 text-base sm:text-lg md:text-[19px] max-w-xl mx-auto leading-relaxed mb-9 font-normal">
        Simple, real-time insights into your visitors,
        <br className="hidden sm:inline" /> pages, and traffic sources.
      </p>

      {/* 4. Action Buttons (Solid Blue Rounded-XL Button + Blue Text Link with Arrow) */}
      <div className="flex flex-row items-center justify-center gap-5 sm:gap-7 mb-5">
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-xl bg-[#0052ff] hover:bg-[#0045d6] text-white text-sm sm:text-base font-bold shadow-xs hover:shadow-md transition-all active:scale-95 group cursor-pointer"
        >
          <span>Start tracking for free</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#0052ff] hover:text-[#0040c7] transition-colors group cursor-pointer"
        >
          <span>Explore demo</span>
          <ArrowUpRight className="w-4 h-4 text-[#0052ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* 5. Micro Copy */}
      <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
        Quick setup. Clear insights.
      </p>
    </section>
  );
};
