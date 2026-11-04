"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { NAV_GROUPS } from "@/components/layout/Sidebar";
import {
  Globe,
  Plus,
  Code,
  LogOut,
  ChevronDown,
  Activity,
  Check,
  ExternalLink,
  Menu,
  X,
  Sliders,
  LayoutGrid,
} from "lucide-react";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto close mobile drawer on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === "/" || pathname === "/login";
  const isControlPanel =
    pathname === "/control-panel" || pathname === "/websites";

  const { user, logout } = useAuth();
  const { websites, selectedWebsite, setSelectedWebsite, openTrackingModal } =
    useWebsite();

  return (
    <>
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs shrink-0">
        <div className="h-16 px-3 sm:px-4 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Hamburger + Brand & Desktop Website Selector */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
            {/* Mobile Menu Hamburger (Only when inside a website with sidebar) */}
            {mounted && !isAuthPage && !isControlPanel && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0 cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-800" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-800" />
                )}
              </button>
            )}

            {/* Logo & Brand */}
            <Link
              href={isAuthPage ? "/" : "/control-panel"}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#1d5b9f] to-[#2563eb] flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 text-sm sm:text-base">
                W
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Wide-Histat
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#1d5b9f] border border-blue-200">
                  Live
                </span>
              </div>
            </Link>

            {/* Desktop Control Panel & Website Selector */}
            {mounted && !isAuthPage && (
              <div className="hidden md:flex items-center gap-2">
                {/* Control Panel Button */}
                <Link
                  href="/control-panel"
                  title="Open Control Panel (All Websites)"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs ${
                    pathname === "/control-panel" || pathname === "/websites"
                      ? "bg-[#1d5b9f] text-white border-[#1d5b9f]"
                      : "bg-[#f0f4f9] hover:bg-[#e2eaf5] text-[#1d5b9f] border-[#bcd0e8]"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Control panel</span>
                </Link>

                {/* Active Website Indicator (Read-Only - Cannot be changed from here) */}
                {selectedWebsite && (
                  <div className="flex items-center gap-1.5">
                    <div
                      title={`Active Website: ${selectedWebsite.name} (${selectedWebsite.domain})`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold shadow-2xs select-none"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#1d5b9f] shrink-0" />
                      <span className="max-w-[120px] lg:max-w-[170px] truncate">
                        {selectedWebsite.name}
                      </span>
                    </div>

                    {/* Direct Open Link in New Tab */}
                    <a
                      href={
                        selectedWebsite.domain.startsWith("http")
                          ? selectedWebsite.domain
                          : `https://${selectedWebsite.domain}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open ${selectedWebsite.domain} in new tab`}
                      className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#1d5b9f] transition-all flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tracking Code Snippet Button (Desktop - only when inside a website) */}
            {mounted && !isAuthPage && !isControlPanel && selectedWebsite && (
              <button
                onClick={() => openTrackingModal(selectedWebsite)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1d5b9f]/30 bg-[#1d5b9f]/10 text-[#1d5b9f] hover:bg-[#1d5b9f]/20 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Tracking Code</span>
              </button>
            )}

            {/* User Account Dropdown */}
            {!mounted ? (
              <div className="w-8 h-8 rounded-full bg-slate-100" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1d5b9f] to-indigo-600 border border-blue-400 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-2xl p-1.5 z-50 animate-slide-down">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-semibold text-sm text-slate-800 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {user.email}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/websites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Manage Websites
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={async () => {
                            await logout();
                            setUserDropdownOpen(false);
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg bg-[#1d5b9f] hover:bg-[#174880] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Sub-Header: Current Website Indicator + Control Panel Button */}
        {mounted && !isAuthPage && !isControlPanel && selectedWebsite && (
          <div className="md:hidden border-t border-slate-200/80 bg-gradient-to-r from-[#f0f4f9] via-[#f8fafc] to-[#f0f4f9] px-3 py-1.5 flex items-center justify-between gap-2 shadow-2xs">
            {/* Left: Active Website Pill with Pulsing Live Dot */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0">
                Site:
              </span>
              <div
                title={`Current Website: ${selectedWebsite.name} (${selectedWebsite.domain})`}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-300 shadow-2xs min-w-0 max-w-[170px] sm:max-w-[220px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedWebsite.name || selectedWebsite.domain}
                </span>
              </div>
              <a
                href={
                  selectedWebsite.domain.startsWith("http")
                    ? selectedWebsite.domain
                    : `https://${selectedWebsite.domain}`
                }
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${selectedWebsite.domain}`}
                className="p-1 rounded text-slate-400 hover:text-[#1d5b9f] hover:bg-slate-200/60 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right: One-Tap Control Panel Button */}
            <Link
              href="/control-panel"
              title="Open Websites Control Panel"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Control panel</span>
            </Link>
          </div>
        )}

        {/* Mobile Sub-Header on Control Panel page */}
        {mounted && !isAuthPage && isControlPanel && (
          <div className="md:hidden border-t border-slate-200/80 bg-[#f8fafc] px-3 py-1.5 flex items-center justify-between gap-2 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Sliders className="w-3.5 h-3.5 text-[#1d5b9f]" />
              <span>Websites Control Panel</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1d5b9f] font-bold text-[11px] border border-blue-200">
              {websites.length} websites
            </span>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation (Visible on phones & tablets when open) */}
      {mounted && !isAuthPage && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1d5b9f] to-[#2563eb] flex items-center justify-center text-white font-black text-sm">
                  W
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900">
                    Wide-Histat
                  </span>
                  <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-blue-100 text-[#1d5b9f]">
                    Mobile
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Website Indicator (Read-Only) */}
            {selectedWebsite && (
              <div className="p-3 border-b border-slate-200 bg-blue-50/50 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Current Website
                </div>

                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-[#1d5b9f] shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">
                        {selectedWebsite.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {selectedWebsite.domain}
                      </div>
                    </div>
                  </div>
                  <a
                    href={
                      selectedWebsite.domain.startsWith("http")
                        ? selectedWebsite.domain
                        : `https://${selectedWebsite.domain}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1d5b9f] hover:bg-slate-100"
                    title="Open website in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Control Panel and Tracking Code Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/control-panel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-[#1d5b9f] text-xs font-bold transition-colors text-center"
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Control Panel</span>
                  </Link>

                  <button
                    onClick={() => {
                      openTrackingModal(selectedWebsite);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#1d5b9f] text-white text-xs font-bold shadow-xs hover:bg-[#174880] transition-colors text-center"
                  >
                    <Code className="w-3.5 h-3.5 shrink-0" />
                    <span>Counter Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Groups */}
            <nav className="flex-1 p-3 space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1d5b9f]"></span>
                    {group.title}
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href === "/summary" && pathname === "/summery");

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-[#e5eff9] text-[#1c5396] font-bold border-l-4 border-[#1c5396]"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 ${
                                isActive ? "text-[#1c5396]" : "text-slate-500"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer User Footer */}
            {user && (
              <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2.5 px-2">
                  <div className="w-7 h-7 rounded-full bg-[#1d5b9f] text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-xs text-slate-800 truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    router.push("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
