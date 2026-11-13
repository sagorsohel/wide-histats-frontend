"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { useAppSelector } from "@/store";
import { Website } from "@/types/analytics";
import { getSite7DigitId } from "@/lib/utils";
import {
  AnalycosLogo,
  AnalycosAnimatedText,
} from "@/components/common/AnalycosLogo";
import {
  Globe,
  Plus,
  Bell,
  ChevronDown,
  LogOut,
  LayoutGrid,
  BarChart2,
  Layers,
  Compass,
  Smartphone,
  Settings,
  Check,
  Activity,
  Sliders,
} from "lucide-react";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [websiteDropdownOpen, setWebsiteDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  const { user, logout } = useAuth();
  const { websites, selectedWebsite, setSelectedWebsite, openTrackingModal } =
    useWebsite();

  const realtimeData = useAppSelector((state) =>
    selectedWebsite?.id
      ? state.realtime.byWebsite[selectedWebsite.id]?.data
      : null,
  );
  const activeCount = realtimeData?.activeCount;

  const getHref = (href: string) => {
    const site7Digit = getSite7DigitId(selectedWebsite);
    if (!site7Digit) return href;
    const cleanHref = href.replace(/\/$/, "");
    return `${cleanHref}?id=${site7Digit}`;
  };

  const handleSwitchWebsite = (site: Website) => {
    if (selectedWebsite?.id === site.id) {
      setWebsiteDropdownOpen(false);
      return;
    }
    setSelectedWebsite(site);
    setWebsiteDropdownOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("histat:website_changed", { detail: site }),
      );
      if (
        !isAuthPage &&
        pathname !== "/control-panel" &&
        pathname !== "/websites"
      ) {
        const cleanPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
        const site7Digit = getSite7DigitId(site);
        window.history.replaceState(null, "", `${cleanPath}?id=${site7Digit}`);
        router.push(`${cleanPath}?id=${site7Digit}`);
      }
    }
  };

  // 8 Navigation Tabs using exact original names with modern pill bar design
  const navTabs = [
    {
      id: "summary",
      label: "Overview ",
      href: "/summary",
      icon: LayoutGrid,
      matches: ["/summary", "/summery"],
    },
    {
      id: "traffic-stats",
      label: "Traffic Stats",
      href: "/traffic-stats",
      icon: BarChart2,
      matches: ["/traffic-stats", "/traffic"],
    },
    {
      id: "realtime",
      label: "Users Online",
      href: "/realtime",
      icon: Activity,
      matches: ["/realtime"],
      isLive: true,
    },
    {
      id: "sources",
      label: "Referring Sites",
      href: "/sources",
      icon: Compass,
      matches: ["/sources"],
    },
    {
      id: "devices",
      label: "Browsers & OS",
      href: "/devices",
      icon: Smartphone,
      matches: ["/devices"],
    },
    {
      id: "geography",
      label: "Geolocation",
      href: "/geography",
      icon: Globe,
      matches: ["/geography"],
    },
    {
      id: "pages",
      label: "Traffic by URL",
      href: "/pages",
      icon: Layers,
      matches: ["/pages"],
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: Settings,
      matches: ["/settings"],
    },
  ];

  return (
    <header className="w-full bg-white sticky top-0 z-50 shrink-0 select-none shadow-xs">
      {/* ============================================================ */}
      {/* ROW 1: Clean White Header Bar                                */}
      {/* Logo | Website Dropdown | Tracking Active | + Add Website | User */}
      {/* ============================================================ */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 bg-white">
        {/* Left Side: Logo + Divider + Dropdown */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo & Brand */}
          <Link
            href={isAuthPage ? "/" : "/summary"}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <AnalycosLogo size={30} animated={true} speed="fast" />
            <div className="flex items-center">
              <AnalycosAnimatedText sizeClass="text-base sm:text-lg" />
            </div>
          </Link>

          {!isAuthPage && (
            <>
              {/* Thin Vertical Divider */}
              <div className="h-5 w-px bg-slate-200 mx-1 shrink-0 hidden sm:block" />

              {/* Website Selector Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setWebsiteDropdownOpen(!websiteDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 text-xs font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="max-w-[160px] sm:max-w-[220px] truncate">
                    {selectedWebsite?.domain ||
                      selectedWebsite?.name ||
                      "Select Website"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Website Dropdown Popup */}
                {websiteDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setWebsiteDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-200/90 bg-white shadow-xl p-2 z-[70] animate-slide-down">
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        Select Active Website
                      </div>

                      <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                        {websites && websites.length > 0 ? (
                          websites.map((site) => {
                            const isSelected = selectedWebsite?.id === site.id;
                            return (
                              <button
                                key={site.id}
                                type="button"
                                onClick={() => handleSwitchWebsite(site)}
                                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-50 text-[#1058d1] font-bold"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Globe
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isSelected
                                        ? "text-[#1058d1]"
                                        : "text-slate-400"
                                    }`}
                                  />
                                  <span className="truncate">
                                    {site.domain || site.name}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#1058d1] shrink-0" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-xs text-slate-400">
                            No websites yet.
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <Link
                          href="/websites"
                          onClick={() => setWebsiteDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Website</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Tracking Active + Add Website + Notification Bell + User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {!isAuthPage && (
            <>
              {/* Status Pill: Tracking Active */}
              <button
                type="button"
                onClick={() =>
                  selectedWebsite && openTrackingModal(selectedWebsite)
                }
                title="Telemetry tracking active - Click to view tracking code snippet"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-xs font-semibold text-[#047857] hover:bg-emerald-100/90 transition-colors cursor-pointer shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tracking active</span>
              </button>

              {/* Add Website Button */}
              <Link
                href="/websites"
                title="Add or configure websites"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200/90 hover:border-blue-300 bg-white hover:bg-blue-50/50 text-xs font-bold text-[#1058d1] shadow-2xs transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-[#1058d1]" />
                <span>Add website</span>
              </Link>
            </>
          )}

          {/* User Account Avatar with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#1058d1] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user?.name?.charAt(0) || "A"}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white shadow-2xl p-2 z-[70] animate-slide-down">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-extrabold text-xs text-slate-900 truncate">
                      {user?.name || "User Account"}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || "user@analycos.com"}
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/websites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manage Websites</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setUserDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors font-bold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: Royal Blue Sub-Header Navigation Bar                 */}
      {/* 8 Tabs: Overview Summary | Traffic Stats | Users Online...  */}
      {/* ============================================================ */}
      {!isAuthPage && (
        <nav className="h-11 bg-[#1058d1] px-4 flex items-center gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap scrollbar-none shadow-xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.matches.some(
              (m) => pathname === m || pathname.startsWith(`${m}/`),
            );

            return (
              <Link
                key={tab.id}
                prefetch={true}
                href={getHref(tab.href)}
                className={`flex items-center gap-1.5 transition-all duration-150 cursor-pointer text-xs shrink-0 ${
                  isActive
                    ? "bg-white text-[#1058d1] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    : "text-white/90 hover:text-white hover:bg-white/10 font-semibold px-2.5 py-1.5 rounded-lg"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-[#1058d1]" : "text-white"
                  }`}
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};
