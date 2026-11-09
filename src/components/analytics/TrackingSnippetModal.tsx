"use client";

import React, { useState, useEffect } from "react";
import { Website, WebsiteCounter, CounterStyle, CounterDisplayOptions } from "@/types/analytics";
import { counterService } from "@/lib/counterService";
import { CounterBadgePreview } from "./CounterBadgePreview";
import {
  X,
  Code,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface TrackingSnippetModalProps {
  website: Website | null;
  onClose: () => void;
  initialTab?: string;
}

type ModalView = "list" | "step1_style" | "step2_info" | "code";

const COUNTER_STYLES: {
  id: CounterStyle;
  name: string;
  category: string;
  description: string;
}[] = [
  {
    id: "hidden",
    name: "Hidden (Standard)",
    category: "Invisible",
    description: "Invisible tracking without any badge or graphic on your page.",
  },
  {
    id: "cloud",
    name: "Classic Cloud",
    category: "Classic",
    description: "Authentic puffy blue cloud badge with live visitor statistics.",
  },
  {
    id: "capsule",
    name: "Red Capsule",
    category: "Modern Pill",
    description: "Deep ruby red rounded pill with warm amber numbers.",
  },
  {
    id: "tube",
    name: "Neon Glass Tube",
    category: "High-Tech",
    description: "Electric cyan tube cylinder with metallic silver caps.",
  },
  {
    id: "neon",
    name: "Cyber Cyan Bar",
    category: "Futuristic",
    description: "Sleek dark titanium bar with neon cyan corner highlight.",
  },
  {
    id: "scroll",
    name: "Golden Scroll",
    category: "Antique",
    description: "Traditional golden rolled scroll ends with black center banner.",
  },
  {
    id: "metallic",
    name: "Brushed Steel & LED",
    category: "Industrial",
    description: "Brushed metal panel with glowing green LED activity light.",
  },
  {
    id: "minimal",
    name: "Minimal Dark Pill",
    category: "Clean",
    description: "Sleek slate black pill suitable for clean minimalist websites.",
  },
  {
    id: "glossy",
    name: "Glossy Electric Blue",
    category: "Modern",
    description: "Liquid glass reflection gradient with vibrant blue base.",
  },
  {
    id: "splash",
    name: "Paint Splash",
    category: "Creative",
    description: "Dynamic artistic paint splatter with white stats typography.",
  },
  {
    id: "scanner",
    name: "Scanner Eye",
    category: "High-Tech",
    description: "Glossy crimson bar with high-tech scanner optic lens.",
  },
  {
    id: "graph",
    name: "3D Chart Box",
    category: "Analytics",
    description: "Blue stats badge featuring 3D colorful column graph.",
  },
];

export const TrackingSnippetModal: React.FC<TrackingSnippetModalProps> = ({
  website,
  onClose,
}) => {
  const [view, setView] = useState<ModalView>("list");
  const [counters, setCounters] = useState<WebsiteCounter[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<WebsiteCounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeType, setCodeType] = useState<"async" | "modern">("async");

  // Counter creation state
  const [newStyle, setNewStyle] = useState<CounterStyle>("cloud");
  const [newDisplayOptions, setNewDisplayOptions] = useState<CounterDisplayOptions>({
    visitorsToday: true,
    totalVisitors: false,
    pageviewsToday: false,
    totalPageviews: false,
    usersOnline: false,
  });

  // Load website counters on mount or when website changes
  useEffect(() => {
    if (!website) return;
    let isMounted = true;
    setLoading(true);

    counterService.getCounters(website).then((list) => {
      if (isMounted) {
        setCounters(list);
        if (list.length > 0) {
          setSelectedCounter(list[0]);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [website]);

  if (!website) return null;

  const publicTunnelUrl =
    process.env.NEXT_PUBLIC_TRACKER_URL || "https://api.analycos.com";
  const scriptUrl = `${publicTunnelUrl}/tracker.js`;

  const activeCounter = selectedCounter || counters[0] || {
    id: "default",
    websiteId: website.id,
    counterId: website.trackingId || "1234567",
    name: "Standard counter",
    style: "hidden",
    isHidden: true,
    displayOptions: {
      visitorsToday: true,
      totalVisitors: false,
      pageviewsToday: false,
      totalPageviews: false,
      usersOnline: false,
    },
    createdAt: new Date().toISOString(),
  };

  // Generate Snippets
  const hiddenSnippet = `<!-- Analycos Analytics Tracking Code -->
<script
  async
  defer
  src="${scriptUrl}"
  data-website-id="${website.trackingId}"
></script>
<!-- End Analycos Analytics -->`;

  const asyncSnippet = `<!-- Analycos Analytics (div with counter) --><div id="analycos_counter"></div>
<!-- Analycos Analytics START (async) -->
<script type="text/javascript">var _Hasync= _Hasync|| [];
_Hasync.push(['Histats.start', '1,${activeCounter.counterId},4,4,130,70,00010000']);
_Hasync.push(['Histats.fasi', '1']);
_Hasync.push(['Histats.track_hits', '']);
(function() {
var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
hs.src = ('${scriptUrl}');
(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
})();</script>
<noscript><a href="/" target="_blank"><img src="${publicTunnelUrl}/counter/${activeCounter.counterId}.gif" alt="html hit counter" border="0"></a>
</noscript>
<!-- Analycos Analytics END -->`;

  const modernSnippet = `<!-- Analycos Analytics (div with counter) -->
<div id="analycos_counter"></div>
<script
  async
  defer
  src="${scriptUrl}"
  data-website-id="${website.trackingId}"
  data-counter-id="${activeCounter.counterId}"
></script>
<!-- End Analycos Analytics -->`;

  const activeSnippet = activeCounter.isHidden
    ? hiddenSnippet
    : codeType === "async"
      ? asyncSnippet
      : modernSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start creating new counter
  const handleStartCreate = () => {
    setNewStyle("cloud");
    setNewDisplayOptions({
      visitorsToday: true,
      totalVisitors: false,
      pageviewsToday: false,
      totalPageviews: false,
      usersOnline: false,
    });
    setView("step1_style");
  };

  // Save new counter
  const handleSaveCounter = async () => {
    const created = await counterService.createCounter(website, {
      name:
        newStyle === "hidden"
          ? "Standard counter (Hidden)"
          : `${newStyle.charAt(0).toUpperCase() + newStyle.slice(1)} Counter`,
      style: newStyle,
      displayOptions: newDisplayOptions,
    });

    const updatedList = await counterService.getCounters(website);
    setCounters(updatedList);
    setSelectedCounter(created);
    setView("code");
  };

  // Delete counter
  const handleDeleteCounter = async (e: React.MouseEvent, counterId: string) => {
    e.stopPropagation();
    if (counters.length <= 1) {
      alert("At least one tracking counter must remain for the website.");
      return;
    }
    if (confirm("Are you sure you want to delete this counter?")) {
      await counterService.deleteCounter(website, counterId);
      const updatedList = await counterService.getCounters(website);
      setCounters(updatedList);
      if (selectedCounter?.counterId === counterId) {
        setSelectedCounter(updatedList[0] || null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl flex flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Glow header accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1455bb] via-blue-500 to-indigo-500 shrink-0" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-[#1455bb] shrink-0 shadow-2xs">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <span>{website.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1455bb] border border-blue-200">
                  Site ID: {website.trackingId}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Domain:{" "}
                <span className="font-mono text-[#1455bb] font-bold">
                  {website.domain}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          {/* ============================================================ */}
          {/* VIEW 1: COUNTERS LIST (Matching Image 4)                    */}
          {/* ============================================================ */}
          {view === "list" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    Standard counter
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any counter to view its tracking code and live preview.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#1455bb] to-[#1e6ae8] text-white text-xs font-black shadow-md shadow-blue-600/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add new counter</span>
                </button>
              </div>

              {/* Counters List (Image 4 exact layout) */}
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white shadow-2xs">
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Loading counters...
                  </div>
                ) : counters.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                    <p>No counters found for this website.</p>
                  </div>
                ) : (
                  counters.map((c, index) => {
                    const isSelected = selectedCounter?.counterId === c.counterId;
                    return (
                      <div
                        key={c.counterId || index}
                        onClick={() => {
                          setSelectedCounter(c);
                          setView("code");
                        }}
                        className={`flex items-center justify-between p-3 sm:p-4 hover:bg-blue-50/50 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/70" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs sm:text-sm font-black text-slate-800">
                            counter id :{" "}
                            <span className="text-[#1455bb] text-sm sm:text-base">
                              {c.counterId}
                            </span>
                          </span>
                          {c.isHidden && (
                            <span className="text-emerald-700 font-extrabold text-xs">
                              (Hidden)
                            </span>
                          )}
                          {!c.isHidden && (
                            <div className="hidden sm:block scale-90 origin-left">
                              <CounterBadgePreview
                                style={c.style}
                                options={c.displayOptions}
                              />
                            </div>
                          )}
                        </div>

                        {/* Red [X] Delete Button (Matching Image 4) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCounter(e, c.counterId)}
                            title="Delete counter"
                            className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center font-black text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: STEP 1 - CHOOSE COUNTER STYLE (Matching Image 1)    */}
          {/* ============================================================ */}
          {view === "step1_style" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h4 className="text-sm font-black text-slate-900">
                    1. Choose counter style / design
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newStyle === "hidden") {
                      handleSaveCounter();
                    } else {
                      setView("step2_info");
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Next: Display Options</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid of Styles (Matching Image 1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {COUNTER_STYLES.map((st) => {
                  const isSelected = newStyle === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setNewStyle(st.id)}
                      className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#1455bb] bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs"
                      }`}
                    >
                      {/* Badge Preview */}
                      <div className="h-16 flex items-center justify-center w-full">
                        <CounterBadgePreview
                          style={st.id}
                          options={{
                            visitorsToday: true,
                            totalVisitors: false,
                            pageviewsToday: false,
                            totalPageviews: false,
                            usersOnline: false,
                          }}
                        />
                      </div>

                      {/* Name & Type */}
                      <div className="w-full text-center mt-2 pt-2 border-t border-slate-100">
                        <div className="text-xs font-black text-slate-800">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {st.description}
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1455bb] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: STEP 2 - CHOOSE INFORMATION (Matching Image 2)      */}
          {/* ============================================================ */}
          {view === "step2_info" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setView("step1_style")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to styles</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCounter}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#1455bb] to-[#1e6ae8] hover:from-[#1047a0] hover:to-[#1755be] text-white text-xs font-black shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Save & Generate Code</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title exact copy of Image 2 */}
              <h3 className="text-sm font-bold text-[#1455bb]">
                2. Choose which informations will be displayed on your counter.
              </h3>

              {/* Checkboxes row (Styled identical to Image 2 with orange checkmark) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { key: "visitorsToday", label: "visitors today" },
                  { key: "totalVisitors", label: "Total visitors" },
                  { key: "pageviewsToday", label: "Page views today" },
                  { key: "totalPageviews", label: "Total page views" },
                  { key: "usersOnline", label: "Users online" },
                ].map(({ key, label }) => {
                  const checked = !!newDisplayOptions[key as keyof CounterDisplayOptions];
                  return (
                    <label
                      key={key}
                      onClick={() =>
                        setNewDisplayOptions((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof CounterDisplayOptions],
                        }))
                      }
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                        checked
                          ? "bg-slate-100/90 border-slate-300 text-slate-900 shadow-2xs"
                          : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          checked
                            ? "bg-white border-orange-500 text-orange-500 shadow-2xs"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 16 16"
                            className="w-3.5 h-3.5 fill-current text-orange-500"
                          >
                            <path d="M13.485 3.515a1 1 0 0 1 0 1.414l-6.364 6.364a1 1 0 0 1-1.414 0L2.515 8.1a1 1 0 1 1 1.414-1.414l2.478 2.478 5.657-5.657a1 1 0 0 1 1.421.008z" />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Preview Box exact copy of Image 2 */}
              <div className="rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden">
                {/* Gray Preview Header */}
                <div className="px-3 py-1.5 bg-slate-200/80 border-b border-slate-300 text-[11px] font-bold text-slate-600">
                  preview
                </div>

                {/* Canvas Area with Centered Counter */}
                <div className="p-8 sm:p-12 flex items-center justify-center min-h-[140px] bg-slate-50/40">
                  <CounterBadgePreview
                    style={newStyle}
                    options={newDisplayOptions}
                    brandName="Analycos"
                  />
                </div>

                {/* Footnote matching Image 2 */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 italic">
                  * The numbers shown are default sample values.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: CODE VIEW (Matching Image 3)                         */}
          {/* ============================================================ */}
          {view === "code" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to counters list</span>
                </button>
                {!activeCounter.isHidden && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCodeType("async")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        codeType === "async"
                          ? "bg-[#1455bb] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Histats Async (Compatible)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeType("modern")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        codeType === "modern"
                          ? "bg-[#1455bb] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Modern Single Tag
                    </button>
                  </div>
                )}
              </div>

              {/* Counter details chip */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-slate-800 font-mono">
                    counter id :{" "}
                    <span className="text-[#1455bb] text-sm font-bold">
                      {activeCounter.counterId}
                    </span>
                  </span>
                  {activeCounter.isHidden && (
                    <span className="text-xs font-bold text-emerald-700">
                      (Hidden)
                    </span>
                  )}
                </div>

                {!activeCounter.isHidden && (
                  <div className="scale-90 origin-right">
                    <CounterBadgePreview
                      style={activeCounter.style}
                      options={activeCounter.displayOptions}
                    />
                  </div>
                )}
              </div>

              {/* Instructions */}
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste this snippet into your website HTML inside the{" "}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#1455bb] font-mono font-semibold">
                  &lt;body&gt;
                </code>{" "}
                section where you want the hit counter or tracking script to execute.
              </p>

              {/* Code Snippet Box (Matching Image 3) */}
              <div className="relative rounded-2xl border border-slate-300 bg-[#0d1829] p-4 font-mono text-xs text-cyan-200 overflow-x-auto shadow-inner">
                <pre className="select-all leading-relaxed whitespace-pre-wrap">
                  {activeSnippet}
                </pre>
                <button
                  onClick={handleCopy}
                  className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    copied
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 shadow-sm"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another counter</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-[#1455bb] hover:bg-[#1047a0] text-white text-xs font-black transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
