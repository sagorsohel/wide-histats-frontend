"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  TrendingUp,
  Activity,
  Compass,
  FileText,
  Smartphone,
  Globe2,
  Globe,
  Settings,
  Sliders,
  Plus,
  Code2,
  ChevronRight,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
import { useAppSelector } from "@/store";

export interface NavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isLive?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Traffic & Analytics",
    items: [
      {
        href: "/summary",
        label: "Overview Summary",
        subtitle: "Key performance metrics",
        icon: LayoutGrid,
      },
      {
        href: "/traffic-stats",
        label: "Traffic Stats",
        subtitle: "Visitors, sessions & hits",
        icon: TrendingUp,
      },
      {
        href: "/realtime",
        label: "Users Online",
        subtitle: "Real-time presence",
        icon: Activity,
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
        icon: Compass,
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
        icon: Smartphone,
      },
      {
        href: "/geography",
        label: "Geolocation",
        subtitle: "Countries & world map",
        icon: Globe2,
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
        icon: FileText,
      },
    ],
  },
  {
    title: "System & Settings",
    items: [
      {
        href: "/control-panel",
        label: "Control Panel",
        subtitle: "Manage all websites",
        icon: Sliders,
      },
      {
        href: "/settings",
        label: "Settings",
        subtitle: "Preferences & tracking",
        icon: Settings,
      },
    ],
  },
];

// Helper to extract clean domain for favicon lookup
export const getCleanDomain = (domain: string): string => {
  if (!domain) return "";
  try {
    return domain.replace(/^(?:https?:\/\/)?/i, "").split("/")[0].split(":")[0];
  } catch {
    return domain;
  }
};

// Website Favicon Component with High-Res CDN + Fallback Letter Avatar
export const WebsiteFavicon: React.FC<{
  name: string;
  domain: string;
  className?: string;
}> = ({ name, domain, className = "w-5 h-5" }) => {
  const [imgError, setImgError] = useState(false);
  const clean = getCleanDomain(domain);
  const faviconUrl = clean
    ? `https://www.google.com/s2/favicons?domain=${clean}&sz=64`
    : "";
  const initial = (name || clean || "W").charAt(0).toUpperCase();

  if (faviconUrl && !imgError) {
    return (
      <img
        src={faviconUrl}
        alt={name || domain}
        onError={() => setImgError(true)}
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { websites, selectedWebsite, setSelectedWebsite, openTrackingModal } =
    useWebsite();

  // Reactive real-time active visitor count from Redux
  const realtimeData = useAppSelector((state) =>
    selectedWebsite?.id ? state.realtime.byWebsite[selectedWebsite.id]?.data : null
  );
  const activeCount = realtimeData?.activeCount;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide sidebar on auth pages, root, and control panel
  if (
    !mounted ||
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
                        onClick={() => setSelectedWebsite(site)}
                        title={`Active: ${site.name} (${site.domain})`}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2 shadow-sm border border-slate-200/80 ring-2 ring-blue-500/25 cursor-pointer active:scale-95 transition-all"
                      >
                        <WebsiteFavicon
                          name={site.name}
                          domain={site.domain}
                          className="w-5 h-5"
                        />
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
                  onClick={() => setSelectedWebsite(site)}
                  title={`${site.name} (${site.domain})`}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center p-2 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group backdrop-blur-xs"
                >
                  <WebsiteFavicon
                    name={site.name}
                    domain={site.domain}
                    className="w-5 h-5 drop-shadow-xs"
                  />
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
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer mt-1"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        {/* Bottom Rail Tracker Code Trigger */}
        {selectedWebsite && (
          <button
            type="button"
            onClick={() => openTrackingModal(selectedWebsite)}
            title="Get Tracker Code"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-blue-100 flex items-center justify-center transition-all cursor-pointer mt-auto"
          >
            <Code2 className="w-4 h-4" />
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
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/summary" && pathname === "/summery") ||
                    (item.href === "/control-panel" && pathname === "/websites");

                  if (isActive) {
                    // Active Card (Exact Glendale Project Blue Highlight Card)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block p-3 rounded-xl bg-gradient-to-r from-[#1455bb] to-[#1a62d4] text-white shadow-md shadow-blue-600/25 transition-all group scale-[1.01]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Icon className="w-3.5 h-3.5" />
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
                                {typeof activeCount === "number" && activeCount > 0
                                  ? `${activeCount} Live`
                                  : "Live"}
                              </span>
                            </span>
                          ) : item.badge ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/20 text-white border border-white/30 shrink-0">
                              {item.badge}
                            </span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
                          )}
                        </div>
                      </Link>
                    );
                  }

                  // Inactive Card (White card matching Medium.com & HR Sites in screenshot)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-blue-300 hover:shadow-xs hover:translate-x-0.5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
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
                              {typeof activeCount === "number" && activeCount > 0
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
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] active:scale-[0.98] text-white font-bold text-xs shadow-xs shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Get Tracking Code</span>
            </button>
          ) : (
            <Link
              href="/control-panel"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all"
            >
              <span>Manage Websites</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Engine Status */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-medium pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Wide-Histat Engine v2.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
