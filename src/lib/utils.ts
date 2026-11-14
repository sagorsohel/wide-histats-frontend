import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCommas(num: number): string {
  if (num === undefined || num === null || Number.isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null || Number.isNaN(num)) return "0";
  const trim = (v: number) => v.toFixed(1).replace(/\.0$/, "");
  // Promote to the next unit when rounding would otherwise print "1000k".
  if (num >= 999_950) {
    return trim(num / 1_000_000) + "M";
  }
  if (num >= 1000) {
    return trim(num / 1000) + "k";
  }
  return String(Math.round(num));
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds || 0));
  if (total < 60) {
    return `${total}s`;
  }
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m ${secs}s`;
}

export function formatTimeAgo(timestamp: number | string): string {
  const time = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const elapsed = Math.max(0, Math.floor((Date.now() - time) / 1000));

  if (elapsed < 10) return "just now";
  if (elapsed < 60) return `${elapsed}s ago`;
  const mins = Math.floor(elapsed / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Returns `url` only when it is safe to use in an `href` / `window.open`:
 * absolute http(s) URLs or same-site relative paths. Anything else
 * (`javascript:`, `data:`, `vbscript:` …) collapses to `fallback`.
 * Referrers and page URLs come from the public tracking endpoint, so they
 * must be treated as untrusted input.
 */
export function safeHref(url?: string | null, fallback = "#"): string {
  if (!url) return fallback;
  const trimmed = String(url).trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // not an absolute URL
  }
  return fallback;
}

// Public site ID used in URLs and UI (e.g. 4867998). The backend always supplies a
// unique 7-digit `displayId`; the UUID fallback keeps IDs collision-free otherwise.
export function getSite7DigitId(site?: {
  id?: string;
  displayId?: string;
  trackingId?: string;
} | null): string {
  if (!site) return "";
  if (site.displayId && site.displayId.length >= 5) return site.displayId;
  const digits = site.trackingId?.replace(/[^0-9]/g, "");
  if (digits && digits.length >= 7) return digits;
  return site.id || "";
}

/**
 * Checks if a specific dashboard pathname is allowed to be publicly accessed
 * without logging in, based on the website's `isPublic` and `publicPages` settings.
 */
export function isPagePublic(
  pathname: string,
  site?: { isPublic?: boolean; publicPages?: string } | null
): boolean {
  if (!site) return false;

  // Extract section name: "/summary/" -> "summary", "/traffic-stats" -> "traffic-stats"
  const clean = pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "";

  // Administrative / Account routes are strictly private
  const STRICT_PRIVATE = ["settings", "websites", "control-panel", "profile"];
  if (STRICT_PRIVATE.includes(clean)) return false;

  const isPublic = Boolean(site.isPublic);
  const publicPages = (site.publicPages || "").toLowerCase().trim();

  // If website is explicitly marked public and no restrictive list or "all"
  if (isPublic && (!publicPages || publicPages === "all" || publicPages === "*")) {
    return true;
  }

  // If publicPages specifies "all" or "*"
  if (publicPages === "all" || publicPages === "*") {
    return true;
  }

  // If publicPages is empty or "none"
  if (!publicPages || publicPages === "none") {
    return false;
  }

  const allowedList = publicPages
    .split(",")
    .map((s) => s.trim().replace(/^["'\[]+|["'\]]+$/g, "").toLowerCase());

  return allowedList.includes(clean);
}
