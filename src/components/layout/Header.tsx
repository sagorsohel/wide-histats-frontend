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
} from "lucide-react";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto close mobile drawer on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === "/" || pathname === "/login";

  const { user, logout } = useAuth();
  const { websites, selectedWebsite, setSelectedWebsite, openTrackingModal } =
    useWebsite();

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-3 sm:px-4 lg:px-8 flex items-center justify-between shadow-xs shrink-0">
        {/* Left: Mobile Hamburger + Brand & Desktop Website Selector */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
          {/* Mobile Menu Hamburger */}
          {mounted && !isAuthPage && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0"
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
            href={isAuthPage ? "/" : "/summary"}
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

          {/* Desktop Website Dropdown (Hidden on Mobile) */}
          {mounted && !isAuthPage && selectedWebsite && (
            <div className="hidden md:flex items-center gap-1.5">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={`Website: ${selectedWebsite.name} (${selectedWebsite.domain})`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-medium transition-all"
                >
                  <Globe className="w-4 h-4 text-[#1d5b9f] shrink-0" />
                  <span className="max-w-[120px] lg:max-w-[180px] truncate">
                    {selectedWebsite.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5 shrink-0" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-2xl p-1.5 z-50 animate-slide-down">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase px-2.5 py-1.5">
                        Your Websites
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-0.5">
                        {websites.map((site) => (
                          <button
                            key={site.id}
                            onClick={() => {
                              setSelectedWebsite(site);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                              selectedWebsite.id === site.id
                                ? "bg-blue-50 text-[#1d5b9f] font-semibold"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex flex-col text-left truncate">
                              <span className="truncate">{site.name}</span>
                              <span className="text-[11px] text-slate-400 truncate">
                                {site.domain}
                              </span>
                            </div>
                            {selectedWebsite.id === site.id && (
                              <Check className="w-4 h-4 text-[#1d5b9f] shrink-0 ml-2" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-200 mt-1.5 pt-1.5">
                        <Link
                          href="/websites"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1d5b9f] hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add New Website
                        </Link>
                      </div>
                    </div>
                  </>
                )}
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
                className="p-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-[#1d5b9f] transition-all flex items-center justify-center shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Tracking Code Snippet Button (Desktop) */}
          {mounted && !isAuthPage && selectedWebsite && (
            <button
              onClick={() => openTrackingModal(selectedWebsite)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1d5b9f]/30 bg-[#1d5b9f]/10 text-[#1d5b9f] hover:bg-[#1d5b9f]/20 text-xs font-semibold transition-all shadow-2xs"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Tracking Code</span>
            </button>
          )}

          {/* Live Visitor Indicator */}
          {mounted && !isAuthPage && selectedWebsite && (
            <Link
              href="/realtime"
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all shrink-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="tabular-nums">
                {selectedWebsite.activeVisitors || 1} <span className="hidden sm:inline">online</span>
              </span>
            </Link>
          )}

          {/* User Account Dropdown */}
          {!mounted ? (
            <div className="w-8 h-8 rounded-full bg-slate-100" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all"
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

            {/* Mobile Website Selector */}
            {selectedWebsite && (
              <div className="p-3 border-b border-slate-200 bg-blue-50/50 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Current Website
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-[#1d5b9f] shrink-0" />
                    <span className="font-bold text-slate-800 truncate">
                      {selectedWebsite.name}
                    </span>
                  </div>
                  <a
                    href={`https://${selectedWebsite.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1d5b9f] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Tracking Code Action */}
                <button
                  onClick={() => {
                    openTrackingModal(selectedWebsite);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1d5b9f] text-white text-xs font-bold shadow-xs hover:bg-[#174880] transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Get Tracking Counter Code</span>
                </button>
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
