"use client";

import React, { useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import {
  Globe,
  Plus,
  Code,
  Trash2,
  ExternalLink,
  Shield,
  Check,
  X,
} from "lucide-react";

export default function WebsitesPage() {
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Websites Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register websites, configure domains, and obtain JavaScript tracking snippets
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d5b9f] hover:bg-[#174880] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Website
        </button>
      </div>

      {/* Websites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && websites.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-8 w-full bg-slate-100 rounded-lg" />
            </div>
          ))
        ) : (
          websites.map((site) => {
          const isSelected = selectedWebsite?.id === site.id;

          return (
            <div
              key={site.id}
              className={`bg-white p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 shadow-2xs ${
                isSelected
                  ? "ring-2 ring-[#1d5b9f] border-[#1d5b9f] shadow-md shadow-blue-500/10"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-extrabold text-slate-900 text-base truncate">
                        {site.name}
                      </h3>
                      <a
                        href={`https://${site.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 hover:text-[#1d5b9f] flex items-center gap-1 font-mono"
                      >
                        {site.domain}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1d5b9f] border border-blue-200 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Tracking ID Badge */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-sans">
                    Tracking ID
                  </span>
                  <span className="font-bold text-[#1d5b9f] text-[11px]">
                    {site.trackingId}
                  </span>
                </div>

                {/* Quick counts */}
                <div className="grid grid-cols-2 gap-2 mb-5 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">
                      Total Visitors
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                      {site.totalVisitors || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">
                      Total Views
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                      {site.totalPageviews || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openTrackingModal(site)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[#1d5b9f] hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                  Code
                </button>

                <div className="flex items-center gap-2">
                  {!isSelected && (
                    <button
                      onClick={() => setSelectedWebsite(site)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Select
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(site.id, site.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>

      {/* Modal for creating website */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-slate-900">
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
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
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
                  placeholder="e.g. My Tech Blog"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs"
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
                  placeholder="e.g. myblog.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enter domain without http:// or trailing slashes.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-slate-300 text-[#1d5b9f] focus:ring-[#1d5b9f]"
                />
                <label htmlFor="isPublic" className="text-slate-700 select-none cursor-pointer">
                  Public Statistics (allow visitors to view analytics dashboard without login)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#1d5b9f] hover:bg-[#174880] text-white font-bold disabled:opacity-50 shadow-sm"
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
