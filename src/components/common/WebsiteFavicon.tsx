import React, { useState } from "react";
import { Globe, ExternalLink } from "lucide-react";

interface WebsiteFaviconProps {
  url?: string;
  domain?: string;
  size?: number;
  className?: string;
}

export const extractCleanDomain = (url?: string, fallbackDomain?: string): string => {
  if (url) {
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return new URL(url).hostname.toLowerCase();
      }
    } catch {}
  }
  if (fallbackDomain) {
    return fallbackDomain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split(":")[0]
      .trim();
  }
  return "";
};

export const WebsiteFavicon: React.FC<WebsiteFaviconProps> = ({
  url,
  domain,
  size = 14,
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);
  const host = extractCleanDomain(url, domain);

  if (!host || hasError) {
    return (
      <span className="inline-flex items-center justify-center shrink-0 text-slate-400">
        <Globe style={{ width: size, height: size }} className={className} />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 align-middle"
      style={{ width: size, height: size }}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
        alt=""
        width={size}
        height={size}
        className={`rounded-xs object-contain shrink-0 select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </span>
  );
};
