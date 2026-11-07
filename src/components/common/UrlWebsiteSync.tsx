"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useWebsite } from "@/context/WebsiteContext";
import { getSite7DigitId } from "@/lib/utils";

// Paths that should NOT have ?id= appended
const EXCLUDED_PATHS = ["/", "/login", "/control-panel", "/websites"];

export const UrlWebsiteSync: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { websites, selectedWebsite, setSelectedWebsite } = useWebsite();

  // Track the last urlId synced so we never revert user actions
  const activeSyncedIdRef = useRef<string | null>(null);

  const urlId = searchParams.get("id");

  // 1. Sync FROM URL: ONLY when urlId or websites changes
  useEffect(() => {
    if (!websites || websites.length === 0 || !urlId) return;

    // If this URL ID is already active, do nothing
    if (urlId === activeSyncedIdRef.current) return;

    // Check if the currently selected website already matches this urlId
    const current7Digit = getSite7DigitId(selectedWebsite);
    if (
      current7Digit === urlId ||
      selectedWebsite?.id === urlId ||
      selectedWebsite?.displayId === urlId ||
      selectedWebsite?.trackingId === urlId
    ) {
      activeSyncedIdRef.current = urlId;
      return;
    }

    const matched = websites.find(
      (w) =>
        getSite7DigitId(w) === urlId ||
        w.displayId === urlId ||
        w.trackingId === urlId ||
        w.id === urlId
    );

    if (matched) {
      activeSyncedIdRef.current = urlId;
      setSelectedWebsite(matched);
    }
  }, [urlId, websites]); // Notice: selectedWebsite is intentionally excluded to prevent race condition reverts

  // 2. Sync TO URL: When selectedWebsite changes (e.g. dock click, website switch)
  useEffect(() => {
    if (!pathname || EXCLUDED_PATHS.includes(pathname)) return;
    if (!selectedWebsite) return;

    const site7Digit = getSite7DigitId(selectedWebsite);
    if (!site7Digit) return;

    // Mark that this 7-digit ID is now intentionally active
    activeSyncedIdRef.current = site7Digit;

    const cleanBase = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const targetQuery = `?id=${encodeURIComponent(site7Digit)}`;
    const targetUrl = `${cleanBase}${targetQuery}`;

    if (typeof window !== "undefined") {
      const currentFull = window.location.pathname + window.location.search;
      if (
        currentFull !== targetUrl &&
        (window.location.search !== targetQuery ||
          !window.location.pathname.endsWith("/"))
      ) {
        window.history.replaceState(null, "", targetUrl);
      }
    }
  }, [pathname, selectedWebsite]);

  return null;
};
