"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Globe } from "lucide-react";

interface WebsiteFaviconProps {
  url?: string;
  domain?: string;
  size?: number;
  className?: string;
  fallbackIcon?: "link" | "globe";
}

export const extractCleanDomain = (url?: string, fallbackDomain?: string): string => {
  const tryExtract = (str?: string): string => {
    if (!str) return "";
    let clean = str.trim().toLowerCase();
    if (clean.startsWith("//")) clean = "https:" + clean;
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    try {
      const parsed = new URL(clean);
      const host = parsed.hostname.toLowerCase();
      return host.split(":")[0];
    } catch {
      return "";
    }
  };

  const domainFromUrl = tryExtract(url);
  if (domainFromUrl && domainFromUrl.includes(".")) {
    return domainFromUrl;
  }
  const domainFromFallback = tryExtract(fallbackDomain);
  if (domainFromFallback && domainFromFallback.includes(".")) {
    return domainFromFallback;
  }
  return "";
};

export const WebsiteFavicon: React.FC<WebsiteFaviconProps> = ({
  url,
  domain,
  size = 14,
  className = "",
  fallbackIcon = "link",
}) => {
  const host = extractCleanDomain(url, domain);
  const [sourceIndex, setSourceIndex] = useState(0);

  // High-reliability multi-tier favicon sources:
  // 1. Direct website root favicon (/favicon.ico)
  // 2. DuckDuckGo global favicon CDN (/ip3/<host>.ico)
  // 3. Google s2 favicon CDN
  const sources = useMemo(() => {
    if (!host) return [];
    return [
      `https://${host}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${host}.ico`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`,
    ];
  }, [host]);

  useEffect(() => {
    setSourceIndex(0);
  }, [host]);

  const handleError = () => {
    setSourceIndex((prev) => prev + 1);
  };

  if (!host || sourceIndex >= sources.length) {
    if (fallbackIcon === "globe") {
      return (
        <span className="inline-flex items-center justify-center shrink-0 text-slate-400">
          <Globe style={{ width: size, height: size }} className={className} />
        </span>
      );
    }
    // Histats square [↗] external link icon
    return (
      <span
        className="inline-flex items-center justify-center border border-[#8fa0b6] bg-white rounded-[1px] shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg
          className="text-[#475569]"
          style={{ width: `${Math.max(7, size - 5)}px`, height: `${Math.max(7, size - 5)}px` }}
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <path d="M2 1h5v5H6V2.41L1.71 6.71.29 5.29 4.59 1H2V1z" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 align-middle"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        key={`${host}-${sourceIndex}`}
        src={sources[sourceIndex]}
        alt=""
        width={size}
        height={size}
        className={`rounded-xs object-contain shrink-0 select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        loading="lazy"
        onError={handleError}
      />
    </span>
  );
};
