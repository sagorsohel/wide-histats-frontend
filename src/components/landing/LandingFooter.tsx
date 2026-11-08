"use client";

import React from "react";
import Link from "next/link";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-100 bg-white py-8">
      <div className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <div className="w-4 h-4 relative flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-4 h-4 -rotate-90">
                <circle cx="18" cy="18" r="13" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="18" cy="18" r="13" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="25 75" />
                <circle cx="18" cy="18" r="13" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-25" />
                <circle cx="18" cy="18" r="13" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-50" />
                <circle cx="18" cy="18" r="13" fill="none" stroke="#eab308" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-75" />
              </svg>
            </div>
            <span>Analycos</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Analycos. All rights reserved.</span>
        </div>

        {/* Right: Legal & Contact */}
        <div className="flex items-center gap-6 font-medium">
          <Link href="/privacy" className="hover:text-slate-800 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-800 transition-colors">
            Terms
          </Link>
          <a
            href="mailto:support@analycos.com"
            className="hover:text-slate-800 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

