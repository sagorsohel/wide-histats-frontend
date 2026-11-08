"use client";

import React from "react";
import Link from "next/link";
import { AnalycosLogo } from "@/components/common/AnalycosLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-100 bg-white py-8">
      <div className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <AnalycosLogo size={18} animated={true} speed="fast" />
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

