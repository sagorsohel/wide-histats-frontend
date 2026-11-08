"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnalycosLogo } from "@/components/common/AnalycosLogo";

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100/80 transition-all">
      <div className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AnalycosLogo size={32} animated={true} speed="normal" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Analycos
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="#features"
            className="hover:text-slate-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-slate-900 transition-colors"
          >
            How it works
          </a>
          <a href="#faq" className="hover:text-slate-900 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-800 hover:text-slate-950 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-2.5 rounded-xl bg-[#0052ff] hover:bg-[#0045d6] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            Start for free
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-slide-down">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              How it works
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-[#1b5fc9] hover:bg-[#164fac] text-white text-sm font-bold shadow-sm"
            >
              Start for free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
