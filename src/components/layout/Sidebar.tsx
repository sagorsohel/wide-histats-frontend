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
  theme?: {
    stroke: string;
    inactive3D: string;
    active3D: string;
    cardBorderGradient?: string;
  };
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

// Authentic Histats "Users online" Broadcast Antenna & Live Animated Icon matching the classic Histats icon
export const HistatsLiveBroadcastIcon: React.FC<{
  className?: string;
  size?: number;
  strokeColor?: string;
}> = ({ className = "", size = 20, strokeColor }) => {
  const isWhite = strokeColor === "#ffffff" || strokeColor === "white";
  const mainColor = isWhite ? "#ffffff" : "#e11d48";
  const waveColor = isWhite ? "#ffffff" : "#f43f5e";
  const baseColor = isWhite ? "#ffffff" : "#9f1239";
  const textColor = isWhite ? "#ffffff" : "#be123c";

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            @keyframes radioWaveLeft {
              0%, 100% { opacity: 0.35; transform: scaleX(0.92) translateX(0); }
              50% { opacity: 1; transform: scaleX(1.1) translateX(-0.8px); }
            }
            @keyframes radioWaveRight {
              0%, 100% { opacity: 0.35; transform: scaleX(0.92) translateX(0); }
              50% { opacity: 1; transform: scaleX(1.1) translateX(0.8px); }
            }
            @keyframes beaconPulse {
              0%, 100% { transform: scale(0.9); opacity: 0.85; }
              50% { transform: scale(1.18); opacity: 1; filter: drop-shadow(0 0 2px ${isWhite ? "rgba(255,255,255,0.8)" : "rgba(225,29,72,0.8)"}); }
            }
            @keyframes liveTextGlow {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1; }
            }
            .histats-wave-left-outer {
              animation: radioWaveLeft 1.2s ease-in-out infinite;
              transform-origin: 12px 7px;
            }
            .histats-wave-right-outer {
              animation: radioWaveRight 1.2s ease-in-out infinite;
              transform-origin: 12px 7px;
            }
            .histats-beacon-dot {
              animation: beaconPulse 1.2s ease-in-out infinite;
              transform-origin: 12px 7.2px;
            }
            .histats-live-text {
              animation: liveTextGlow 1.2s ease-in-out infinite;
            }
          `}
        </style>

        {/* Outer Left Radio Wave Arc */}
        <path
          d="M 6.2 3.2 C 4.2 5.6 4.2 8.8 6.2 11.2"
          stroke={mainColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="histats-wave-left-outer"
        />

        {/* Inner Left Radio Wave Arc */}
        <path
          d="M 8.8 5 C 7.8 6.3 7.8 8.1 8.8 9.4"
          stroke={waveColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Central Transmitter Beacon Bulb */}
        <circle
          cx="12"
          cy="7.2"
          r="2.5"
          fill={mainColor}
          className="histats-beacon-dot"
        />
        <circle cx="12" cy="7.2" r="1" fill={isWhite ? "#1455bb" : "#ffffff"} />

        {/* Inner Right Radio Wave Arc */}
        <path
          d="M 15.2 5 C 16.2 6.3 16.2 8.1 15.2 9.4"
          stroke={waveColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Outer Right Radio Wave Arc */}
        <path
          d="M 17.8 3.2 C 19.8 5.6 19.8 8.8 17.8 11.2"
          stroke={mainColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="histats-wave-right-outer"
        />

        {/* Antenna Base Pole */}
        <path
          d="M 12 9.6 L 12 13"
          stroke={baseColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 10 13.2 L 14 13.2"
          stroke={baseColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* "LIVE" text underneath matching Histats screenshot */}
        <text
          x="12"
          y="20.8"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={textColor}
          letterSpacing="0.8px"
          className="histats-live-text font-black"
        >
          LIVE
        </text>
      </svg>
    </div>
  );
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
        theme: {
          stroke: "#2563eb",
          cardBorderGradient:
            "from-blue-200 via-indigo-200 to-blue-300 group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-blue-600",
          inactive3D:
            "bg-gradient-to-b from-blue-50 to-blue-100 text-blue-600 border border-blue-200/90 shadow-[0_2px_4px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-blue-400 group-hover:shadow-[0_4px_8px_rgba(37,99,235,0.25)]",
          active3D:
            "bg-gradient-to-b from-blue-400 via-blue-500 to-indigo-600 text-white border-t border-white/50 border-b border-indigo-800 shadow-[0_3px_8px_rgba(30,58,138,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
      },
      {
        href: "/traffic-stats",
        label: "Traffic Stats",
        subtitle: "Visitors, sessions & hits",
        animation: trendingUp,
        icon: createAnimatedIcon(trendingUp, 18),
        theme: {
          stroke: "#059669",
          cardBorderGradient:
            "from-emerald-200 via-teal-200 to-emerald-300 group-hover:from-emerald-500 group-hover:via-teal-500 group-hover:to-emerald-600",
          inactive3D:
            "bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-600 border border-emerald-200/90 shadow-[0_2px_4px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-emerald-400 group-hover:shadow-[0_4px_8px_rgba(16,185,129,0.25)]",
          active3D:
            "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white border-t border-white/50 border-b border-teal-800 shadow-[0_3px_8px_rgba(6,78,59,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
      },
      {
        href: "/realtime",
        label: "Users Online",
        subtitle: "Real-time presence",
        animation: activity,
        icon: HistatsLiveBroadcastIcon,
        badge: "Live",
        isLive: true,
        theme: {
          stroke: "#e11d48",
          cardBorderGradient:
            "from-rose-200 via-red-200 to-rose-300 group-hover:from-rose-500 group-hover:via-red-500 group-hover:to-rose-600",
          inactive3D:
            "bg-gradient-to-b from-rose-50 to-rose-100 text-rose-600 border border-rose-200/90 shadow-[0_2px_4px_rgba(244,63,94,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-rose-400 group-hover:shadow-[0_4px_8px_rgba(244,63,94,0.3)]",
          active3D:
            "bg-gradient-to-b from-rose-400 via-rose-500 to-red-600 text-white border-t border-white/50 border-b border-red-800 shadow-[0_3px_8px_rgba(159,18,57,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
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
        theme: {
          stroke: "#d97706",
          cardBorderGradient:
            "from-amber-200 via-orange-200 to-amber-300 group-hover:from-amber-500 group-hover:via-orange-500 group-hover:to-amber-600",
          inactive3D:
            "bg-gradient-to-b from-amber-50 to-amber-100 text-amber-600 border border-amber-200/90 shadow-[0_2px_4px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-amber-400 group-hover:shadow-[0_4px_8px_rgba(245,158,11,0.3)]",
          active3D:
            "bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 text-white border-t border-white/50 border-b border-orange-800 shadow-[0_3px_8px_rgba(146,64,14,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
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
        theme: {
          stroke: "#7c3aed",
          cardBorderGradient:
            "from-purple-200 via-violet-200 to-purple-300 group-hover:from-purple-500 group-hover:via-violet-500 group-hover:to-purple-600",
          inactive3D:
            "bg-gradient-to-b from-purple-50 to-purple-100 text-purple-600 border border-purple-200/90 shadow-[0_2px_4px_rgba(139,92,246,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-purple-400 group-hover:shadow-[0_4px_8px_rgba(139,92,246,0.3)]",
          active3D:
            "bg-gradient-to-b from-purple-400 via-purple-500 to-violet-600 text-white border-t border-white/50 border-b border-violet-800 shadow-[0_3px_8px_rgba(91,33,182,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
      },
      {
        href: "/geography",
        label: "Geolocation",
        subtitle: "Countries & world map",
        animation: globe,
        icon: createAnimatedIcon(globe, 18),
        theme: {
          stroke: "#0284c7",
          cardBorderGradient:
            "from-sky-200 via-cyan-200 to-blue-300 group-hover:from-sky-500 group-hover:via-cyan-500 group-hover:to-blue-600",
          inactive3D:
            "bg-gradient-to-b from-sky-50 to-cyan-100 text-sky-600 border border-sky-200/90 shadow-[0_2px_4px_rgba(2,132,199,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-sky-400 group-hover:shadow-[0_4px_8px_rgba(2,132,199,0.3)]",
          active3D:
            "bg-gradient-to-b from-sky-400 via-cyan-500 to-blue-600 text-white border-t border-white/50 border-b border-blue-800 shadow-[0_3px_8px_rgba(7,89,133,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
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
        theme: {
          stroke: "#db2777",
          cardBorderGradient:
            "from-pink-200 via-rose-200 to-pink-300 group-hover:from-pink-500 group-hover:via-rose-500 group-hover:to-pink-600",
          inactive3D:
            "bg-gradient-to-b from-pink-50 to-pink-100 text-pink-600 border border-pink-200/90 shadow-[0_2px_4px_rgba(236,72,153,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-pink-400 group-hover:shadow-[0_4px_8px_rgba(236,72,153,0.3)]",
          active3D:
            "bg-gradient-to-b from-pink-400 via-pink-500 to-rose-600 text-white border-t border-white/50 border-b border-rose-800 shadow-[0_3px_8px_rgba(157,23,77,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
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
        theme: {
          stroke: "#475569",
          cardBorderGradient:
            "from-slate-200 via-gray-300 to-slate-300 group-hover:from-slate-500 group-hover:via-gray-500 group-hover:to-slate-600",
          inactive3D:
            "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700 border border-slate-300/90 shadow-[0_2px_4px_rgba(100,116,139,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-slate-400 group-hover:shadow-[0_4px_8px_rgba(100,116,139,0.3)]",
          active3D:
            "bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 text-white border-t border-white/50 border-b border-slate-900 shadow-[0_3px_8px_rgba(30,41,59,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        },
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
        pathname !== "/register" &&
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
    pathname === "/register" ||
    pathname === "/control-panel" ||
    pathname === "/websites"
  ) {
    return null;
  }

  return (
    <aside className="desktop-sticky-sidebar flex flex-row shrink-0 self-stretch select-none border-r border-slate-200/80 shadow-xs z-30">
      {/* ============================================================ */}
      {/* COLUMN 1: Left Royal Blue Dock / Rail (Width: 64px)           */}
      {/* macOS dots + real favicons with seamless organic carved tab  */}
      {/* ============================================================ */}
      <div className="w-[48px] bg-gradient-to-b from-[#1455bb] via-[#124cb0] to-[#0f3f94] flex flex-col items-center py-3 shrink-0 relative z-20 shadow-[2px_0_10px_rgba(16,83,184,0.15)] h-full">
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
                    <div className="bg-[#f8fafc] w-[42px] h-[42px] rounded-l-xl flex items-center justify-center relative z-20 pr-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleSwitchWebsite(site)}
                        disabled={!!reloadingSite}
                        title={`Active: ${site.name} (${site.domain}) - Click to reload`}
                        className={`w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm border border-slate-200/80 ring-2 ring-blue-500/25 cursor-pointer active:scale-95 transition-all relative ${
                          reloadingSite?.id === site.id ? "opacity-75" : ""
                        }`}
                      >
                        <WebsiteFavicon
                          name={site.name}
                          domain={site.domain}
                          className="w-4 h-4"
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
                  className={`w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center p-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group backdrop-blur-xs relative ${
                    reloadingSite?.id === site.id ? "ring-2 ring-white/60" : ""
                  }`}
                >
                  <WebsiteFavicon
                    name={site.name}
                    domain={site.domain}
                    className="w-4 h-4 drop-shadow-xs"
                  />
                  {reloadingSite?.id === site.id && (
                    <span className="absolute -inset-0.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                </button>
              );
            })
          ) : (
            // Default placeholder circle if no sites yet
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-[11px] shadow-sm">
              W
            </div>
          )}

          {/* Add Website Circular "+" Button at bottom of rail */}
          <Link
            href="/websites"
            title="Add or Manage Websites"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer mt-1 group"
          >
            <UseAnimations
              animation={plusToX}
              size={15}
              strokeColor="#ffffff"
              interaction="hover"
            />
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMN 2: Secondary Navigation Panel (Width: 162px)          */}
      {/* Clean card items starting directly from top                  */}
      {/* ============================================================ */}
      <div className="w-[162px] bg-[#F1F5F9] flex flex-col relative z-10 h-full">
        {/* Navigation Cards List (Starts directly from top without redundant website block) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2.5 custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-1 text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400">
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

                  // Border & Background per theme (matching pill style exactly)
                  const themeStyles: Record<
                    string,
                    {
                      border: string;
                      activeBorder: string;
                      activeBg: string;
                      iconBg: string;
                    }
                  > = {
                    "/summary": {
                      border: "border-blue-200 hover:border-blue-300",
                      activeBorder: "border-blue-400 shadow-xs",
                      activeBg: "bg-blue-50/70",
                      iconBg:
                        "bg-blue-50 text-blue-600 border border-blue-200/80",
                    },
                    "/traffic-stats": {
                      border: "border-emerald-200 hover:border-emerald-300",
                      activeBorder: "border-emerald-400 shadow-xs",
                      activeBg: "bg-emerald-50/70",
                      iconBg:
                        "bg-emerald-50 text-emerald-600 border border-emerald-200/80",
                    },
                    "/realtime": {
                      border: "border-rose-200 hover:border-rose-300",
                      activeBorder: "border-rose-400 shadow-xs",
                      activeBg: "bg-rose-50/70",
                      iconBg:
                        "bg-rose-50 text-rose-600 border border-rose-200/80",
                    },
                    "/sources": {
                      border: "border-amber-200 hover:border-amber-300",
                      activeBorder: "border-amber-400 shadow-xs",
                      activeBg: "bg-amber-50/70",
                      iconBg:
                        "bg-amber-50 text-amber-600 border border-amber-200/80",
                    },
                    "/devices": {
                      border: "border-purple-200 hover:border-purple-300",
                      activeBorder: "border-purple-300 shadow-xs",
                      activeBg: "bg-purple-50/70",
                      iconBg:
                        "bg-purple-50 text-purple-600 border border-purple-200/80",
                    },
                    "/geography": {
                      border: "border-sky-200 hover:border-sky-300",
                      activeBorder: "border-sky-300 shadow-xs",
                      activeBg: "bg-sky-50/70",
                      iconBg: "bg-sky-50 text-sky-600 border border-sky-200/80",
                    },
                    "/pages": {
                      border: "border-pink-200 hover:border-pink-300",
                      activeBorder: "border-pink-300 shadow-xs",
                      activeBg: "bg-pink-50/70",
                      iconBg:
                        "bg-pink-50 text-pink-600 border border-pink-200/80",
                    },
                    "/settings": {
                      border: "border-slate-200 hover:border-slate-300",
                      activeBorder: "border-slate-300 shadow-xs",
                      activeBg: "bg-slate-50",
                      iconBg:
                        "bg-slate-100 text-slate-600 border border-slate-200/80",
                    },
                  };

                  const currentStyle = themeStyles[item.href] || {
                    border: "border-slate-200",
                    activeBorder: "border-blue-400",
                    activeBg: "bg-blue-50/70",
                    iconBg:
                      "bg-slate-100 text-slate-600 border border-slate-200/80",
                  };

                  return (
                    <Link
                      key={item.href}
                      prefetch={true}
                      href={itemHref}
                      style={{ padding: "0.05rem" }}
                      className={`block rounded-[9px] border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:translate-x-0.5 ${
                        isActive
                          ? `${currentStyle.activeBorder} ${currentStyle.activeBg}`
                          : `${currentStyle.border} bg-white`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 px-1.5 py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* 3D Animated Icon Box */}
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 ${currentStyle.iconBg}`}
                          >
                            <item.icon
                              size={13}
                              className="w-3 h-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                              strokeColor={item.theme?.stroke || "#1455bb"}
                            />
                          </div>
                          <span
                            className={`font-bold text-[11px] truncate transition-colors ${
                              isActive
                                ? "text-slate-900 font-extrabold"
                                : "text-slate-800"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {item.isLive ? (
                          <span className="px-1 py-0.2 rounded-full text-[8px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5 shrink-0">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                              {typeof activeCount === "number" &&
                              activeCount > 0
                                ? activeCount
                                : "LIVE"}
                            </span>
                          </span>
                        ) : item.badge ? (
                          <span className="px-1 py-0.2 rounded-full text-[8px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
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
