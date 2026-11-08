"use client";

import React, { useState } from "react";
import { Website } from "@/types/analytics";
import { Copy, Check, X, Code } from "lucide-react";

interface TrackingSnippetModalProps {
  website: Website | null;
  onClose: () => void;
  initialTab?: string;
}

export const TrackingSnippetModal: React.FC<TrackingSnippetModalProps> = ({
  website,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Glow header accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1d5b9f] via-blue-500 to-indigo-500 shrink-0" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-[#fafbfc] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f] shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <span>{website.name}</span>
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
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Pure Tracking Code Snippet */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
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
          <div className="relative rounded-xl border border-slate-300 bg-[#0d1829] p-4 font-mono text-xs text-cyan-200 overflow-x-auto shadow-inner">
            <pre className="select-all leading-relaxed">{snippet}</pre>
            <button
              onClick={handleCopy}
              className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
            <div className="font-bold text-slate-900">How it works:</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
              <li>
                Tracking ID:{" "}
                <code className="text-[#1d5b9f] font-mono font-bold">
                  {website.trackingId}
                </code>
              </li>
              <li>
                Automatically tracks real-time active users, page views,
                referring sites, and visitor devices.
              </li>
              <li>
                No additional dependencies required — works directly on
                WordPress, HTML, Next.js, and static sites.
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#1d5b9f] hover:bg-[#16487e] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
