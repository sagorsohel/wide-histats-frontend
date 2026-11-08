"use client";

import React from "react";
import { useWebsite } from "@/context/WebsiteContext";
import { TrackingSnippetModal } from "./TrackingSnippetModal";

export const TrackingModalWrapper: React.FC = () => {
  const { trackingModalWebsite, trackingModalTab, closeTrackingModal } = useWebsite();

  if (!trackingModalWebsite) return null;

  return (
    <TrackingSnippetModal
      website={trackingModalWebsite}
      onClose={closeTrackingModal}
      initialTab={trackingModalTab || "code"}
    />
  );
};
