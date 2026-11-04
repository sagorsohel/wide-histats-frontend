"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebsite } from "@/context/WebsiteContext";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { subscribeToWebsite } from "@/lib/socket";
import {
  ExternalLink,
  Lock,
  Unlock,
  BarChart2,
  Wrench,
  X,
  Plus,
  RefreshCw,
  Globe,
  Code,
  Check,
} from "lucide-react";

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
    })
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
        })
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
      })
    );
    setRefreshing(false);
  };

  // Select website and instantly open its realtime analytics
  const handleSelectSite = (site: Website, targetPath: string = "/realtime") => {
    setSelectedWebsite(site);
    subscribeToWebsite(site.id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("histat:website_changed", { detail: site })
      );
    }
    router.push(targetPath);
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

  const handleDelete = async (websiteId: string, websiteName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${websiteName}"? All analytics and visitor records for this website will be permanently removed.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/api/v1/websites/${websiteId}`);
      if (res.success) {
        await reloadWebsites();
      } else {
        alert(res.message || "Failed to delete website.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete website.");
    }
  };

  // Compute clean display ID for each website
  const getDisplayId = (site: Website): string => {
    if (site.displayId) return site.displayId;
    const digits = site.trackingId?.replace(/[^0-9]/g, "");
    if (digits && digits.length >= 5) return digits.slice(0, 7);
    let hash = 0;
    for (let i = 0; i < site.id.length; i++) {
      hash = (hash * 31 + site.id.charCodeAt(i)) & 0xffffffff;
    }
    return String(4800000 + (Math.abs(hash) % 300000));
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4 antialiased text-[12px] font-sans select-text pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[#1a5db4] font-bold text-sm tracking-tight hover:underline cursor-pointer">
            Active today ({websites.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh website telemetry snapshot"
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-blue-300 bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Website</span>
          </button>
        </div>
      </div>

      {/* Classic Histats Website List Rows */}
      <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-2xs divide-y divide-[#e2e8f0] overflow-hidden">
        {loading && websites.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <div className="inline-block animate-spin">
              <RefreshCw className="w-5 h-5 text-[#1d5b9f]" />
            </div>
            <div>Loading your websites telemetry...</div>
          </div>
        ) : websites.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-3">
            <Globe className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">No websites found.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded bg-[#1d5b9f] text-white font-bold text-xs"
            >
              Register your first website
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
                className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? "bg-[#eaf2fb] hover:bg-[#e1ecf8]"
                    : "hover:bg-[#f8fafc]"
                }`}
              >
                {/* Left & Middle: Numeric ID & Telemetry Metrics */}
                <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
                  {/* Blue Numeric Histats Site ID */}
                  <div
                    onClick={() => handleSelectSite(site)}
                    title={`Click to open ${site.name} analytics`}
                    className="shrink-0 cursor-pointer pt-0.5"
                  >
                    <span className="text-[#1a5db4] font-bold text-[15px] tabular-nums hover:underline">
                      {displayId}
                    </span>
                  </div>

                  {/* Domain and Telemetry Line */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Domain Name */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectSite(site)}
                        className="text-left font-bold text-slate-900 text-[13.5px] hover:text-[#1a5db4] hover:underline cursor-pointer truncate"
                      >
                        {domainDisplay}
                      </button>

                      {isSelected && (
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-[#1a5db4] border border-blue-300">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Exact Classic Histats Metrics Line */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-600 font-sans">
                      {/* Users Online */}
                      <span>
                        Users online :{" "}
                        <strong
                          className={`font-black ${
                            usersOnline > 0 ? "text-[#cc0000]" : "text-slate-500"
                          }`}
                        >
                          {usersOnline.toLocaleString()}
                        </strong>
                      </span>

                      {/* Visitors Today */}
                      <span>
                        visitors today :{" "}
                        <strong className="text-[#008800] font-bold">
                          {visitorsToday.toLocaleString()}
                        </strong>
                      </span>

                      {/* Page Views Today */}
                      <span>
                        Page views today :{" "}
                        <strong className="text-[#008800] font-bold">
                          {pageviewsToday.toLocaleString()}
                        </strong>
                      </span>

                      {/* Total Visitors */}
                      <span>
                        Total visitors :{" "}
                        <strong className="text-slate-700 font-bold">
                          {totalVisitors.toLocaleString()}
                        </strong>
                      </span>

                      {/* Total Page Views */}
                      <span>
                        Total page views :{" "}
                        <strong className="text-slate-700 font-bold">
                          {totalPageviews.toLocaleString()}
                        </strong>
                      </span>
                    </div>

                    {/* Snapshot Timestamp */}
                    <div className="text-[10.5px] text-slate-400">
                      Snapshot: {rowSnapshot}
                    </div>
                  </div>
                </div>

                {/* Right Side: Histats Classic 5 Action Icons */}
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                  {/* 1. Open Website in New Window */}
                  <a
                    href={domainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${site.domain} in new tab`}
                    className="p-1 rounded text-slate-400 hover:text-[#1a5db4] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* 2. Lock / Padlock (Public / Private toggle) */}
                  <button
                    onClick={() => {
                      alert(
                        `Website "${site.name}" statistics are currently ${
                          site.isPublic ? "PUBLIC" : "PRIVATE"
                        }.`
                      );
                    }}
                    title={site.isPublic ? "Public Statistics (Unlocked)" : "Private Statistics (Locked)"}
                    className="p-1 rounded text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    {site.isPublic ? (
                      <Unlock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-600" />
                    )}
                  </button>

                  {/* 3. Bar Chart Icon (Select website and view Realtime Analytics) */}
                  <button
                    onClick={() => handleSelectSite(site, "/realtime")}
                    title={`View Live Stats for ${site.name}`}
                    className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
                      <span className="w-1 h-2 bg-[#2563eb] rounded-xs group-hover:scale-y-110 transition-transform"></span>
                      <span className="w-1 h-3.5 bg-[#dc2626] rounded-xs group-hover:scale-y-110 transition-transform"></span>
                      <span className="w-1 h-2.5 bg-[#16a34a] rounded-xs group-hover:scale-y-110 transition-transform"></span>
                    </div>
                  </button>

                  {/* 4. Wrench / Settings & Counter Code */}
                  <button
                    onClick={() => openTrackingModal(site)}
                    title={`Configure & Get Counter CODE for ${site.name}`}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-slate-600" />
                  </button>

                  {/* 5. Delete Website (Red Cross) */}
                  <button
                    onClick={() => handleDelete(site.id, site.name)}
                    title={`Delete ${site.name}`}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-rose-600 font-bold" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for creating website */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Register New Website
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Website Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Website"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. mywebsite.com"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enter domain without http:// or trailing slash.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cp_isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-slate-300 text-[#1d5b9f] focus:ring-[#1d5b9f]"
                />
                <label htmlFor="cp_isPublic" className="text-slate-700 select-none cursor-pointer">
                  Public Statistics (enable public live stats)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white font-bold disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Registering..." : "Register Website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
