"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { subscribeToWebsite, unsubscribeFromWebsite } from "@/lib/socket";

interface WebsiteContextType {
  websites: Website[];
  selectedWebsite: Website | null;
  loading: boolean;
  setSelectedWebsite: (website: Website) => void;
  reloadWebsites: () => Promise<void>;
  createWebsite: (name: string, domain: string, isPublic?: boolean) => Promise<Website | null>;
  trackingModalWebsite: Website | null;
  openTrackingModal: (website: Website) => void;
  closeTrackingModal: () => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsiteState] = useState<Website | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackingModalWebsite, setTrackingModalWebsite] = useState<Website | null>(null);

  const reloadWebsites = useCallback(async () => {
    if (!user) {
      setWebsites([]);
      setSelectedWebsiteState(null);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get<Website[]>("/api/v1/websites");
      if (res.success && res.data) {
        setWebsites(res.data);
        if (res.data.length > 0) {
          // Keep current selected website if still exists, or default to first
          setSelectedWebsiteState((prev) => {
            if (prev) {
              const matched = res.data?.find((w) => w.id === prev.id);
              if (matched) return matched;
            }
            return res.data![0];
          });
        }
      }
    } catch {
      // Silent catch
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reloadWebsites();
  }, [reloadWebsites]);

  useEffect(() => {
    if (selectedWebsite?.id) {
      subscribeToWebsite(selectedWebsite.id);
      return () => {
        unsubscribeFromWebsite(selectedWebsite.id);
      };
    }
  }, [selectedWebsite?.id]);

  const setSelectedWebsite = (website: Website) => {
    if (selectedWebsite && selectedWebsite.id !== website.id) {
      unsubscribeFromWebsite(selectedWebsite.id);
    }
    setSelectedWebsiteState(website);
    subscribeToWebsite(website.id);
  };

  const createWebsite = async (name: string, domain: string, isPublic = false): Promise<Website | null> => {
    const res = await api.post<Website>("/api/v1/websites", {
      name,
      domain,
      isPublic,
    });

    if (res.success && res.data) {
      await reloadWebsites();
      setSelectedWebsite(res.data);
      return res.data;
    }
    return null;
  };

  const openTrackingModal = (website: Website) => {
    setTrackingModalWebsite(website);
  };

  const closeTrackingModal = () => {
    setTrackingModalWebsite(null);
  };

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        selectedWebsite,
        loading,
        setSelectedWebsite,
        reloadWebsites,
        createWebsite,
        trackingModalWebsite,
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
