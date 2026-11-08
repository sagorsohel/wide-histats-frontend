"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
import { useAppSelector } from "@/store";
import { Website } from "@/types/analytics";
import { getSite7DigitId } from "@/lib/utils";

// Official useAnimations animated icons (https://useanimations.com)
import UseAnimations from "react-useanimations";
import grid from "react-useanimations/lib/grid";
import trendingUp from "react-useanimations/lib/trendingUp";
import activity from "react-useanimations/lib/activity";
import explore from "react-useanimations/lib/explore";
import smartphone from "react-useanimations/lib/smartphone";
import globe from "react-useanimations/lib/globe";
import fileText from "react-useanimations/lib/fileText";
import layers from "react-useanimations/lib/layers";
import settings from "react-useanimations/lib/settings";
import plusToX from "react-useanimations/lib/plusToX";
import code from "react-useanimations/lib/code";

export interface NavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{
    className?: string;
    strokeColor?: string;
    size?: number;
  }>;
  animation: any;
  badge?: string;
  isLive?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Helper factory to create compatible animated icon components (used in Header & Sidebar)
export const createAnimatedIcon = (
  animationData: any,
  defaultSize = 18,
  isLoop = false,
) => {
  const Component: React.FC<{
    className?: string;
    strokeColor?: string;
    size?: number;
  }> = ({ className = "", strokeColor, size = defaultSize }) => {
    const determinedColor =
      strokeColor ||
      (className.includes("text-[#1455bb]")
        ? "#1455bb"
        : className.includes("text-white")
          ? "#ffffff"
          : "#64748b");

    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
      >
        <UseAnimations
          animation={animationData}
          size={size}
          strokeColor={determinedColor}
          interaction="hover"
          loop={isLoop}
        />
      </div>
    );
  };
  Component.displayName = "AnimatedIcon";
  return Component;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Traffic & Analytics",
    items: [
      {
        href: "/summary",
        label: "Overview Summary",
        subtitle: "Key performance metrics",
        animation: grid,
        icon: createAnimatedIcon(grid, 18),
      },
      {
        href: "/traffic-stats",
        label: "Traffic Stats",
        subtitle: "Visitors, sessions & hits",
        animation: trendingUp,
        icon: createAnimatedIcon(trendingUp, 18),
      },
      {
        href: "/realtime",
        label: "Users Online",
        subtitle: "Real-time presence",
        animation: activity,
        icon: createAnimatedIcon(activity, 18, true),
        badge: "Live",
        isLive: true,
      },
    ],
  },
  {
    title: "Traffic Sources",
    items: [
      {
        href: "/sources",
        label: "Referring Sites",
        subtitle: "Search, direct & social",
        animation: explore,
        icon: createAnimatedIcon(explore, 18),
      },
    ],
  },
  {
    title: "Audience & Devices",
    items: [
      {
        href: "/devices",
        label: "Browsers & OS",
        subtitle: "Platforms & screen sizes",
        animation: smartphone,
        icon: createAnimatedIcon(smartphone, 18),
      },
      {
        href: "/geography",
        label: "Geolocation",
        subtitle: "Countries & world map",
        animation: globe,
        icon: createAnimatedIcon(globe, 18),
      },
    ],
  },
  {
    title: "Content & URLs",
    items: [
      {
        href: "/pages",
        label: "Traffic by URL",
        subtitle: "Top visited paths",
        animation: fileText,
        icon: createAnimatedIcon(fileText, 18),
      },
    ],
  },
  {
    title: "System & Settings",
    items: [
      {
        href: "/settings",
        label: "Settings",
        subtitle: "Preferences & tracking",
        animation: settings,
        icon: createAnimatedIcon(settings, 18),
      },
    ],
  },
];

// Helper to extract clean domain for favicon lookup
export const getCleanDomain = (domain: string): string => {
  if (!domain) return "";
  try {
    return domain
      .replace(/^(?:https?:\/\/)?/i, "")
      .split("/")[0]
      .split(":")[0];
  } catch {
    return domain;
  }
};

