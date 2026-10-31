import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RealtimeData, RealtimeRecentHit } from "@/types/analytics";

export interface RealtimeState {
  data: RealtimeData | null;
  recentHits: RealtimeRecentHit[];
  isPaused: boolean;
  activeTab: string;
  mapZoom: number;
}

const initialState: RealtimeState = {
  data: null,
  recentHits: [],
  isPaused: false,
  activeTab: "summary",
  mapZoom: 1,
};

export const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    setRealtimeData: (state, action: PayloadAction<RealtimeData>) => {
      state.data = action.payload;

      // Merge new recent hits from payload
      if (action.payload.recentPageviews && action.payload.recentPageviews.length > 0) {
        const map = new Map<string, RealtimeRecentHit>();
        state.recentHits.forEach((h) => map.set(h.id, h));
        action.payload.recentPageviews.forEach((h) => map.set(h.id, h));

        state.recentHits = Array.from(map.values())
          .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
          .slice(0, 50);
      }
    },
    addRecentHit: (state, action: PayloadAction<RealtimeRecentHit>) => {
      const hit = action.payload;
      const filtered = state.recentHits.filter((h) => h.id !== hit.id);
      state.recentHits = [hit, ...filtered].slice(0, 50);
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
    clearRealtime: (state) => {
      state.data = null;
      state.recentHits = [];
    },
  },
});

export const {
  setRealtimeData,
  addRecentHit,
  setPaused,
  setActiveTab,
  setMapZoom,
  clearRealtime,
} = realtimeSlice.actions;

export default realtimeSlice.reducer;
