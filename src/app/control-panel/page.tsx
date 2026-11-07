"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebsite } from "@/context/WebsiteContext";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { subscribeToWebsite } from "@/lib/socket";
import { WebsiteFavicon } from "@/components/layout/Sidebar";
import { getSite7DigitId } from "@/lib/utils";

// Official useAnimations animated icons (https://useanimations.com)
import UseAnimations from "react-useanimations";
import activity from "react-useanimations/lib/activity";
import alertTriangle from "react-useanimations/lib/alertTriangle";
import clock from "react-useanimations/lib/clock";
import externalLink from "react-useanimations/lib/externalLink";
import lock from "react-useanimations/lib/lock";
import plusToX from "react-useanimations/lib/plusToX";
import refresh from "react-useanimations/lib/refresh";
import settings from "react-useanimations/lib/settings";
import trash2 from "react-useanimations/lib/trash2";
import globe from "react-useanimations/lib/globe";

export default function ControlPanelPage() {
  const router = useRouter();
  const {
    websites,
    selectedWebsite,
    loading,
    setSelectedWebsite,
    reloadWebsites,
    createWebsite,
    openTrackingModal,
  } = useWebsite();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirmSite, setDeleteConfirmSite] = useState<Website | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Dynamic live snapshot time
  const [snapshotTime, setSnapshotTime] = useState<string>(() =>
    new Date().toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshotTime(
        new Date().toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadWebsites();
    setSnapshotTime(
      new Date().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    );
    setRefreshing(false);
  };

  // Select website and instantly open its analytics summary with 7-digit ID in URL
  const handleSelectSite = (site: Website, targetPath: string = "/summary") => {
    setSelectedWebsite(site);
    subscribeToWebsite(site.id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("histat:website_changed", { detail: site }),
      );
    }
    const cleanPath = targetPath.endsWith("/") ? targetPath : `${targetPath}/`;
    const site7Digit = getSite7DigitId(site);
    router.push(`${cleanPath}?id=${site7Digit}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) {
      setError("Please fill out both website name and domain.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const site = await createWebsite(name.trim(), domain.trim(), isPublic);
      if (site) {
        setName("");
        setDomain("");
        setModalOpen(false);
        openTrackingModal(site);
        await reloadWebsites();
      } else {
        setError("Failed to register website. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register website.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmSite) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/api/v1/websites/${deleteConfirmSite.id}`);
      if (res.success) {
        await reloadWebsites();
        setDeleteConfirmSite(null);
      } else {
        alert(res.message || "Failed to delete website.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete website.");
    } finally {
      setDeleting(false);
    }
  };

  // Compute clean 7-digit unique display ID for each website (e.g. 4867998, 5055120)
  const getDisplayId = (site: Website): string => {
    return getSite7DigitId(site);
  };

  return (
    // Full bleed container breaking out of main padding to fill 100% of the page
    <div className="-m-2 sm:-m-4 lg:-m-6 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#d6e7fa] via-[#edf4fc] to-[#d8e6f8] relative overflow-hidden flex flex-col antialiased text-slate-800 font-sans select-text">
      {/* ============================================================ */}
      {/* FULL-PAGE AMBIENT RADIAL LIGHT SPHERES                       */}
      {/* ============================================================ */}
      <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] bg-sky-400/28 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[45rem] h-[45rem] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-36 left-1/4 w-[38rem] h-[38rem] bg-indigo-400/22 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] bg-cyan-300/20 rounded-full blur-[100px] pointer-events-none" />

      {/* ============================================================ */}
      {/* MAIN FROSTED GLASS CONTAINER (Full Glassmorphic Canvas)      */}
      {/* ============================================================ */}
      <div className="relative w-full max-w-[1600px] mx-auto rounded-[32px] bg-white/65 backdrop-blur-2xl border border-white/85 shadow-[0_20px_60px_-15px_rgba(20,85,187,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 sm:p-7 lg:p-9 space-y-6 z-10 flex-1 flex flex-col">
        {/* Specular Shimmer Highlight on Top Edge */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

        {/* Top Header Row: Active Count + useAnimations Buttons */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/70">
          {/* Active Websites Indicator with Blue Bar */}
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#1455bb] to-blue-400 shadow-sm" />
            <h1 className="text-base sm:text-lg font-black text-[#1455bb] tracking-tight flex items-center gap-2">
              <span>Active today</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-200/90 text-[#1455bb] text-xs font-black shadow-2xs">
                {websites.length}
              </span>
            </h1>
          </div>

          {/* Action Buttons: Animated Refresh & Register */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Animated Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh website telemetry snapshot"
              className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md border border-white/90 text-slate-700 text-xs font-extrabold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <UseAnimations
                  animation={refresh}
                  size={18}
                  strokeColor="#1455bb"
                  interaction="hover"
                />
              </div>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Animated Register Website Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#1455bb] via-[#165fd4] to-[#1e6ae8] hover:from-[#1047a0] hover:to-[#1755be] text-white text-xs font-black transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <UseAnimations
                  animation={plusToX}
                  size={18}
                  strokeColor="#ffffff"
                  interaction="hover"
                />
              </div>
              <span>Register Website</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* WEBSITE CARDS LIST (With Beautiful Frosted Stats Chips)      */}
        {/* ============================================================ */}
        <div className="space-y-4 flex-1">
          {loading && websites.length === 0 ? (
            <div className="p-16 text-center text-slate-500 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 space-y-3">
              <div className="w-8 h-8 mx-auto flex items-center justify-center">
                <UseAnimations
                  animation={refresh}
                  size={32}
                  strokeColor="#1455bb"
                  loop={true}
                />
              </div>
              <div className="font-bold text-sm text-slate-700">
                Loading your websites telemetry...
              </div>
            </div>
          ) : websites.length === 0 ? (
            <div className="p-16 text-center text-slate-500 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 space-y-4">
              <div className="w-12 h-12 mx-auto flex items-center justify-center">
                <UseAnimations
                  animation={globe}
                  size={48}
                  strokeColor="#1455bb"
                  loop={true}
                />
              </div>
              <h3 className="font-black text-lg text-slate-800">
                No websites registered yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Register your first website to receive instant real-time
                telemetry, interactive analytics, and customizable counter
                badges.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <UseAnimations
                  animation={plusToX}
                  size={16}
                  strokeColor="#ffffff"
                  interaction="hover"
                />
                <span>Register your first website</span>
              </button>
            </div>
          ) : (
            websites.map((site) => {
              const isSelected = selectedWebsite?.id === site.id;
              const displayId = getDisplayId(site);
              const domainUrl = site.domain.startsWith("http")
                ? site.domain
                : `https://${site.domain}`;
              const domainDisplay = site.domain.endsWith("/")
                ? site.domain
                : `${site.domain}/`;

              const usersOnline = site.usersOnline ?? site.activeVisitors ?? 0;
              const visitorsToday = site.visitorsToday ?? 0;
              const pageviewsToday = site.pageviewsToday ?? 0;
              const totalVisitors = site.totalVisitors ?? 0;
              const totalPageviews = site.totalPageviews ?? 0;
              const rowSnapshot = site.snapshotTime || snapshotTime;

              return (
                <div
                  key={site.id}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                    isSelected
                      ? "bg-white/92 backdrop-blur-xl border border-blue-300 shadow-[0_8px_30px_rgba(20,85,187,0.12),inset_0_1px_1px_rgba(255,255,255,1)] ring-2 ring-blue-500/20"
                      : "bg-white/75 hover:bg-white/90 backdrop-blur-lg border border-white/90 hover:border-blue-200/80 shadow-[0_4px_20px_rgba(20,85,187,0.04),inset_0_1px_1px_rgba(255,255,255,0.85)] hover:shadow-[0_12px_32px_rgba(20,85,187,0.09)]"
                  }`}
                >
                  {/* Left & Center: Numeric ID & Beautiful Telemetry Ribbon */}
                  <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                    {/* Blue Numeric Site ID (Glass Pill Badge) */}
                    <div
                      onClick={() => handleSelectSite(site)}
                      title={`Click to view ${site.name} analytics`}
                      className="w-24 sm:w-28 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white/70 backdrop-blur-md border border-blue-400/30 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-blue-500/15 hover:border-blue-500/40 transition-all shadow-inner group"
                    >
                      <span className="text-[#1455bb] font-black text-base sm:text-lg tracking-tight tabular-nums group-hover:scale-105 transition-transform">
                        {displayId}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500/70 mt-0.5">
                        Site ID
                      </span>
                    </div>

                    {/* Middle: Domain Name, Telemetry Badges, Snapshot */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Domain Name + Favicon + Selected Badge */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <WebsiteFavicon
                          name={site.name}
                          domain={site.domain}
                          className="w-5 h-5 shadow-2xs"
                        />

                        <button
                          type="button"
                          onClick={() => handleSelectSite(site)}
                          className="text-left font-black text-slate-900 text-sm sm:text-base hover:text-[#1455bb] transition-colors cursor-pointer truncate"
                        >
                          {domainDisplay}
                        </button>

                        {isSelected && (
                          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455bb] border border-blue-200/90 shadow-2xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1455bb]" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>

                      {/* ============================================================ */}
                      {/* BEAUTIFULLY STYLED TELEMETRY METRIC CHIPS                    */}
                      {/* ============================================================ */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {/* 1. Users Online Chip (Glowing Pulse) */}
                        <div
                          onClick={() => handleSelectSite(site, "/realtime")}
                          title={`View live real-time users for ${site.name}`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            usersOnline > 0
                              ? "bg-rose-50/90 hover:bg-rose-100/90 border-rose-200/90 text-rose-800"
                              : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-600"
                          }`}
                        >
                          <span className="relative flex h-2 w-2 shrink-0">
                            {usersOnline > 0 && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-2 w-2 ${
                                usersOnline > 0 ? "bg-rose-500" : "bg-slate-400"
                              }`}
                            />
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Users online :
                          </span>
                          <span
                            className={`font-black text-xs tabular-nums ${
                              usersOnline > 0
                                ? "text-rose-600"
                                : "text-slate-700"
                            }`}
                          >
                            {usersOnline.toLocaleString()}
                          </span>
                        </div>

                        {/* 2. Visitors Today Chip */}
                        <div
                          onClick={() => handleSelectSite(site, "/traffic-stats")}
                          title={`View traffic stats for ${site.name}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/90 text-emerald-900 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[11px] font-semibold text-emerald-700/80">
                            visitors today :
                          </span>
                          <span className="font-black text-xs text-emerald-700 tabular-nums">
                            {visitorsToday.toLocaleString()}
                          </span>
                        </div>

                        {/* 3. Page Views Today Chip */}
                        <div
                          onClick={() => handleSelectSite(site, "/traffic-stats")}
                          title={`View traffic stats for ${site.name}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/90 text-blue-900 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-[11px] font-semibold text-blue-700/80">
                            Page views today :
                          </span>
                          <span className="font-black text-xs text-blue-700 tabular-nums">
                            {pageviewsToday.toLocaleString()}
                          </span>
                        </div>

                        {/* 4. Total Visitors Chip */}
                        <div
                          onClick={() => handleSelectSite(site, "/summary")}
                          title={`View summary for ${site.name}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                          <span className="text-[11px] font-semibold text-slate-500">
                            Total visitors :
                          </span>
                          <span className="font-black text-xs text-slate-900 tabular-nums">
                            {totalVisitors.toLocaleString()}
                          </span>
                        </div>

                        {/* 5. Total Page Views Chip */}
                        <div
                          onClick={() => handleSelectSite(site, "/summary")}
                          title={`View summary for ${site.name}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-950 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                          <span className="text-[11px] font-semibold text-indigo-600/90">
                            Total page views :
                          </span>
                          <span className="font-black text-xs text-indigo-900 tabular-nums">
                            {totalPageviews.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Animated Clock & Snapshot Timestamp */}
                    </div>
                  </div>

                  {/* Right: 5 Animated Squircle Action Buttons from useAnimations */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
                    {/* 1. Open Website in New Window (Animated externalLink) */}
                    <a
                      href={domainUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open ${site.domain} in new tab`}
                      className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 hover:border-blue-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                    >
                      <UseAnimations
                        animation={externalLink}
                        size={18}
                        strokeColor="#64748b"
                        interaction="hover"
                      />
                    </a>

                    {/* 2. Public / Private Lock (Animated lock toggle) */}
                    <button
                      type="button"
                      onClick={() => {
                        alert(
                          `Website "${site.name}" statistics are currently ${
                            site.isPublic
                              ? "PUBLIC (Unlocked)"
                              : "PRIVATE (Locked)"
                          }.`,
                        );
                      }}
                      title={
                        site.isPublic
                          ? "Public Statistics (Unlocked)"
                          : "Private Statistics (Locked)"
                      }
                      className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 hover:border-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                    >
                      <UseAnimations
                        animation={lock}
                        size={18}
                        strokeColor="#f59e0b"
                        active={!site.isPublic}
                        interaction="hover"
                      />
                    </button>

                    {/* 3. Analytics Activity / Reports (Animated activity pulse) */}
                    <button
                      type="button"
                      onClick={() => handleSelectSite(site, "/summary")}
                      title={`Open Analytics for ${site.name}`}
                      className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 hover:border-blue-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                    >
                      <UseAnimations
                        animation={activity}
                        size={20}
                        strokeColor="#1455bb"
                        interaction="hover"
                      />
                    </button>

                    {/* 4. Configuration & Tracker Code (Animated settings gear) */}
                    <button
                      type="button"
                      onClick={() => openTrackingModal(site)}
                      title={`Configure & Get Tracking Code for ${site.name}`}
                      className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 hover:border-blue-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                    >
                      <UseAnimations
                        animation={settings}
                        size={18}
                        strokeColor="#475569"
                        interaction="hover"
                      />
                    </button>

                    {/* 5. Delete Website (Animated trash2 opening lid) */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmSite(site)}
                      title={`Delete ${site.name}`}
                      className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-rose-50 backdrop-blur-md border border-white/90 hover:border-rose-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                    >
                      <UseAnimations
                        animation={trash2}
                        size={18}
                        strokeColor="#e11d48"
                        interaction="hover"
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: REGISTER NEW WEBSITE (Full Glassmorphism)             */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/90 bg-white/85 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">
                Register New Website
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <UseAnimations
                  animation={plusToX}
                  size={18}
                  strokeColor="#64748b"
                  active={true}
                />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1.5">
                  Website Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Website"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/90 focus:border-[#1455bb] focus:bg-white focus:outline-none text-slate-900 text-xs font-semibold shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1.5">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. mywebsite.com"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/90 focus:border-[#1455bb] focus:bg-white focus:outline-none text-slate-900 text-xs font-mono shadow-2xs transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enter domain without http:// or trailing slash.
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isPublicCheck"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded text-[#1455bb] focus:ring-[#1455bb] w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="isPublicCheck"
                  className="text-slate-700 font-bold cursor-pointer select-none"
                >
                  Make statistics publicly viewable (anyone can see counter
                  stats)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submitting ? "Registering..." : "Register Website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE CONFIRMATION (Full Glassmorphism + Animated)   */}
      {/* ============================================================ */}
      {deleteConfirmSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/90 bg-white/85 backdrop-blur-2xl shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <UseAnimations
                  animation={alertTriangle}
                  size={26}
                  strokeColor="#e11d48"
                  loop={true}
                />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Delete Website?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This action cannot be undone. All visitor telemetry will be
                  permanently deleted.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/90 text-xs shadow-2xs">
              <div className="font-extrabold text-slate-900">
                {deleteConfirmSite.name}
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                {deleteConfirmSite.domain}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSite(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
