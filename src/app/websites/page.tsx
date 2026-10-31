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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Websites Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Register websites, configure domains, and obtain JavaScript tracking snippets
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register Website
        </button>
      </div>

      {/* Websites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {websites.map((site) => {
          const isSelected = selectedWebsite?.id === site.id;

          return (
            <div
              key={site.id}
              className={`glass-panel p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                isSelected
                  ? "ring-2 ring-cyan-500/50 border-cyan-500/40 bg-slate-900/90 shadow-xl shadow-cyan-500/10"
                  : "hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-extrabold text-white text-base truncate">
                        {site.name}
                      </h3>
                      <a
                        href={`https://${site.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-cyan-400 flex items-center gap-1 font-mono"
                      >
                        {site.domain}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Tracking ID Badge */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-border/80 text-xs font-mono text-slate-300 flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-sans">
                    Tracking ID
                  </span>
                  <span className="font-bold text-cyan-400 text-[11px]">
                    {site.trackingId}
                  </span>
                </div>

                {/* Quick counts */}
                <div className="grid grid-cols-2 gap-2 mb-5 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">
                      Total Visitors
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {site.totalVisitors || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">
                      Total Views
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {site.totalPageviews || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <button
                  onClick={() => openTrackingModal(site)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all"
                >
                  <Code className="w-3.5 h-3.5" />
                  Code
                </button>

                <div className="flex items-center gap-2">
                  {!isSelected && (
                    <button
                      onClick={() => setSelectedWebsite(site)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                    >
                      Select
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(site.id, site.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for creating website */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0f172a] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-white">
                Register New Website
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Website Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Tech Blog"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-border focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. myblog.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-border focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Enter domain without http:// or trailing slashes.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-border bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="isPublic" className="text-slate-300 select-none cursor-pointer">
                  Public Statistics (allow visitors to view analytics dashboard without login)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold disabled:opacity-50"
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
