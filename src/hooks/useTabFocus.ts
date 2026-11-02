"use client";

import { useEffect, useRef } from "react";

/**
 * useTabFocus hook triggers a callback whenever the user returns to the browser tab
 * (e.g. after switching tabs or minimizing the browser for 10 minutes) or reconnects to the network.
 * It debounces rapid events to avoid redundant requests.
 */
export function useTabFocus(onFocusCallback: () => void, minIntervalMs: number = 3000) {
  const lastRunRef = useRef<number>(Date.now());
  const callbackRef = useRef(onFocusCallback);
  callbackRef.current = onFocusCallback;

  useEffect(() => {
    const handleWakeup = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        const now = Date.now();
        if (now - lastRunRef.current >= minIntervalMs) {
          lastRunRef.current = now;
          callbackRef.current();
        }
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleWakeup);
      window.addEventListener("focus", handleWakeup);
      window.addEventListener("online", handleWakeup);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleWakeup);
        window.removeEventListener("focus", handleWakeup);
        window.removeEventListener("online", handleWakeup);
      }
    };
  }, [minIntervalMs]);
}
