import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCommas(num: number): string {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString("en-US");
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function formatTimeAgo(timestamp: number | string): string {
  const time = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const elapsed = Math.floor((Date.now() - time) / 1000);

  if (elapsed < 10) return "just now";
  if (elapsed < 60) return `${elapsed}s ago`;
  const mins = Math.floor(elapsed / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

// Compute clean, unique 7-digit site ID (e.g. 4867998, 5055120) for URLs and UI
export function getSite7DigitId(site?: {
  id?: string;
  displayId?: string;
  trackingId?: string;
} | null): string {
  if (!site) return "";
  if (site.displayId && site.displayId.length >= 5) return site.displayId;
  const digits = site.trackingId?.replace(/[^0-9]/g, "");
  if (digits && digits.length >= 7) return digits.slice(0, 7);
  if (site.id) {
    let hash = 0;
    for (let i = 0; i < site.id.length; i++) {
      hash = (hash * 31 + site.id.charCodeAt(i)) & 0xffffffff;
    }
    return String(4800000 + (Math.abs(hash) % 300000));
  }
  return "";
}
