"use client";

import React, { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { Website } from "@/types/analytics";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchWebsites,
  createNewWebsite,
  setWebsites,
  setSelectedWebsite as setSelectedWebsiteAction,
  openTrackingModal as openTrackingModalAction,
  closeTrackingModal as closeTrackingModalAction,
} from "@/store/slices/websiteSlice";
import { useAuth } from "./AuthContext";
import { subscribeToWebsite, unsubscribeFromWebsite } from "@/lib/socket";
import { useTabFocus } from "@/hooks/useTabFocus";
import { api } from "@/lib/api";

const SELECTED_KEY = "histat_selected_website";
const WEBSITES_REFRESH_MS = 60_000;

interface WebsiteContextType {
  websites: Website[];
  selectedWebsite: Website | null;
  loading: boolean;
  /** True once the first website list request has settled. */
  websitesLoaded: boolean;
  setSelectedWebsite: (website: Website) => void;
  reloadWebsites: () => Promise<void>;
  createWebsite: (name: string, domain: string, isPublic?: boolean) => Promise<Website | null>;
  trackingModalWebsite: Website | null;
  trackingModalTab: "settings" | "code";
  openTrackingModal: (website: Website, tab?: "settings" | "code") => void;
  closeTrackingModal: () => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { websites, selectedWebsite, loading, loaded, trackingModalWebsite, trackingModalTab } =
    useAppSelector((state) => state.website);

  const reloadWebsites = useCallback(async () => {
    if (userId) {
      await dispatch(fetchWebsites({ silent: true }));
    }
  }, [userId, dispatch]);

  // Restore the last selected website on the client after mount (no SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SELECTED_KEY);
      const stored = raw ? (JSON.parse(raw) as Website) : null;
      if (stored?.id) dispatch(setSelectedWebsiteAction(stored));
    } catch {
      // ignore corrupt storage
    }
  }, [dispatch]);

  // Persist the selection (side effect lives here, not in the reducer).
  const persistReadyRef = useRef(false);
  useEffect(() => {
    if (!persistReadyRef.current) {
      persistReadyRef.current = true;
      return; // skip the initial null render so the restore above isn't wiped
    }
    try {
      if (selectedWebsite) localStorage.setItem(SELECTED_KEY, JSON.stringify(selectedWebsite));
      else localStorage.removeItem(SELECTED_KEY);
    } catch {
      // storage unavailable
    }
  }, [selectedWebsite]);

  // Load websites whenever a user signs in.
  useEffect(() => {
    if (userId) dispatch(fetchWebsites());
  }, [userId, dispatch]);

  // Load public website if visitor is unauthenticated but has an ID (e.g. from ?id= or storage)
  useEffect(() => {
    if (userId) return;
    let targetId: string | null = null;
    if (typeof window !== "undefined") {
      targetId = new URLSearchParams(window.location.search).get("id");
      if (!targetId) {
        try {
          const raw = localStorage.getItem(SELECTED_KEY);
          const stored = raw ? (JSON.parse(raw) as Website) : null;
          targetId = stored?.trackingId || stored?.id || null;
        } catch {}
      }
    }
    const queryId = targetId || "default";

    api
      .get<Website>(`/api/v1/websites/public/${encodeURIComponent(queryId)}`)
      .then((res) => {
        if (res.success && res.data) {
          dispatch(setWebsites([res.data]));
          dispatch(setSelectedWebsiteAction(res.data));
        } else {
          // Site not found or private
          dispatch(setWebsites([]));
          dispatch(setSelectedWebsiteAction(null));
        }
      })
      .catch(() => {
        // Network error or endpoint failure
        dispatch(setWebsites([]));
        dispatch(setSelectedWebsiteAction(null));
      });
  }, [userId, dispatch]);

  // Light background refresh of the website list, only while signed in and visible.
  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        dispatch(fetchWebsites({ silent: true }));
      }
    }, WEBSITES_REFRESH_MS);
    return () => clearInterval(timer);
  }, [userId, dispatch]);

  useTabFocus(() => {
    if (!userId) return;
    dispatch(fetchWebsites({ silent: true }));
    if (selectedWebsite?.id) subscribeToWebsite(selectedWebsite.id);
  });

  // The single place that manages the realtime room subscription.
  useEffect(() => {
    const id = selectedWebsite?.id;
    if (!id) return;
    subscribeToWebsite(id);
    return () => {
      unsubscribeFromWebsite(id);
    };
  }, [selectedWebsite?.id]);

  const setSelectedWebsite = useCallback(
    (website: Website) => {
      dispatch(setSelectedWebsiteAction(website));
    },
    [dispatch],
  );

  const createWebsite = async (
    name: string,
    domain: string,
    isPublic = false
  ): Promise<Website | null> => {
    const result = await dispatch(createNewWebsite({ name, domain, isPublic }));
    if (createNewWebsite.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const openTrackingModal = (website: Website, tab: "settings" | "code" = "code") => {
    dispatch(openTrackingModalAction({ website, tab }));
  };

  const closeTrackingModal = () => {
    dispatch(closeTrackingModalAction());
  };

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        selectedWebsite,
        loading,
        websitesLoaded: loaded,
        setSelectedWebsite,
        reloadWebsites,
        createWebsite,
        trackingModalWebsite,
        trackingModalTab: trackingModalTab || "code",
        openTrackingModal,
        closeTrackingModal,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error("useWebsite must be used within a WebsiteProvider");
  }
  return context;
};
