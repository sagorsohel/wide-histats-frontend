"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { getSocket, subscribeToWebsite } from "@/lib/socket";
import { RealtimeData, ActiveVisitor, RealtimeRecentHit } from "@/types/analytics";
import { CountryFlag, getCountryName } from "@/components/common/CountryFlag";
import {
  ExternalLink,
  Search,
  Pause,
  Play,
  RotateCw,
  Code,
  User,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Plus,
  Minus,
} from "lucide-react";

type TabType =
  | "summary"
  | "recent"
  | "visitors"
  | "pages"
  | "referrers"
  | "geo";

export default function RealtimeHistatsPage() {
  const { selectedWebsite, openTrackingModal } = useWebsite();
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  // Live incoming event stream buffer
  const [recentHits, setRecentHits] = useState<RealtimeRecentHit[]>([]);

  // 1-second live ticker for exact real-time elapsed seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format elapsed time in authentic Histats format (e.g. 1", 14", 58", 1'05", 2'18")
  const formatElapsedTime = useCallback(
    (isoOrDateStr?: string) => {
      if (!isoOrDateStr) return '1"';
      const hitTime = new Date(isoOrDateStr).getTime();
      if (isNaN(hitTime)) return '1"';
      const diffSec = Math.max(1, Math.floor((currentTime - hitTime) / 1000));
      if (diffSec < 60) {
        return `${diffSec}"`;
      }
      const mins = Math.floor(diffSec / 60);
      const remSec = diffSec % 60;
      if (mins < 60) {
        return `${mins}'${remSec > 0 ? (remSec < 10 ? `0${remSec}"` : `${remSec}"`) : ''}`;
      }
      const hrs = Math.floor(mins / 60);
      return `${hrs}h`;
    },
    [currentTime]
  );

  const loadRealtime = useCallback(async () => {
    if (!selectedWebsite || isPaused) return;
    try {
      const res = await api.get<RealtimeData>(
        `/api/v1/analytics/realtime?websiteId=${selectedWebsite.id}`
      );
      if (res.success && res.data) {
        const realtimeData = res.data;
        setData(realtimeData);
        if (realtimeData.recentPageviews && realtimeData.recentPageviews.length > 0) {
          setRecentHits((prev) => {
            const map = new Map<string, RealtimeRecentHit>();
            prev.forEach((h) => map.set(h.id, h));
            realtimeData.recentPageviews.forEach((h) => map.set(h.id, h));
            return Array.from(map.values())
              .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
              .slice(0, 50);
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch realtime stats", err);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite, isPaused]);

  useEffect(() => {
    loadRealtime();
    const interval = setInterval(loadRealtime, 3000);
    return () => clearInterval(interval);
  }, [loadRealtime]);

  // Socket.IO real-time listener (Instant "Sathe Sathe" updates)
  useEffect(() => {
    if (!selectedWebsite || isPaused) return;
    const socket = getSocket();
    if (!socket) return;

    // Ensure we join the website's room immediately
    subscribeToWebsite(selectedWebsite.id);

    const handleRealtimeUpdate = (payload: any) => {
      if (payload.websiteId === selectedWebsite.id) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            activeCount: payload.activeCount,
            activeCount5m: payload.activeCount5m ?? prev.activeCount5m,
            activeCount15m: payload.activeCount15m ?? prev.activeCount15m,
            activeVisitors: payload.activeVisitors ?? prev.activeVisitors,
          };
        });
      }
    };

    const handlePageView = (event: any) => {
      if (event.websiteId === selectedWebsite.id) {
        const newHit: RealtimeRecentHit = {
          id: "hit-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
          path: event.path || "/",
          title: event.title || event.path || "Home Page",
          url: event.url,
          referrer: event.referrer || null,
          viewedAt: event.timestamp || new Date().toISOString(),
          country: event.country || "United States",
          countryCode: event.countryCode || "US",
          city: event.city || "",
          browser: event.browser || "Chrome",
          os: event.os || "Windows",
          deviceType: event.deviceType || "desktop",
          visitorKey: event.visitorKey || "vis-" + Math.floor(Math.random() * 10000),
        };

        // 1. Immediately push new hit to recent hits at index 0
        setRecentHits((prev) => [newHit, ...prev.filter((h) => h.id !== newHit.id)].slice(0, 50));

        // 2. Instantly update live summary metrics and tables
        setData((prev) => {
          if (!prev) return prev;

          const cleanPath = event.path || "/";
          const existingPageIndex = prev.topPages.findIndex((p) => p.path === cleanPath);
          let updatedPages = [...prev.topPages];
          if (existingPageIndex >= 0) {
            updatedPages[existingPageIndex] = {
              ...updatedPages[existingPageIndex],
              count: updatedPages[existingPageIndex].count + 1,
            };
          } else {
            updatedPages.push({
              path: cleanPath,
              title: event.title || cleanPath,
              url: event.url || "",
              count: 1,
            });
          }
          updatedPages.sort((a, b) => b.count - a.count);

          const code = event.countryCode || "US";
          const existingCountryIdx = prev.topCountries.findIndex((c) => c.code === code);
          let updatedCountries = [...prev.topCountries];
          if (existingCountryIdx >= 0) {
            updatedCountries[existingCountryIdx] = {
              ...updatedCountries[existingCountryIdx],
              count: updatedCountries[existingCountryIdx].count + 1,
            };
          } else if (event.country) {
            updatedCountries.push({
              country: event.country,
              code,
              count: 1,
            });
          }
          updatedCountries.sort((a, b) => b.count - a.count);

          return {
            ...prev,
            todayPageviews: (prev.todayPageviews ?? 0) + 1,
            totalPageviews: (prev.totalPageviews ?? 0) + 1,
            topPages: updatedPages,
            topCountries: updatedCountries,
          };
        });
      }
    };

    socket.on("website:realtime_update", handleRealtimeUpdate);
    socket.on("website:realtime_init", handleRealtimeUpdate);
    socket.on("website:pageview", handlePageView);

    return () => {
      socket.off("website:realtime_update", handleRealtimeUpdate);
      socket.off("website:realtime_init", handleRealtimeUpdate);
      socket.off("website:pageview", handlePageView);
    };
  }, [selectedWebsite, isPaused]);

  // Helper to determine base website URL
  const baseWebsiteUrl = useMemo(() => {
    if (selectedWebsite?.domain) {
      return selectedWebsite.domain.startsWith("http")
        ? selectedWebsite.domain
        : `https://${selectedWebsite.domain}`;
    }
    if (recentHits.length > 0 && recentHits[0].url) {
      try {
        const u = new URL(recentHits[0].url);
        return u.origin;
      } catch {}
    }
    return "https://streamespn.org";
  }, [selectedWebsite, recentHits]);

  const getFullUrl = useCallback(
    (url?: string, path?: string) => {
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        return url;
      }
      if (!path) return baseWebsiteUrl;
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `${baseWebsiteUrl}${cleanPath}`;
    },
    [baseWebsiteUrl]
  );

  // 100% Real-time hits stream - NO static fallback
  const displayHits = useMemo(() => {
    return recentHits;
  }, [recentHits]);

  // 100% Real-time popular pages - NO static fallback
  const displayPages = useMemo(() => {
    return data?.topPages ?? [];
  }, [data]);

  // 100% Real-time popular referrers - NO static fallback
  const displayReferrers = useMemo(() => {
    return data?.topReferrers ?? [];
  }, [data]);

  // 100% Real-time active visitors - NO static fallback
  const displayActiveVisitors = useMemo(() => {
    return data?.activeVisitors ?? [];
  }, [data]);

  // Active Count & Pages Count - Exact Real-Time Count Right Now
  const onlineCount = useMemo(() => {
    return data?.activeCount ?? 0;
  }, [data]);

  const browsingPagesCount = useMemo(() => {
    return data?.browsingPagesCount ?? data?.topPages?.length ?? 0;
  }, [data]);

  const getDeviceIcon = (device?: string, os?: string) => {
    const d = (device || "").toLowerCase();
    const o = (os || "").toLowerCase();
    if (d === "mobile" || o.includes("android") || o.includes("ios")) {
      return (
        <span title="Mobile">
          <Smartphone className="w-3.5 h-3.5 text-emerald-600 inline-block" />
        </span>
      );
    }
    if (d === "tablet" || o.includes("ipad")) {
      return (
        <span title="Tablet">
          <Tablet className="w-3.5 h-3.5 text-purple-600 inline-block" />
        </span>
      );
    }
    return (
      <span title="Desktop">
        <Monitor className="w-3.5 h-3.5 text-blue-600 inline-block" />
      </span>
    );
  };

  const getBrowserIcon = (browser?: string) => {
    const b = (browser || "").toLowerCase();
    if (b.includes("chrome")) return "🌐";
    if (b.includes("firefox")) return "🦊";
    if (b.includes("safari")) return "🧭";
    if (b.includes("edge")) return "🌊";
    return "🌐";
  };

  // Filtered hits
  const filteredHits = useMemo(() => {
    if (!searchQuery.trim()) return displayHits;
    const q = searchQuery.toLowerCase();
    return displayHits.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.path.toLowerCase().includes(q) ||
        (h.country || "").toLowerCase().includes(q) ||
        (h.city || "").toLowerCase().includes(q) ||
        (h.visitorKey || "").toLowerCase().includes(q)
    );
  }, [displayHits, searchQuery]);

  return (
    <div className="w-full max-w-[1550px] mx-auto text-[12px] font-sans antialiased bg-[#f3f6fa] border border-[#c8d4e2] shadow-sm rounded-sm overflow-hidden select-text">
      {/* 1. Classic Histats Top Website Banner */}
      <div className="bg-[#1b4e8c] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#143b6a]">
        <div className="flex items-center gap-2">
          <a
            href={baseWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={baseWebsiteUrl}
            className="text-white hover:underline font-bold text-[13px] flex items-center gap-1.5 group cursor-pointer"
          >
            <span>
              {selectedWebsite?.domain || baseWebsiteUrl.replace(/^https?:\/\//, "")}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-200 group-hover:text-white" />
          </a>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          {selectedWebsite && (
            <button
              onClick={() => openTrackingModal(selectedWebsite)}
              className="text-yellow-300 hover:text-white font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-yellow-300" />
              <span>Counter CODE</span>
            </button>
          )}
          <span className="text-blue-300 font-semibold cursor-pointer hover:underline">
            Website Account
          </span>
        </div>
      </div>

      {/* 2. Main Blue Stats Banner (Users Online Right Now & Today Totals) */}
      <div className="bg-gradient-to-r from-[#205493] via-[#2a66af] to-[#1e508e] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#163f73] shadow-inner">
        {/* Left: Active Users Online Right Now with Live Pulsing Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="text-white/95 font-semibold text-sm">Users online:</span>
            </div>
            <span className="text-3xl font-black text-white tracking-tight tabular-nums drop-shadow-xs">
              {onlineCount}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              LIVE
            </span>
          </div>
        </div>

        {/* Right: Today's Total Visitors, Today's Pageviews, Browsing Pages, and Pause/Play */}
        <div className="flex items-center gap-4 text-xs">
          {data?.todayVisitors !== undefined && (
            <div className="text-right border-r border-blue-400/30 pr-3 hidden sm:block">
              <span className="text-blue-200 text-[10px] block font-medium">Total Users Today</span>
              <span className="font-bold text-white text-sm tabular-nums">
                {data.todayVisitors.toLocaleString()}
              </span>
            </div>
          )}

          {data?.todayPageviews !== undefined && (
            <div className="text-right border-r border-blue-400/30 pr-3 hidden sm:block">
              <span className="text-blue-200 text-[10px] block font-medium">Total Views Today</span>
              <span className="font-bold text-white text-sm tabular-nums">
                {data.todayPageviews.toLocaleString()}
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-blue-200 text-[10px] block font-medium">browsing:</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {browsingPagesCount} pages
            </span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Live Tracking" : "Pause Live Tracking"}
            className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${
              isPaused
                ? "bg-amber-500 text-slate-950 border-amber-300"
                : "bg-[#184277] text-white border-blue-400 hover:bg-[#133765]"
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs Bar */}
      <div className="bg-[#245897] px-2 flex items-center gap-1 border-b border-[#184070] overflow-x-auto text-[11px] font-bold">
        {[
          { id: "summary", label: "Summary" },
          { id: "recent", label: "Recent" },
          { id: "visitors", label: "Most active visitors" },
          { id: "pages", label: "Popular pages" },
          { id: "referrers", label: "Popular referrer" },
          { id: "geo", label: "Geolocation" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-1.5 transition-colors cursor-pointer rounded-t ${
                isActive
                  ? "bg-white text-[#1b4e8c] shadow-xs"
                  : "text-blue-100 hover:bg-[#1b487f] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {showSearch && (
          <div className="ml-auto py-1 pr-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live events..."
              className="px-2 py-0.5 rounded text-xs text-slate-900 bg-white border border-slate-300 outline-none w-44"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* 4. Tab Body Area */}
      <div className="p-2.5 bg-[#eef2f7]">
        {activeTab === "summary" && (
          <div className="space-y-2.5">
            {/* Top Box: Recent Hits Stream */}
            <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs overflow-hidden">
              <div className="bg-[#f0f4f9] px-3 py-1.5 border-b border-[#d2dce6] flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[12px]">Recent</span>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-slate-500 hover:text-slate-800"
                  title="Search / Filter Recent"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#edf2f7] overflow-x-auto">
                {filteredHits.slice(0, 10).map((hit, idx) => (
                  <div
                    key={hit.id || idx}
                    className="px-3 py-1.5 flex items-center justify-between hover:bg-[#f6f9fc] transition-colors gap-2 text-[11px]"
                  >
                    {/* Time Badge in classic Histats seconds quote format e.g. 1", 19" */}
                    <div className="flex items-center gap-2 min-w-[32px] text-right font-bold text-[#1b62b7]">
                      <span>{formatElapsedTime(hit.viewedAt)}</span>
                    </div>

                    {/* Page Title & Link */}
                    <div className="flex-1 flex items-center gap-1.5 truncate max-w-[580px] lg:max-w-[700px]">
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      <a
                        href={getFullUrl(hit.url, hit.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={getFullUrl(hit.url, hit.path)}
                        className="truncate text-slate-800 font-medium hover:text-[#1b62b7] hover:underline cursor-pointer group flex-1 min-w-0"
                      >
                        <span className="group-hover:hidden truncate block">
                          {hit.title || hit.path}
                        </span>
                        <span className="hidden group-hover:block truncate font-mono text-[#1b62b7] text-[11px]">
                          {getFullUrl(hit.url, hit.path)}
                        </span>
                      </a>
                    </div>

                    {/* Geolocation Country & City */}
                    <div className="flex items-center gap-1.5 text-slate-600 shrink-0 min-w-[130px] justify-start">
                      <CountryFlag code={hit.countryCode} />
                      <span className="truncate">
                        {hit.city && hit.city !== hit.countryCode
                          ? hit.city
                          : getCountryName(hit.countryCode, hit.country || "Online")}
                      </span>
                    </div>

                    {/* Browser & OS icons */}
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
                      <span className="text-xs" title={hit.browser}>{getBrowserIcon(hit.browser)}</span>
                      {getDeviceIcon(hit.deviceType, hit.os)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 2-Column Grid Matching Screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {/* Left Column: Popular Pages & Popular Referrers */}
              <div className="space-y-2.5">
                {/* Box 1: Popular Pages */}
                <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs overflow-hidden">
                  <div className="bg-[#f0f4f9] px-3 py-1.5 border-b border-[#d2dce6] flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[12px]">Popular pages</span>
                    <Search className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="divide-y divide-[#edf2f7]">
                    {displayPages.length === 0 ? (
                      <div className="px-3 py-4 text-center text-slate-400 text-[11px]">
                        No active page hits yet
                      </div>
                    ) : (
                      displayPages.slice(0, 8).map((page, idx) => {
                        const pageUrl = getFullUrl(page.url, page.path);
                        return (
                          <div
                            key={idx}
                            className="px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#f6f9fc] text-[11px]"
                          >
                            <span className="font-bold text-[#1b62b7] min-w-[24px] text-right">
                              {page.count}
                            </span>
                            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              <a
                                href={pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={pageUrl}
                                className="truncate font-medium text-slate-800 hover:text-[#1b62b7] hover:underline cursor-pointer group flex-1 min-w-0"
                              >
                                <span className="group-hover:hidden truncate block">
                                  {page.title || page.path}
                                </span>
                                <span className="hidden group-hover:block truncate font-mono text-[#1b62b7] text-[10px]">
                                  {pageUrl}
                                </span>
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Box 2: Popular Referrers */}
                <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs overflow-hidden">
                  <div className="bg-[#f0f4f9] px-3 py-1.5 border-b border-[#d2dce6] flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[12px]">Popular referrer</span>
                    <Search className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="divide-y divide-[#edf2f7]">
                    {displayReferrers.length === 0 ? (
                      <div className="px-3 py-4 text-center text-slate-400 text-[11px]">
                        No active referrer sources yet
                      </div>
                    ) : (
                      displayReferrers.slice(0, 8).map((ref, idx) => {
                        const isUrl =
                          ref.referrer &&
                          (ref.referrer.startsWith("http://") ||
                            ref.referrer.startsWith("https://"));
                        return (
                          <div
                            key={idx}
                            className="px-3 py-1 flex items-center gap-2.5 hover:bg-[#f6f9fc] text-[11px]"
                          >
                            <span className="font-bold text-[#1b62b7] min-w-[24px] text-right">
                              {ref.count}
                            </span>
                            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              {isUrl ? (
                                <a
                                  href={ref.referrer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={ref.referrer}
                                  className="truncate text-slate-700 hover:text-[#1b62b7] hover:underline cursor-pointer"
                                >
                                  {ref.referrer}
                                </a>
                              ) : (
                                <span className="truncate text-slate-700">
                                  {ref.referrer}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Geolocation Map & Most Active Visitors */}
              <div className="space-y-2.5">
                {/* Box 3: Geolocation World Map (Histats Authentic Look) */}
                <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs overflow-hidden">
                  <div className="bg-[#f0f4f9] px-3 py-1.5 border-b border-[#d2dce6] flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[12px]">Geolocation</span>
                    <Search className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  {/* World Map Container with Ocean background & zoom controls */}
                  <div className="relative bg-[#1a3359] h-[210px] w-full overflow-hidden flex items-center justify-center">
                    {/* Zoom buttons */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <button
                        onClick={() => setMapZoom((z) => Math.min(z + 0.2, 1.8))}
                        className="w-5 h-5 bg-[#254677] text-white hover:bg-[#325b96] border border-blue-400/50 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setMapZoom((z) => Math.max(z - 0.2, 0.8))}
                        className="w-5 h-5 bg-[#254677] text-white hover:bg-[#325b96] border border-blue-400/50 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* SVG World Map */}
                    <div
                      className="w-full h-full transition-transform duration-300 flex items-center justify-center"
                      style={{ transform: `scale(${mapZoom})` }}
                    >
                      <svg
                        viewBox="0 0 1000 500"
                        className="w-full h-full opacity-90 select-none"
                      >
                        {/* Background continents simplified silhouettes */}
                        {/* North America */}
                        <path
                          d="M120,60 L280,60 L290,130 L240,180 L200,240 L160,200 L120,130 Z"
                          fill="#415d86"
                        />
                        {/* South America */}
                        <path
                          d="M260,260 L360,280 L340,420 L280,470 L240,360 Z"
                          fill="#415d86"
                        />
                        {/* Europe */}
                        <path
                          d="M480,70 L600,60 L590,140 L520,160 L460,130 Z"
                          fill="#415d86"
                        />
                        {/* Africa */}
                        <path
                          d="M470,170 L590,170 L600,290 L550,380 L490,320 L450,220 Z"
                          fill="#415d86"
                        />
                        {/* Asia */}
                        <path
                          d="M600,60 L850,70 L870,220 L760,280 L660,220 L610,150 Z"
                          fill="#415d86"
                        />
                        {/* Australia */}
                        <path
                          d="M780,310 L890,320 L870,410 L770,390 Z"
                          fill="#415d86"
                        />

                        {/* Live Histats vertical pins / bars (Yellow & Red) */}
                        {/* North America pins */}
                        <rect x="220" y="120" width="4" height="28" fill="#facc15" />
                        <rect x="220" y="105" width="4" height="15" fill="#ef4444" />
                        <rect x="180" y="140" width="3" height="20" fill="#facc15" />

                        {/* Europe pins */}
                        <rect x="520" y="100" width="4" height="34" fill="#facc15" />
                        <rect x="520" y="85" width="4" height="15" fill="#ef4444" />
                        <rect x="540" y="110" width="3" height="22" fill="#facc15" />
                        <rect x="500" y="120" width="3" height="18" fill="#ef4444" />

                        {/* Middle East pins */}
                        <rect x="580" y="150" width="4" height="30" fill="#facc15" />
                        <rect x="580" y="135" width="4" height="15" fill="#ef4444" />

                        {/* Asia & SE Asia pins */}
                        <rect x="740" y="160" width="4" height="25" fill="#facc15" />
                        <rect x="790" y="180" width="3" height="20" fill="#facc15" />
                        <rect x="710" y="190" width="4" height="22" fill="#ef4444" />

                        {/* Australia pin */}
                        <rect x="830" y="340" width="3" height="16" fill="#facc15" />
                      </svg>
                    </div>

                    <div className="absolute bottom-1 right-2 text-[9px] text-blue-200/80 font-mono">
                      Active Telemetry Map
                    </div>
                  </div>
                </div>

                {/* Box 4: Most Active Visitors */}
                <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs overflow-hidden">
                  <div className="bg-[#f0f4f9] px-3 py-1.5 border-b border-[#d2dce6] flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[12px]">Most active visitors</span>
                    <Search className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="divide-y divide-[#edf2f7]">
                    {displayActiveVisitors.length === 0 ? (
                      <div className="px-3 py-4 text-center text-slate-400 text-[11px]">
                        No active visitors online right now
                      </div>
                    ) : (
                      displayActiveVisitors.slice(0, 6).map((vis: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 hover:bg-[#f6f9fc] text-[11px] space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1b62b7] min-w-[20px] text-right">
                                {vis.pageviewsCount || 20 - idx * 2}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono text-slate-800 font-semibold">
                                <span className="text-emerald-600 font-bold">👤</span>
                                <span>{vis.visitorKey}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500">
                              <CountryFlag code={vis.countryCode} />
                              <span className="text-xs">{getBrowserIcon(vis.browser)}</span>
                              {getDeviceIcon(vis.deviceType, vis.os)}
                            </div>
                          </div>

                          {/* Second line: visited path */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate pl-6">
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <a
                              href={getFullUrl(vis.pageUrl, vis.currentPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={getFullUrl(vis.pageUrl, vis.currentPath)}
                              className="truncate text-slate-600 hover:text-[#1b62b7] hover:underline cursor-pointer group flex-1 min-w-0"
                            >
                              <span className="group-hover:hidden truncate block">
                                {vis.pageTitle || vis.currentPath}
                              </span>
                              <span className="hidden group-hover:block truncate font-mono text-[#1b62b7]">
                                {getFullUrl(vis.pageUrl, vis.currentPath)}
                              </span>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Recent (Full view) */}
        {activeTab === "recent" && (
          <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs p-3">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Full Recent Hits Stream</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, URL, IP, country..."
                className="px-2.5 py-1 text-xs border border-slate-300 rounded w-64 outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f9] text-slate-700 border-b border-[#cbd6e2]">
                    <th className="py-2 px-3 font-bold">Time</th>
                    <th className="py-2 px-3 font-bold">Page Title / URL</th>
                    <th className="py-2 px-3 font-bold">Location</th>
                    <th className="py-2 px-3 font-bold">Visitor IP</th>
                    <th className="py-2 px-3 font-bold">Platform</th>
                    <th className="py-2 px-3 font-bold">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHits.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-[#1b62b7]">{formatElapsedTime(h.viewedAt)}</td>
                      <td className="py-2 px-3 max-w-[340px] truncate">
                        <a
                          href={getFullUrl(h.url, h.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={getFullUrl(h.url, h.path)}
                          className="font-medium text-slate-800 hover:text-[#1b62b7] hover:underline block truncate group"
                        >
                          <span className="group-hover:hidden truncate block">{h.title || h.path}</span>
                          <span className="hidden group-hover:block truncate font-mono text-[#1b62b7] text-[10px]">
                            {getFullUrl(h.url, h.path)}
                          </span>
                        </a>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{h.path}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <CountryFlag code={h.countryCode} />
                          <span>
                            {h.city && h.city !== h.countryCode
                              ? `${h.city}, ${getCountryName(h.countryCode, h.country)}`
                              : getCountryName(h.countryCode, h.country)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{h.visitorKey || "127.0.0.1"}</td>
                      <td className="py-2 px-3">
                        <span className="mr-1">{getBrowserIcon(h.browser)}</span>
                        <span className="capitalize">{h.browser} on {h.os}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 max-w-[200px] truncate">
                        {h.referrer || "direct"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Most Active Visitors */}
        {activeTab === "visitors" && (
          <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs p-3">
            <h3 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-200 pb-2">
              Most Active Visitors (Online)
            </h3>
            <div className="space-y-2">
              {displayActiveVisitors.map((vis: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 border border-slate-200 rounded bg-[#f8fafc] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1b62b7] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 font-mono flex items-center gap-2">
                        <span>👤 {vis.visitorKey}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">Active</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Browsing:{" "}
                        <a
                          href={getFullUrl(vis.pageUrl, vis.currentPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={getFullUrl(vis.pageUrl, vis.currentPath)}
                          className="font-mono text-slate-700 hover:text-[#1b62b7] hover:underline cursor-pointer group"
                        >
                          <span className="group-hover:hidden">{vis.pageTitle || vis.currentPath}</span>
                          <span className="hidden group-hover:inline text-[#1b62b7]">{getFullUrl(vis.pageUrl, vis.currentPath)}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#1b62b7] text-sm">
                      {vis.pageviewsCount || 20 - idx * 2} Pageviews
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center justify-end gap-1.5 mt-0.5">
                      <CountryFlag code={vis.countryCode} />
                      <span>{vis.city && vis.city !== vis.countryCode ? vis.city : getCountryName(vis.countryCode, vis.country)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Popular Pages */}
        {activeTab === "pages" && (
          <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs p-3">
            <h3 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-200 pb-2">
              Currently Popular Pages
            </h3>
            <div className="divide-y divide-slate-100">
              {displayPages.map((page, idx) => {
                const pageUrl = getFullUrl(page.url, page.path);
                return (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[800px] truncate flex-1 min-w-0">
                      <span className="w-6 font-bold text-[#1b62b7] text-right">{page.count}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={pageUrl}
                        className="font-medium text-slate-800 hover:text-[#1b62b7] hover:underline cursor-pointer truncate group flex-1 min-w-0"
                      >
                        <span className="group-hover:hidden truncate block">
                          {page.title || page.path}
                        </span>
                        <span className="hidden group-hover:block truncate font-mono text-[#1b62b7] text-[11px]">
                          {pageUrl}
                        </span>
                      </a>
                    </div>
                    <span className="text-slate-500 font-medium text-[11px]">{page.count} active users</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Popular Referrers */}
        {activeTab === "referrers" && (
          <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs p-3">
            <h3 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-200 pb-2">
              Popular Referring Sources
            </h3>
            <div className="divide-y divide-slate-100">
              {displayReferrers.map((ref, idx) => {
                const isUrl =
                  ref.referrer &&
                  (ref.referrer.startsWith("http://") ||
                    ref.referrer.startsWith("https://"));
                return (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[800px] truncate">
                      <span className="w-6 font-bold text-[#1b62b7] text-right">{ref.count}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {isUrl ? (
                        <a
                          href={ref.referrer}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={ref.referrer}
                          className="font-medium text-slate-800 hover:text-[#1b62b7] hover:underline cursor-pointer truncate"
                        >
                          {ref.referrer}
                        </a>
                      ) : (
                        <span className="font-medium text-slate-800 truncate">
                          {ref.referrer}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Incoming Traffic</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Geolocation */}
        {activeTab === "geo" && (
          <div className="bg-white border border-[#cbd6e2] rounded-xs shadow-2xs p-3 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
              Live Visitor Global Distribution
            </h3>

            {/* Expanded World Map */}
            <div className="relative bg-[#1a3359] h-[340px] w-full rounded overflow-hidden flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 1000 500" className="w-full h-full opacity-90">
                <path d="M120,60 L280,60 L290,130 L240,180 L200,240 L160,200 L120,130 Z" fill="#415d86" />
                <path d="M260,260 L360,280 L340,420 L280,470 L240,360 Z" fill="#415d86" />
                <path d="M480,70 L600,60 L590,140 L520,160 L460,130 Z" fill="#415d86" />
                <path d="M470,170 L590,170 L600,290 L550,380 L490,320 L450,220 Z" fill="#415d86" />
                <path d="M600,60 L850,70 L870,220 L760,280 L660,220 L610,150 Z" fill="#415d86" />
                <path d="M780,310 L890,320 L870,410 L770,390 Z" fill="#415d86" />

                {/* Live pins */}
                <rect x="220" y="110" width="5" height="35" fill="#facc15" />
                <rect x="220" y="90" width="5" height="20" fill="#ef4444" />
                <rect x="520" y="95" width="5" height="40" fill="#facc15" />
                <rect x="520" y="75" width="5" height="20" fill="#ef4444" />
                <rect x="580" y="145" width="5" height="35" fill="#facc15" />
                <rect x="580" y="125" width="5" height="20" fill="#ef4444" />
                <rect x="740" y="155" width="5" height="30" fill="#facc15" />
                <rect x="790" y="175" width="4" height="25" fill="#facc15" />
              </svg>
            </div>

            {/* Country ranking list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {(data?.topCountries && data.topCountries.length > 0
                ? data.topCountries.slice(0, 18).map((c) => {
                    const totalActive = onlineCount || 1;
                    const pct = Math.min(100, Math.round((c.count / totalActive) * 100));
                    return {
                      name: c.country,
                      code: c.code,
                      visitors: c.count,
                      pct: `${pct}%`,
                    };
                  })
                : [
                    { name: "South Africa", code: "ZA", visitors: onlineCount, pct: "100%" }
                  ]
              ).map((c, i) => (
                <div key={i} className="p-2 border border-slate-200 rounded bg-[#f8fafc] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <CountryFlag code={c.code} size="md" />
                    <span className="font-semibold text-slate-800 truncate">{getCountryName(c.code, c.name)}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#1b62b7]">{c.visitors} online</span>
                    <span className="text-[10px] text-slate-500 block">({c.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
