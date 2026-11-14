"use client";

import React from "react";
import Link from "next/link";
import { AnalycosLogo } from "@/components/common/AnalycosLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="desktop-footer w-full bg-white border-t border-slate-200/90 shrink-0 select-none mt-auto">
      <div className="h-10 px-3 sm:px-5 flex items-center justify-between gap-3 text-[11px] text-slate-500">
        {/* Left: Brand & Telemetry Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 shrink-0">
            <AnalycosLogo size={14} animated={false} />
            <span className="font-extrabold tracking-tight">Analycos</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px]">Telemetry Engine Active</span>
          </div>

          <span className="text-slate-300">•</span>

          <span className="text-slate-400 text-[10.5px] truncate">
            &copy; {new Date().getFullYear()} Analycos Analytics
          </span>
        </div>

        {/* Right: Quick Links & Version */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-medium text-[10.5px]">
          <Link
            href="/documentation"
            className="hover:text-[#1455bb] transition-colors"
          >
            Docs
          </Link>
          <span className="text-slate-200">•</span>
          <Link
            href="/privacy"
            className="hover:text-[#1455bb] transition-colors"
          >
            Privacy
          </Link>
          <span className="text-slate-200">•</span>
          <Link
            href="/terms"
            className="hover:text-[#1455bb] transition-colors"
          >
            Terms
          </Link>
          <span className="text-slate-200 hidden sm:inline">•</span>
          <a
            href="mailto:support@analycos.com"
            className="hover:text-[#1455bb] transition-colors hidden sm:inline"
          >
            Support
          </a>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 font-mono text-[9px] font-bold">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            v2.4
          </span>
        </div>
      </div>
    </footer>
  );
};