// Website Favicon Component with Multi-Tier CDN + Fallback Letter Avatar
export const WebsiteFavicon: React.FC<{
  name: string;
  domain: string;
  className?: string;
}> = ({ name, domain, className = "w-5 h-5" }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const clean = getCleanDomain(domain);
  const initial = (name || clean || "W").charAt(0).toUpperCase();

  const sources = React.useMemo(() => {
    if (!clean) return [];
    return [
      `https://${clean}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${clean}.ico`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=64`,
    ];
  }, [clean]);

  React.useEffect(() => {
    setSourceIndex(0);
  }, [clean]);

  if (sources.length > 0 && sourceIndex < sources.length) {
    return (
      <img
        key={`${clean}-${sourceIndex}`}
        src={sources[sourceIndex]}
        alt={name || domain}
        onError={() => setSourceIndex((prev) => prev + 1)}
        className={`${className} object-contain rounded-xs shrink-0 select-none`}
        loading="lazy"
      />
    );
  }

  return (
    <span className="font-black text-xs uppercase leading-none select-none text-slate-800">
      {initial}
    </span>
  );
};

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [reloadingSite, setReloadingSite] = useState<Website | null>(null);
  const { websites, selectedWebsite, setSelectedWebsite, openTrackingModal } =
    useWebsite();

  // Reactive real-time active visitor count from Redux
  const realtimeData = useAppSelector((state) =>
    selectedWebsite?.id
      ? state.realtime.byWebsite[selectedWebsite.id]?.data
      : null,
  );
  const activeCount = realtimeData?.activeCount;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to generate URLs with 7-digit ID format: /<page>?id=<7-digit-id>
  const getHref = (href: string) => {
    const site7Digit = getSite7DigitId(selectedWebsite);
    if (!site7Digit) return href;
    const cleanHref = href.replace(/\/$/, "");
    return `${cleanHref}?id=${site7Digit}`;
  };

  // Switch website and perform a clean reload transition so fresh analytics are fetched and shown
  const handleSwitchWebsite = (site: Website) => {
    if (selectedWebsite?.id === site.id) return;
    setReloadingSite(site);
    setSelectedWebsite(site);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("histat:website_changed", { detail: site }),
      );
      if (
        pathname !== "/" &&
        pathname !== "/login" &&
        pathname !== "/control-panel" &&
        pathname !== "/websites"
      ) {
        const cleanPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
        const site7Digit = getSite7DigitId(site);
        window.history.replaceState(null, "", `${cleanPath}?id=${site7Digit}`);
        router.push(`${cleanPath}?id=${site7Digit}`);
      }
    }
    // Smooth transition: remove overlay after analytics fetch begins
    setTimeout(() => {
      setReloadingSite(null);
    }, 450);
  };

  // Hide sidebar on auth pages, root, and control panel (pathname is known immediately, no !mounted blank flash)
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/control-panel" ||
    pathname === "/websites"
  ) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-row shrink-0 h-full select-none border-r border-slate-200/80 shadow-xs">
      {/* ============================================================ */}
      {/* COLUMN 1: Left Royal Blue Dock / Rail (Width: 64px)           */}
      {/* macOS dots + real favicons with seamless organic carved tab  */}
      {/* ============================================================ */}
      <div className="w-[64px] bg-gradient-to-b from-[#1455bb] via-[#124cb0] to-[#0f3f94] flex flex-col items-center py-3.5 shrink-0 relative z-20 shadow-[2px_0_10px_rgba(16,83,184,0.15)]">
        {/* macOS Window Control Dots at top */}
        <div className="flex items-center gap-1.5 mb-5 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-2xs" />
        </div>

        {/* Website Switcher List with Real Favicons */}
        <div className="flex-1 w-full flex flex-col items-center gap-2.5 overflow-y-auto no-scrollbar py-1">
          {websites && websites.length > 0 ? (
            websites.map((site) => {
              const isSelected = selectedWebsite?.id === site.id;

              if (isSelected) {
                return (
                  <div
                    key={site.id}
                    className="relative w-full flex justify-end items-center my-0.5"
                  >
                    {/* Top Inverted Scoop Curve bridging Column 1 to Column 2 */}
                    <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-30">
                      <svg
                        className="w-4 h-4 fill-[#f8fafc] text-[#f8fafc]"
                        viewBox="0 0 16 16"
                      >
                        <path d="M 16 0 C 16 8.837 8.837 16 0 16 L 16 16 Z" />
                      </svg>
                    </div>

                    {/* Active Carved Notch Tab */}
                    <div className="bg-[#f8fafc] w-[56px] h-[50px] rounded-l-2xl flex items-center justify-center relative z-20 pr-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleSwitchWebsite(site)}
                        disabled={!!reloadingSite}
                        title={`Active: ${site.name} (${site.domain}) - Click to reload`}
                        className={`w-10 h-10 rounded-full bg-white flex items-center justify-center p-2 shadow-sm border border-slate-200/80 ring-2 ring-blue-500/25 cursor-pointer active:scale-95 transition-all relative ${
                          reloadingSite?.id === site.id ? "opacity-75" : ""
                        }`}
                      >
                        <WebsiteFavicon
                          name={site.name}
                          domain={site.domain}
                          className="w-5 h-5"
                        />
                        {reloadingSite?.id === site.id && (
                          <span className="absolute -inset-0.5 rounded-full border-2 border-[#1455bb] border-t-transparent animate-spin" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Inverted Scoop Curve bridging Column 1 to Column 2 */}
                    <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-30">
                      <svg
                        className="w-4 h-4 fill-[#f8fafc] text-[#f8fafc]"
                        viewBox="0 0 16 16"
                      >
                        <path d="M 0 0 C 8.837 0 16 7.163 16 16 L 16 0 Z" />
                      </svg>
                    </div>
                  </div>
                );
              }

              // Inactive Website Circular Button with Favicon
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => handleSwitchWebsite(site)}
                  disabled={!!reloadingSite}
                  title={`Switch to: ${site.name} (${site.domain})`}
                  className={`w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center p-2 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group backdrop-blur-xs relative ${
                    reloadingSite?.id === site.id ? "ring-2 ring-white/60" : ""
                  }`}
                >
                  <WebsiteFavicon
                    name={site.name}
                    domain={site.domain}
                    className="w-5 h-5 drop-shadow-xs"
                  />
                  {reloadingSite?.id === site.id && (
                    <span className="absolute -inset-0.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                </button>
              );
            })
          ) : (
            // Default placeholder circle if no sites yet
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-xs shadow-sm">
              W
            </div>
          )}

          {/* Add Website Circular "+" Button at bottom of rail */}
          <Link
            href="/websites"
            title="Add or Manage Websites"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer mt-1 group"
          >
            <UseAnimations
              animation={plusToX}
              size={18}
              strokeColor="#ffffff"
              interaction="hover"
            />
          </Link>
        </div>

        {/* Bottom Rail Tracker Code Trigger */}
        {selectedWebsite && (
          <button
            type="button"
            onClick={() => openTrackingModal(selectedWebsite)}
            title="Get Tracker Code"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-blue-100 flex items-center justify-center transition-all cursor-pointer mt-auto group"
          >
            <UseAnimations
              animation={code}
              size={18}
              strokeColor="#dbeafe"
              interaction="hover"
            />
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* COLUMN 2: Secondary Navigation Panel (Width: 236px)          */}
      {/* Clean card items starting directly from top                  */}
      {/* ============================================================ */}
      <div className="w-[236px] bg-[#f8fafc] flex flex-col justify-between overflow-hidden relative z-10">
        {/* Navigation Cards List (Starts directly from top without redundant website block) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname === `${item.href}/` ||
                    (item.href === "/summary" &&
                      (pathname === "/summery" || pathname === "/summery/")) ||
                    (item.href === "/traffic-stats" &&
                      (pathname === "/traffic" || pathname === "/traffic/")) ||
                    (item.href === "/control-panel" &&
                      (pathname === "/websites" || pathname === "/websites/"));

                  const itemHref = getHref(item.href);

                  if (isActive) {
                    // Active Card (Instant 0ms Next.js navigation)
                    return (
                      <Link
                        key={item.href}
                        prefetch={true}
                        href={itemHref}
                        className="block p-3 rounded-xl bg-gradient-to-r from-[#1455bb] to-[#1a62d4] text-white shadow-md shadow-blue-600/25 transition-all group scale-[1.01] cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <item.icon className="w-4 h-4 text-white" strokeColor="#ffffff" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-xs text-white truncate leading-tight">
                                {item.label}
                              </div>
                              <div className="text-[10px] text-blue-100/80 truncate mt-0.5">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          {item.isLive ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white text-[#1455bb] shadow-xs flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>
                                {typeof activeCount === "number" &&
                                activeCount > 0
                                  ? `${activeCount} Live`
                                  : "Live"}
                              </span>
                            </span>
                          ) : item.badge ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/20 text-white border border-white/30 shrink-0">
                              {item.badge}
                            </span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          )}
                        </div>
                      </Link>
                    );
                  }

                  // Inactive Card (Instant 0ms Next.js navigation)
                  return (
                    <Link
                      key={item.href}
                      prefetch={true}
                      href={itemHref}
                      className="block p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-blue-300 hover:shadow-xs hover:translate-x-0.5 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#1455bb] group-hover:bg-blue-50 flex items-center justify-center shrink-0 transition-colors">
                            <item.icon className="w-4 h-4 text-[#1455bb]" strokeColor="#1455bb" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-800 group-hover:text-blue-600 truncate leading-tight transition-colors">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {item.isLive ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                              {typeof activeCount === "number" &&
                              activeCount > 0
                                ? activeCount
                                : "LIVE"}
                            </span>
                          </span>
                        ) : item.badge ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Card: Tracking Script Action */}
        <div className="p-3 border-t border-slate-200/80 bg-white/60 space-y-1.5">
          {selectedWebsite ? (
            <button
              type="button"
              onClick={() => openTrackingModal(selectedWebsite)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] active:scale-[0.98] text-white font-bold text-xs shadow-xs shadow-blue-600/20 transition-all cursor-pointer group"
            >
              <UseAnimations
                animation={code}
                size={16}
                strokeColor="#ffffff"
                interaction="hover"
              />
              <span>Get Tracking Code</span>
            </button>
          ) : (
            <Link
              href="/control-panel"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all group"
            >
              <span>Manage Websites</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {/* Engine Status */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-medium pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Wide-Histat Engine v2.4</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Frosted Reload Overlay when switching websites */}
      {reloadingSite && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/25 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3.5 max-w-xs text-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-xs">
                <WebsiteFavicon
                  name={reloadingSite.name}
                  domain={reloadingSite.domain}
                  className="w-7 h-7"
                />
              </div>
              <div className="absolute -inset-1 rounded-full border-2 border-[#1455bb] border-t-transparent animate-spin" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-800">
                Loading {reloadingSite.name}...
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {reloadingSite.domain}
              </div>
            </div>
            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Fetching fresh analytics telemetry
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
