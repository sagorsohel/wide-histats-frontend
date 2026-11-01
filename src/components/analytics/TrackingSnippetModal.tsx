"use client";

import React, { useState } from "react";
import { Website } from "@/types/analytics";
import { Copy, Check, X, Code, Globe, Laptop } from "lucide-react";

interface TrackingSnippetModalProps {
  website: Website | null;
  onClose: () => void;
}

export const TrackingSnippetModal: React.FC<TrackingSnippetModalProps> = ({
  website,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"production" | "local">("production");

  if (!website) return null;

  const publicTunnelUrl =
    process.env.NEXT_PUBLIC_TRACKER_URL ||
    "https://ace-nearest-learning-backing.trycloudflare.com";

  const localUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:5050`
      : "http://localhost:5050";

  const activeHost = mode === "production" ? publicTunnelUrl : localUrl;
  const scriptUrl = `${activeHost}/tracker.js`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 overflow-hidden">
        {/* Glow header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1d5b9f] via-blue-500 to-indigo-500" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Tracking Code for {website.name}
              </h3>
              <p className="text-xs text-slate-500">
                Domain: <span className="font-mono text-[#1d5b9f] font-semibold">{website.domain}</span>
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

        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          Paste this snippet inside the <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#1d5b9f] font-mono font-semibold">&lt;head&gt;</code> or right before the closing <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#1d5b9f] font-mono font-semibold">&lt;/body&gt;</code> tag of your website HTML or in your Next.js/React layout.
        </p>

        {/* Environment Mode Switcher */}
        <div className="flex items-center justify-between mb-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <div className="flex gap-1.5">
            <button
              onClick={() => setMode("production")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "production"
                  ? "bg-[#1d5b9f] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Live / Real Website (HTTPS)
            </button>
            <button
              onClick={() => setMode("local")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "local"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Localhost
            </button>
          </div>
          {mode === "production" && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-medium pr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tunnel Active
            </span>
          )}
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-xl border border-slate-300 bg-[#0d1829] p-4 font-mono text-xs text-cyan-200 overflow-x-auto mb-4">
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

        {/* Tracking ID badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium">Unique Tracking ID:</span>
          <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
            {website.trackingId}
          </span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1d5b9f] hover:bg-[#174880] text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
