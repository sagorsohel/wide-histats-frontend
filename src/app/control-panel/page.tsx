"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebsite } from "@/context/WebsiteContext";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { subscribeToWebsite } from "@/lib/socket";
import { WebsiteFavicon } from "@/components/layout/Sidebar";
import { getSite7DigitId } from "@/lib/utils";
import {
  ExternalLink,
  Lock,
  Unlock,
  BarChart3,
  Code,
  X,
  RefreshCw,
  Plus,
} from "lucide-react";

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
  const [isPublic, setIsPublic] = useState(false);
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
      <div className="relative w-full max-w-[1260px] mx-auto rounded-[32px] bg-white/65 backdrop-blur-2xl border border-white/85 shadow-[0_20px_60px_-15px_rgba(20,85,187,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 sm:p-7 lg:p-9 space-y-6 z-10 flex-1 flex flex-col">
        {/* Specular Shimmer Highlight on Top Edge */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

        {/* Top Header Row: Active Count + Action Buttons (Matching Screenshot) */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <h1 className="text-base sm:text-lg font-bold text-[#1455bb] tracking-tight">
            Active today ({websites.length})
          </h1>

          {/* Action Buttons: Refresh & Register Website */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh website telemetry snapshot"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#1455bb] ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Website</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* WEBSITE LIST: Histats Exact Strip Layout Matching Screenshot */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden flex-1">
          {loading && websites.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-[#1455bb] animate-spin" />
              <div className="font-bold text-sm text-slate-700">
                Loading your websites telemetry...
              </div>
            </div>
          ) : websites.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-4">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-[#1455bb]">
                <BarChart3 className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-base text-slate-800">
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
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
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
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                    isSelected
                      ? "bg-[#edf2f7] hover:bg-[#e6ecf3]"
                      : "bg-white hover:bg-slate-50/80"
                  }`}
                >
                  {/* Left (Site ID) + Middle (Domain, Telemetry, Snapshot) */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0 flex-1">
                    {/* Site ID - Pure bold blue text matching screenshot */}
                    <div
                      onClick={() => handleSelectSite(site)}
                      title={`Click to view ${site.name} analytics`}
                      className="w-20 sm:w-24 shrink-0 cursor-pointer font-bold text-base sm:text-lg text-[#0f5b9e] hover:text-[#1455bb] tracking-tight tabular-nums select-all pt-0.5 sm:pt-0"
                    >
                      {displayId}
                    </div>

                    {/* Middle Info Column (3 Lines) */}
                    <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                      {/* Line 1: Domain Name (Bold text) */}
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleSelectSite(site)}
                          className="font-bold text-slate-900 hover:text-[#1455bb] hover:underline text-sm sm:text-base text-left truncate cursor-pointer tracking-tight"
                        >
                          {domainDisplay}
                        </button>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#1455bb] shrink-0">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Line 2: Inline Telemetry Metrics (Matching Screenshot) */}
                      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-0.5 text-xs text-slate-500 font-normal">
                        <span>
                          Users online :{" "}
                          <span
                            className={`font-bold ${
                              usersOnline > 0
                                ? "text-rose-600"
                                : "text-rose-600/90"
                            }`}
                          >
                            {usersOnline}
                          </span>
                        </span>
                        <span>
                          visitors today :{" "}
                          <span className="font-bold text-emerald-700">
                            {visitorsToday.toLocaleString()}
                          </span>
                        </span>
                        <span>
                          Page views today :{" "}
                          <span className="font-bold text-teal-700">
                            {pageviewsToday.toLocaleString()}
                          </span>
                        </span>
                        <span>
                          Total visitors :{" "}
                          <span className="font-bold text-slate-700">
                            {totalVisitors.toLocaleString()}
                          </span>
                        </span>
                        <span>
                          Total page views :{" "}
                          <span className="font-bold text-slate-700">
                            {totalPageviews.toLocaleString()}
                          </span>
                        </span>
                      </div>

                      {/* Line 3: Snapshot Time & Status */}
                      <div className="text-[11px] text-slate-400 font-normal">
                        Snapshot: {rowSnapshot} · Cached
                      </div>
                    </div>
                  </div>

                  {/* Right Side: 5 Action Icons (Matching Screenshot) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end md:self-center pt-1 md:pt-0">
                    {/* 1. Open Website in New Window */}
                    <a
                      href={domainUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open ${site.domain} in new tab`}
                      className="w-7 h-7 rounded-md hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* 2. Public / Private Lock (Amber Padlock) */}
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
                      className="w-7 h-7 rounded-md hover:bg-amber-50 flex items-center justify-center text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      {site.isPublic ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </button>

                    {/* 3. Analytics Activity / Reports (Bar Chart) */}
                    <button
                      type="button"
                      onClick={() => handleSelectSite(site, "/summary")}
                      title={`Open Analytics for ${site.name}`}
                      className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center text-[#1455bb] hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                    {/* 4. Counter Code System */}
                    <button
                      type="button"
                      onClick={() => openTrackingModal(site, "code")}
                      title={`Counter Code System for ${site.name}`}
                      className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-[#1455bb] transition-colors cursor-pointer"
                    >
                      <Code className="w-4 h-4" />
                    </button>

                    {/* 5. Delete Website (Red X) */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmSite(site)}
                      title={`Delete ${site.name}`}
                      className="w-7 h-7 rounded-md hover:bg-rose-50 flex items-center justify-center text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
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
