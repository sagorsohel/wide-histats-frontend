"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";
import { Website } from "@/types/analytics";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchWebsites,
  createNewWebsite,
  setSelectedWebsite as setSelectedWebsiteAction,
  openTrackingModal as openTrackingModalAction,
  closeTrackingModal as closeTrackingModalAction,
} from "@/store/slices/websiteSlice";
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
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { websites, selectedWebsite, loading, trackingModalWebsite } = useAppSelector(
    (state) => state.website
  );

  const reloadWebsites = useCallback(async () => {
    if (user) {
      await dispatch(fetchWebsites());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchWebsites());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (selectedWebsite?.id) {
      subscribeToWebsite(selectedWebsite.id);
      return () => {
        unsubscribeFromWebsite(selectedWebsite.id);
      };
    }
  }, [selectedWebsite?.id]);

  const setSelectedWebsite = (website: Website) => {
    dispatch(setSelectedWebsiteAction(website));
  };

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

  const openTrackingModal = (website: Website) => {
    dispatch(openTrackingModalAction(website));
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
