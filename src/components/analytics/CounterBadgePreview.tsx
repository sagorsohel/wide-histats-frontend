"use client";

import React from "react";
import { CounterStyle, CounterDisplayOptions } from "@/types/analytics";
import { EyeOff, Shield } from "lucide-react";

interface CounterBadgePreviewProps {
  style: CounterStyle;
  options: CounterDisplayOptions;
  sampleValues?: {
    visitorsToday?: number | string;
    totalVisitors?: number | string;
    pageviewsToday?: number | string;
    totalPageviews?: number | string;
    usersOnline?: number | string;
  };
  brandName?: string;
  className?: string;
}

export const CounterBadgePreview: React.FC<CounterBadgePreviewProps> = ({
  style,
  options,
  sampleValues = {
    visitorsToday: "456",
    totalVisitors: "12,430",
    pageviewsToday: "2,573",
    totalPageviews: "31,149",
    usersOnline: "35",
  },
  brandName = "Analycos",
  className = "",
}) => {
  // Collect active metrics to display
  const items: { label: string; shortLabel: string; value: string | number }[] = [];

  if (options.visitorsToday) {
    items.push({
      label: "visitors today",
      shortLabel: "Vis.today",
      value: sampleValues.visitorsToday ?? "456",
    });
  }
  if (options.totalVisitors) {
    items.push({
      label: "Total visitors",
      shortLabel: "Tot.vis",
      value: sampleValues.totalVisitors ?? "12,430",
    });
  }
  if (options.pageviewsToday) {
    items.push({
      label: "Page views today",
      shortLabel: "Pages",
      value: sampleValues.pageviewsToday ?? "2,573",
    });
  }
  if (options.totalPageviews) {
    items.push({
      label: "Total page views",
      shortLabel: "Tot.pages",
      value: sampleValues.totalPageviews ?? "31,149",
    });
  }
  if (options.usersOnline) {
    items.push({
      label: "Users online",
      shortLabel: "Online",
      value: sampleValues.usersOnline ?? "35",
    });
  }

  // Fallback if none checked
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            label: "visitors today",
            shortLabel: "Vis.today",
            value: sampleValues.visitorsToday ?? "456",
          },
        ];

  if (style === "hidden") {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-dashed border-slate-300 text-slate-500 text-xs font-semibold select-none ${className}`}
      >
        <EyeOff className="w-4 h-4 text-slate-400" />
        <span>Hidden (Invisible on page)</span>
      </div>
    );
  }

  // 1. Classic Cloud (Authentic to Histats / Analycos cloud in Image 1 & 2)
  if (style === "cloud") {
    return (
      <div
        className={`relative inline-flex items-center justify-center p-3 select-none ${className}`}
        style={{ minWidth: "155px", minHeight: "85px" }}
      >
        {/* Cloud SVG Silhouette */}
        <svg
          viewBox="0 0 160 90"
          className="absolute inset-0 w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e6ae8" />
              <stop offset="50%" stopColor="#0f4bb5" />
              <stop offset="100%" stopColor="#0b3785" />
            </linearGradient>
            <filter id="cloudShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Authentic puffy cloud contour */}
          <path
            d="M 30,55 
               C 15,55 10,40 25,30 
               C 22,18 38,10 50,20 
               C 60,5 95,5 105,20 
               C 120,10 140,20 135,35 
               C 150,45 145,65 130,68 
               C 135,80 115,88 95,80 
               C 85,88 50,88 40,78 
               C 25,82 15,68 30,55 Z"
            fill="url(#cloudGrad)"
            stroke="#ffffff"
            strokeWidth="1.2"
            filter="url(#cloudShadow)"
          />
        </svg>

        {/* Content inside cloud */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white text-[11px] font-sans px-3 py-1 space-y-0.5">
          <span className="font-extrabold tracking-wide text-white drop-shadow-sm text-[11px]">
            {brandName}
          </span>
          {displayItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 text-[10px] text-white/95 leading-tight font-medium"
            >
              <span>{item.shortLabel}</span>
              <span className="font-bold text-amber-200 tabular-nums">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Red Capsule / Oval Pill (Image 1 top left)
  if (style === "capsule") {
    return (
      <div
        className={`inline-flex items-center justify-between gap-4 px-4 py-2 rounded-full select-none shadow-md ${className}`}
        style={{
          background: "linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)",
          border: "1.5px solid #ef4444",
          boxShadow: "0 2px 8px rgba(185,28,28,0.4), inset 0 1px 1px rgba(255,255,255,0.3)",
        }}
      >
        <span className="text-[11px] font-bold text-amber-200 tracking-wide">
          {displayItems[0].shortLabel.toLowerCase()}
        </span>
        <span className="text-xs font-black text-white font-mono tracking-wider tabular-nums drop-shadow-xs">
          {displayItems[0].value}
        </span>
      </div>
    );
  }

  // 3. Blue Neon Tube with Chrome Ends (Image 1 top right)
  if (style === "tube") {
    return (
      <div
        className={`inline-flex items-center rounded-lg overflow-hidden select-none shadow-md ${className}`}
        style={{
          background: "#0f172a",
          border: "1px solid #38bdf8",
        }}
      >
        {/* Left Chrome Cap */}
        <div
          className="w-3.5 h-7 flex flex-col justify-between p-0.5"
          style={{
            background: "linear-gradient(90deg, #94a3b8 0%, #f1f5f9 50%, #64748b 100%)",
            borderRight: "1px solid #334155",
          }}
        >
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Glowing Center */}
        <div
          className="px-3.5 py-1.5 flex items-center gap-3 font-mono text-xs"
          style={{
            background: "linear-gradient(180deg, #0284c7 0%, #0369a1 40%, #0c4a6e 100%)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          <span className="text-[10px] font-extrabold text-cyan-200 uppercase tracking-wider">
            {displayItems[0].shortLabel}
          </span>
          <span className="font-black text-white tracking-widest tabular-nums text-xs drop-shadow-[0_0_6px_#38bdf8]">
            {displayItems[0].value}
          </span>
        </div>

        {/* Right Chrome Cap */}
        <div
          className="w-3.5 h-7 flex flex-col justify-between p-0.5"
          style={{
            background: "linear-gradient(90deg, #64748b 0%, #f1f5f9 50%, #94a3b8 100%)",
            borderLeft: "1px solid #334155",
          }}
        >
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-600" />
        </div>
      </div>
    );
  }

  // 4. Cyber Cyan Neon Bar (Image 1 row 3 center)
  if (style === "neon") {
    return (
      <div
        className={`relative inline-flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-sm select-none shadow-md ${className}`}
        style={{
          background: "linear-gradient(180deg, #334155 0%, #0f172a 100%)",
          border: "1px solid #06b6d4",
          boxShadow: "0 0 10px rgba(6,182,212,0.35)",
        }}
      >
        {/* Cyan accent bracket */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <span className="text-[10px] font-bold text-slate-300 font-mono tracking-wider">
          {displayItems[0].shortLabel}
        </span>
        <span className="text-xs font-black text-cyan-300 font-mono tracking-wider tabular-nums">
          {displayItems[0].value}
        </span>
      </div>
    );
  }

  // 5. Golden Antique Scroll (Image 1 row 2 left)
  if (style === "scroll") {
    return (
      <div className={`inline-flex items-center select-none shadow-sm ${className}`}>
        {/* Left Scroll Handle */}
        <div
          className="w-2.5 h-6 rounded-l-md"
          style={{
            background: "linear-gradient(180deg, #fef08a 0%, #ca8a04 50%, #854d0e 100%)",
            border: "1px solid #713f12",
          }}
        />
        {/* Center Banner */}
        <div
          className="px-3 py-1 flex items-center gap-3 font-serif text-xs"
          style={{
            background: "#0f172a",
            borderTop: "1.5px solid #eab308",
            borderBottom: "1.5px solid #eab308",
          }}
        >
          <span className="text-[10px] font-bold text-amber-300 tracking-wide">
            {displayItems[0].shortLabel}
          </span>
          <span className="font-bold text-white font-mono tabular-nums text-xs">
            {displayItems[0].value}
          </span>
        </div>
        {/* Right Scroll Handle */}
        <div
          className="w-2.5 h-6 rounded-r-md"
          style={{
            background: "linear-gradient(180deg, #fef08a 0%, #ca8a04 50%, #854d0e 100%)",
            border: "1px solid #713f12",
          }}
        />
      </div>
    );
  }

  // 6. Brushed Metal & Green LED (Image 1 row 5 center)
  if (style === "metallic") {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded select-none shadow-sm ${className}`}
        style={{
          background: "linear-gradient(180deg, #94a3b8 0%, #64748b 50%, #475569 100%)",
          border: "1px solid #cbd5e1",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {/* Glowing Green LED */}
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] border border-emerald-200 animate-pulse" />
        </div>
        <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 flex items-center gap-2 font-mono">
          <span className="text-[10px] text-slate-300 font-semibold">
            {displayItems[0].shortLabel}
          </span>
          <span className="text-xs font-bold text-emerald-400 tabular-nums">
            {displayItems[0].value}
          </span>
        </div>
      </div>
    );
  }

  // 7. Minimal Modern Dark Pill (Clean & sleek)
  if (style === "minimal") {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full select-none shadow-sm ${className}`}
        style={{
          background: "#0f172a",
          border: "1px solid #334155",
        }}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {displayItems[0].shortLabel}
        </span>
        <span className="text-xs font-extrabold text-white font-mono tabular-nums">
          {displayItems[0].value}
        </span>
      </div>
    );
  }

  // 8. Glossy Electric Blue (Image 1 row 4 center)
  if (style === "glossy") {
    return (
      <div
        className={`relative inline-flex items-center justify-between gap-3 px-4 py-1.5 rounded-md overflow-hidden select-none shadow-md ${className}`}
        style={{
          background: "linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)",
          border: "1px solid #60a5fa",
          boxShadow: "0 2px 8px rgba(29,78,216,0.4)",
        }}
      >
        {/* Gloss highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)",
          }}
        />
        <span className="relative z-10 text-[10px] font-bold text-blue-100">
          {displayItems[0].shortLabel}
        </span>
        <span className="relative z-10 text-xs font-black text-white font-mono tracking-wider tabular-nums">
          {displayItems[0].value}
        </span>
      </div>
    );
  }

  // 9. Paint Splash / Ink Blot (Image 1 bottom right)
  if (style === "splash") {
    return (
      <div
        className={`relative inline-flex items-center justify-center p-3 select-none ${className}`}
        style={{ minWidth: "130px", minHeight: "70px" }}
      >
        {/* Splash SVG */}
        <svg
          viewBox="0 0 140 80"
          className="absolute inset-0 w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 40,40 
               C 20,35 10,20 25,12 
               C 35,5 45,22 55,18 
               C 65,12 75,5 88,14 
               C 100,5 118,18 112,28 
               C 125,24 135,38 122,46 
               C 132,58 115,72 102,64 
               C 92,75 75,70 65,60 
               C 52,72 32,65 38,50 
               C 22,55 18,44 40,40 Z"
            fill="#0284c7"
          />
          <circle cx="15" cy="18" r="3" fill="#0284c7" />
          <circle cx="128" cy="18" r="2.5" fill="#0284c7" />
          <circle cx="125" cy="62" r="3.5" fill="#0284c7" />
          <circle cx="20" cy="65" r="2" fill="#0284c7" />
        </svg>
        <div className="relative z-10 text-center text-white text-[10px] space-y-0.5 font-sans font-extrabold">
          <div className="text-[9px] uppercase tracking-wider text-cyan-200">
            {displayItems[0].shortLabel}
          </div>
          <div className="text-xs font-black font-mono text-white tracking-widest tabular-nums">
            {displayItems[0].value}
          </div>
        </div>
      </div>
    );
  }

  // 10. Scanner Eye Pill (Image 1 row 2 center)
  if (style === "scanner") {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full select-none shadow-md ${className}`}
        style={{
          background: "linear-gradient(180deg, #dc2626 0%, #991b1b 100%)",
          border: "1.5px solid #f87171",
        }}
      >
        {/* Scanner Eyeball / Lens */}
        <div className="w-4 h-4 rounded-full bg-emerald-300 border-2 border-white flex items-center justify-center shadow-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>
        <span className="text-[10px] font-bold text-amber-200">
          {displayItems[0].shortLabel}
        </span>
        <span className="text-xs font-mono font-black text-white tabular-nums">
          {displayItems[0].value}
        </span>
      </div>
    );
  }

  // 11. 3D Bar Graph Box (Image 1 row 3 right)
  if (style === "graph") {
    return (
      <div
        className={`inline-flex flex-col justify-between p-2 rounded-lg select-none shadow-md ${className}`}
        style={{
          background: "linear-gradient(180deg, #2563eb 0%, #1e40af 100%)",
          border: "1px solid #60a5fa",
          minWidth: "125px",
        }}
      >
        <div className="flex items-start justify-between gap-2 text-white">
          <span className="text-[10px] font-semibold text-blue-100">
            {displayItems[0].shortLabel}
          </span>
          <span className="text-xs font-mono font-black text-white tabular-nums">
            {displayItems[0].value}
          </span>
        </div>
        {/* Bottom Bar Graph & Watermark */}
        <div className="flex items-end justify-between mt-2 pt-1 border-t border-blue-400/40">
          <div className="flex items-end gap-1">
            <span className="w-1.5 h-2.5 rounded-xs bg-emerald-400" />
            <span className="w-1.5 h-4 rounded-xs bg-amber-400" />
            <span className="w-1.5 h-3 rounded-xs bg-cyan-300" />
          </div>
          <span className="text-[9px] font-extrabold text-blue-200">
            {brandName}
          </span>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1b5fc9] text-white text-xs font-bold ${className}`}>
      <span>{displayItems[0].shortLabel}:</span>
      <span>{displayItems[0].value}</span>
    </div>
  );
};

