"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { NAV_GROUPS, WebsiteFavicon } from "@/components/layout/Sidebar";
import { getSite7DigitId } from "@/lib/utils";
import {
  AnalycosLogo,
  AnalycosAnimatedText,
} from "@/components/common/AnalycosLogo";
import {
  Globe,
  Code,
  LogOut,
  ChevronDown,
  Activity,
  ExternalLink,
  Menu,
  X,
  Sliders,
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

  const isAuthPage =
    pathname === "/" || pathname === "/login" || pathname === "/register";
  const isControlPanel =
    pathname === "/control-panel" || pathname === "/websites";

  const { user, logout } = useAuth();
  const { websites, selectedWebsite, openTrackingModal } = useWebsite();

  return (
    <>
      <header className="border-b border-slate-200/90 bg-white/85 backdrop-blur-xl sticky top-0 z-40 shadow-2xs shrink-0">
        <div className="h-16 px-3 sm:px-5 lg:px-7 flex items-center justify-between gap-3">
          {/* ============================================================ */}
          {/* LEFT: Mobile Hamburger + Clean Brand Logo                    */}
          {/* ============================================================ */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile Menu Hamburger */}
            {!isAuthPage && !isControlPanel && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200 shrink-0 cursor-pointer"
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
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <AnalycosLogo size={32} animated={true} speed="fast" />
              <div className="flex items-center">
                <AnalycosAnimatedText sizeClass="text-base sm:text-lg" />
              </div>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: Control Panel + Website + Tracking Code + User Avatar */}
          {/* All moved to right side with cohesive frosted glass design   */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
            {/* Desktop Control Panel & Website Pill (Moved to Right Side in Glass Design) */}
            {!isAuthPage && (
              <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
                {/* 1. Control Panel Button (Frosted Glass Pill) */}
                <Link
                  href="/control-panel"
                  title="Open Control Panel (All Websites)"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold transition-all duration-200 active:scale-95 ${
                    pathname === "/control-panel" || pathname === "/websites"
                      ? "bg-[#1455bb] text-white shadow-sm shadow-blue-600/30"
                      : "bg-white/70 hover:bg-white backdrop-blur-md border border-slate-200/90 hover:border-blue-300 text-slate-700 hover:text-[#1455bb] shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Control panel</span>
                </Link>

                {/* 2. Active Website Pill (Frosted Glass with Favicon & External Link) */}
                {selectedWebsite && (
                  <div className="flex items-center gap-1.5 bg-white/75 hover:bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-blue-300 rounded-2xl p-1 pr-1.5 shadow-2xs transition-all">
                    <div
                      title={`Active Website: ${selectedWebsite.name} (${selectedWebsite.domain}) - View Analytics`}
                      className="flex items-center gap-2 px-2 py-0.5 text-xs font-extrabold text-slate-800 hover:text-[#1455bb] transition-colors select-none"
                    >
                      <WebsiteFavicon
                        name={selectedWebsite.name}
                        domain={selectedWebsite.domain}
                        className="w-4 h-4 shadow-2xs"
                      />
                      <span className="max-w-[120px] lg:max-w-[170px] truncate">
                        {selectedWebsite.name}
                      </span>
                    </div>

                    {/* Direct Open Link in New Tab */}
                  </div>
                )}
              </div>
            )}

            {/* 3. Tracking Code Snippet Button (Frosted Glass Pill) */}

            {/* 4. User Account Dropdown (Frosted Glass Avatar) */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-2xl hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1455bb] to-indigo-600 border border-blue-400 flex items-center justify-center text-xs font-black text-white uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-slate-200/90 bg-white shadow-2xl p-2 z-50 animate-slide-down">
                      <div className="px-3.5 py-2.5 border-b border-slate-100">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>

                      <div className="py-1.5 space-y-0.5">
                        <Link
                          href="/websites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span>Manage Websites</span>
                        </Link>
                        {websites && websites.length > 0 && (
                          <Link
                            href="/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Activity className="w-4 h-4 text-slate-500" />
                            <span>Settings</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            await logout();
                            setUserDropdownOpen(false);
                            router.push("/login");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-bold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-2xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Sub-Header: Current Website Indicator + Control Panel Button */}
        {!isAuthPage && !isControlPanel && selectedWebsite && (
          <div className="md:hidden border-t border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-3 py-2 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                Site:
              </span>
              <div
                title={`Current Website: ${selectedWebsite.name} (${selectedWebsite.domain})`}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs min-w-0 max-w-[170px]"
              >
                <WebsiteFavicon
                  name={selectedWebsite.name}
                  domain={selectedWebsite.domain}
                  className="w-3.5 h-3.5"
                />
                <span className="text-xs font-extrabold text-slate-900 truncate">
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
                className="p-1 rounded-lg text-slate-400 hover:text-[#1455bb] hover:bg-slate-200/60 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <Link
              href="/control-panel"
              title="Open Websites Control Panel"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Control panel</span>
            </Link>
          </div>
        )}

        {/* Mobile Sub-Header on Control Panel page */}
        {!isAuthPage && isControlPanel && (
          <div className="md:hidden border-t border-slate-200/80 bg-[#f8fafc] px-3.5 py-2 flex items-center justify-between gap-2 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Sliders className="w-3.5 h-3.5 text-[#1455bb]" />
              <span>Websites Control Panel</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455bb] font-black text-[11px] border border-blue-200">
              {websites.length} websites
            </span>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation (Visible on phones & tablets when open) */}
      {!isAuthPage && mobileMenuOpen && (
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
                <AnalycosLogo size={28} animated={true} speed="fast" />
                <div>
                  <span className="font-black text-base text-slate-900">
                    Analycos
                  </span>
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-[#1455bb]">
                    Menu
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Website Indicator */}
            {selectedWebsite && (
              <div className="p-3 border-b border-slate-200 bg-blue-50/40 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Current Website
                </div>

                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5 text-xs shadow-2xs">
                  <Link
                    href={`/summary/?id=${getSite7DigitId(selectedWebsite)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 truncate hover:opacity-80 transition-opacity"
                  >
                    <WebsiteFavicon
                      name={selectedWebsite.name}
                      domain={selectedWebsite.domain}
                      className="w-4 h-4 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">
                        {selectedWebsite.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {selectedWebsite.domain}
                      </div>
                    </div>
                  </Link>
                  <a
                    href={
                      selectedWebsite.domain.startsWith("http")
                        ? selectedWebsite.domain
                        : `https://${selectedWebsite.domain}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1455bb] hover:bg-slate-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Control Panel and Tracking Code Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/control-panel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-[#1455bb] text-xs font-bold transition-colors text-center"
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Control Panel</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      openTrackingModal(selectedWebsite);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#1455bb] text-white text-xs font-bold shadow-xs hover:bg-[#1047a0] transition-colors text-center cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5 shrink-0" />
                    <span>Tracker Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Groups */}
            <nav className="flex-1 p-3 space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1455bb]" />
                    <span>{group.title}</span>
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname === `${item.href}/` ||
                        (item.href === "/summary" &&
                          (pathname === "/summery" ||
                            pathname === "/summery/")) ||
                        (item.href === "/traffic-stats" &&
                          (pathname === "/traffic" ||
                            pathname === "/traffic/"));

                      const site7Digit = getSite7DigitId(selectedWebsite);
                      const itemHref = site7Digit
                        ? `${item.href.endsWith("/") ? item.href : `${item.href}/`}?id=${site7Digit}`
                        : item.href;

                      return (
                        <Link
                          key={item.href}
                          href={itemHref}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-blue-50 text-[#1455bb] font-bold border-l-4 border-[#1455bb]"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 ${
                                isActive ? "text-[#1455bb]" : "text-slate-500"
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
                  <div className="w-7 h-7 rounded-full bg-[#1455bb] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
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
                  type="button"
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200 cursor-pointer"
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
