import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RealtimeData, RealtimeRecentHit } from "@/types/analytics";

export interface WebsiteRealtimeState {
  data: RealtimeData | null;
  recentHits: RealtimeRecentHit[];
  lastUpdated: number;
}

export interface RealtimeState {
  // Keyed by websiteId to guarantee 100% data isolation between websites
  byWebsite: Record<string, WebsiteRealtimeState>;
  isPaused: boolean;
  activeTab: string;
  mapZoom: number;
}

const initialState: RealtimeState = {
  byWebsite: {},
  isPaused: false,
  activeTab: "summary",
  mapZoom: 1,
};

export const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    setRealtimeData: (
      state,
      action: PayloadAction<{ websiteId: string; data: RealtimeData }>
    ) => {
      const { websiteId, data } = action.payload;
      if (!websiteId) return;

      const incomingHits = data.recentPageviews
        ? data.recentPageviews
            .slice()
            .sort(
              (a, b) =>
                new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
            )
            .slice(0, 50)
        : [];

      state.byWebsite[websiteId] = {
        data,
        recentHits: incomingHits,
        lastUpdated: Date.now(),
      };
    },

    updateLiveCounts: (
      state,
      action: PayloadAction<{
        websiteId: string;
        activeCount?: number;
        activeCount5m?: number;
        activeCount15m?: number;
        activeVisitors?: any[];
      }>
    ) => {
      const { websiteId, activeCount, activeCount5m, activeCount15m, activeVisitors } =
        action.payload;
      const current = state.byWebsite[websiteId];
      if (current?.data) {
        if (activeCount !== undefined) current.data.activeCount = activeCount;
        if (activeCount5m !== undefined) current.data.activeCount5m = activeCount5m;
        if (activeCount15m !== undefined) current.data.activeCount15m = activeCount15m;
        if (activeVisitors !== undefined) current.data.activeVisitors = activeVisitors;
      }
    },

    addRecentHit: (
      state,
      action: PayloadAction<{ websiteId: string; hit: RealtimeRecentHit }>
    ) => {
      const { websiteId, hit } = action.payload;
      if (!websiteId) return;

      if (!state.byWebsite[websiteId]) {
        state.byWebsite[websiteId] = {
          data: null,
          recentHits: [],
          lastUpdated: Date.now(),
        };
      }

      const existingHits = state.byWebsite[websiteId].recentHits;
      const filtered = existingHits.filter((h) => h.id !== hit.id);
      state.byWebsite[websiteId].recentHits = [hit, ...filtered]
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
        .slice(0, 50);

      // Also update counts in data if present
      if (state.byWebsite[websiteId].data) {
        state.byWebsite[websiteId].data.todayPageviews =
          (state.byWebsite[websiteId].data.todayPageviews || 0) + 1;
        state.byWebsite[websiteId].data.totalPageviews =
          (state.byWebsite[websiteId].data.totalPageviews || 0) + 1;

        if (state.byWebsite[websiteId].data.activeVisitors) {
          const visitors = state.byWebsite[websiteId].data.activeVisitors;
          const found = visitors.find(
            (v: any) =>
              (hit.visitorKey && v.visitorKey === hit.visitorKey) ||
              (hit.ip && v.ip === hit.ip)
          );
          if (found) {
            found.pageviewsCount = (found.pageviewsCount || found.hitsCount || 1) + 1;
            found.lastSeenAt = Date.now();
            if (hit.path) found.currentPath = hit.path;
            if (hit.title) found.pageTitle = hit.title;
            if (hit.url) found.pageUrl = hit.url;
          }
        }
      }
    },

    setPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    clearWebsiteRealtime: (state, action: PayloadAction<string>) => {
      delete state.byWebsite[action.payload];
    },
    clearAllRealtime: (state) => {
      state.byWebsite = {};
    },
  },
});

export const {
  setRealtimeData,
  updateLiveCounts,
  addRecentHit,
  setPaused,
  setActiveTab,
  setMapZoom,
  clearWebsiteRealtime,
  clearAllRealtime,
} = realtimeSlice.actions;

export default realtimeSlice.reducer;
