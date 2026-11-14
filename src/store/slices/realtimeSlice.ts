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
}

const initialState: RealtimeState = {
  byWebsite: {},
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
            .map((h) => ({ ...h, websiteId }))
            .sort(
              (a, b) =>
                new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
            )
            .slice(0, 50)
        : [];

      // Smart non-destructive merge: retain newest live socket hits that arrived in real-time
      const existing = state.byWebsite[websiteId]?.recentHits || [];
      const mergedMap = new Map<string, RealtimeRecentHit>();
      for (const h of incomingHits) {
        mergedMap.set(h.id, h);
      }
      for (const h of existing) {
        if (!mergedMap.has(h.id)) {
          mergedMap.set(h.id, h);
        }
      }
      const mergedHits = Array.from(mergedMap.values())
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
        .slice(0, 50);

      state.byWebsite[websiteId] = {
        data,
        recentHits: mergedHits,
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
      if (!websiteId) return;

      if (!state.byWebsite[websiteId]) {
        state.byWebsite[websiteId] = {
          data: null,
          recentHits: [],
          lastUpdated: Date.now(),
        };
      } else {
        const current = state.byWebsite[websiteId];
        if (current.data) {
          // Apply every reported value, including 0, so counts can drop when visitors leave.
          if (typeof activeCount === "number") current.data.activeCount = activeCount;
          if (typeof activeCount5m === "number") current.data.activeCount5m = activeCount5m;
          if (typeof activeCount15m === "number") current.data.activeCount15m = activeCount15m;
          if (Array.isArray(activeVisitors)) current.data.activeVisitors = activeVisitors;
          current.lastUpdated = Date.now();
        }
      }
    },

    addRecentHit: (
      state,
      action: PayloadAction<{ websiteId: string; hit: RealtimeRecentHit }>
    ) => {
      const { websiteId, hit } = action.payload;
      if (!websiteId) return;

      const hitWithSite: RealtimeRecentHit = { ...hit, websiteId };

      if (!state.byWebsite[websiteId]) {
        state.byWebsite[websiteId] = {
          data: null,
          recentHits: [],
          lastUpdated: Date.now(),
        };
      }

      const existingHits = state.byWebsite[websiteId].recentHits;
      const filtered = existingHits.filter((h) => h.id !== hitWithSite.id);
      state.byWebsite[websiteId].recentHits = [hitWithSite, ...filtered]
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
  clearWebsiteRealtime,
  clearAllRealtime,
} = realtimeSlice.actions;

export default realtimeSlice.reducer;
