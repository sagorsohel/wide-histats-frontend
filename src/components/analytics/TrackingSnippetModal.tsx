"use client";

import React, { useState, useEffect } from "react";
import { Website } from "@/types/analytics";
import { useWebsite } from "@/context/WebsiteContext";
import { api } from "@/lib/api";
import { COUNTRIES, TIMEZONES } from "@/lib/timezones";
import {
  Copy,
  Check,
  X,
  Code,
  Settings,
  Globe,
  Clock,
  Shield,
  Save,
  ChevronDown,
} from "lucide-react";

interface TrackingSnippetModalProps {
  website: Website | null;
  onClose: () => void;
  initialTab?: "settings" | "code";
}

export const TrackingSnippetModal: React.FC<TrackingSnippetModalProps> = ({
  website,
  onClose,
  initialTab = "settings",
}) => {
  const { reloadWebsites } = useWebsite();
  const [activeTab, setActiveTab] = useState<"settings" | "code">(initialTab);

  // Form states
  const [name, setName] = useState(website?.name || "");
  const [country, setCountry] = useState(website?.country || "Bangladesh");
  const [timezone, setTimezone] = useState(website?.timezone || "Asia/Dhaka");
  const [isPublic, setIsPublic] = useState(website?.isPublic ?? false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (website) {
      setName(website.name || "");
      setCountry(website.country || "Bangladesh");
      setTimezone(website.timezone || "Asia/Dhaka");
      setIsPublic(website.isPublic ?? false);
    }
  }, [website]);

  if (!website) return null;

  const publicTunnelUrl =
    process.env.NEXT_PUBLIC_TRACKER_URL ||
    "https://apistats.fifaonscreen.online";

  const scriptUrl = `${publicTunnelUrl}/tracker.js`;

  const snippet = `<!-- Wide-Histat Analytics Tracking Code -->
<script
  async
  defer
  src="${scriptUrl}"
  data-website-id="${website.trackingId}"
></script>
<!-- End Wide-Histat Analytics -->`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCountryChange = (selectedCountryName: string) => {
    setCountry(selectedCountryName);
    const matched = COUNTRIES.find((c) => c.name === selectedCountryName);
    if (matched && matched.defaultTimezone) {
      setTimezone(matched.defaultTimezone);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await api.patch(`/api/v1/websites/${website.id}`, {
        name,
        country,
        timezone,
        isPublic,
      });

      if (res.success) {
        setSaveSuccess(true);
        // Clear cached analytics so that charts re-render in the new timezone
        api.clearCache();
        await reloadWebsites();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.message || "Failed to update website settings.");
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Glow header accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1d5b9f] via-blue-500 to-indigo-500 shrink-0" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-[#fafbfc] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
              {activeTab === "settings" ? (
                <Settings className="w-5 h-5" />
              ) : (
                <Code className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <span>{website.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1d5b9f] border border-blue-200">
                  Settings
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Domain:{" "}
                <span className="font-mono text-[#1d5b9f] font-semibold">
                  {website.domain}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "settings"
                ? "border-[#1d5b9f] text-[#1d5b9f] bg-white rounded-t-lg -mb-[1px]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time zone & Region</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "code"
                ? "border-[#1d5b9f] text-[#1d5b9f] bg-white rounded-t-lg -mb-[1px]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Counter & Tracking Code</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === "settings" ? (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {saveSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Settings updated! Analytics and Daily stats will now compute using {timezone}.
                  </span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {saveError}
                </div>
              )}

              {/* Exact matching design of Image 2: Country & Time zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Country Dropdown */}
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full bg-white border border-[#c4d1db] text-[#1b62b3] font-medium text-xs sm:text-sm px-3 py-2 rounded focus:outline-none focus:border-[#1d5b9f] appearance-none cursor-pointer pr-8 shadow-2xs"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name} className="text-slate-900">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#1b62b3] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Time zone Dropdown */}
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">
                    Time zone
                  </label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-white border border-[#c4d1db] text-[#1b62b3] font-medium text-xs sm:text-sm px-3 py-2 rounded focus:outline-none focus:border-[#1d5b9f] appearance-none cursor-pointer pr-8 shadow-2xs"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value} className="text-slate-900">
                          {tz.label} {tz.offset}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#1b62b3] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Website Name & Visibility */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1d5b9f]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      Public Analytics View
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow visitors to view basic stats without logging in
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded text-[#1d5b9f] focus:ring-0 h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Time zone & Settings"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste this snippet inside the{" "}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#1d5b9f] font-mono font-semibold">
                  &lt;head&gt;
                </code>{" "}
                or right before the closing{" "}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#1d5b9f] font-mono font-semibold">
                  &lt;/body&gt;
                </code>{" "}
                tag of your website HTML or in your Next.js/React layout.
              </p>

              {/* Code Snippet Box */}
              <div className="relative rounded-xl border border-slate-300 bg-[#0d1829] p-4 font-mono text-xs text-cyan-200 overflow-x-auto">
                <pre>{snippet}</pre>
                <button
                  onClick={handleCopy}
                  className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900">
                  How it works:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                  <li>
                    Tracking ID:{" "}
                    <code className="text-[#1d5b9f] font-mono font-bold">
                      {website.trackingId}
                    </code>
                  </li>
                  <li>
                    Active Time Zone:{" "}
                    <span className="font-semibold text-slate-800">
                      {website.timezone || timezone}
                    </span>
                  </li>
                  <li>
                    Automatically tracks real-time active users, page views, and visitor devices.
                  </li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
