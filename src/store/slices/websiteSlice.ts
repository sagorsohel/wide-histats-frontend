import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { getSite7DigitId } from "@/lib/utils";

// Reducers here are pure: persistence (localStorage) and socket subscriptions are
// handled by WebsiteProvider, which reacts to `selectedWebsite` changes.

export interface WebsiteState {
  websites: Website[];
  selectedWebsite: Website | null;
  loading: boolean;
  /** True after the first website list request has settled (success or failure). */
  loaded: boolean;
  trackingModalWebsite: Website | null;
  trackingModalTab: "settings" | "code";
}

const initialState: WebsiteState = {
  websites: [],
  selectedWebsite: null,
  loading: false,
  loaded: false,
  trackingModalWebsite: null,
  trackingModalTab: "code",
};

const matchesId = (w: Website, id: string) =>
  getSite7DigitId(w) === id || w.displayId === id || w.trackingId === id || w.id === id;

export const fetchWebsites = createAsyncThunk(
  "website/fetchWebsites",
  async (options: { silent?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get<Website[]>("/api/v1/websites", { skipCache: options?.silent });
      if (res.success && res.data) {
        // Read the URL here (thunk), not in the reducer, to keep reducers pure.
        let preferredId: string | null = null;
        if (typeof window !== "undefined") {
          preferredId = new URLSearchParams(window.location.search).get("id");
        }
        return { websites: res.data, preferredId };
      }
      return rejectWithValue(res.message || "Failed to load websites");
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load websites");
    }
  }
);

export const createNewWebsite = createAsyncThunk(
  "website/createNewWebsite",
  async (
    payload: { name: string; domain: string; isPublic?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await api.post<Website>("/api/v1/websites", payload);
      if (res.success && res.data) {
        dispatch(setSelectedWebsite(res.data));
        await dispatch(fetchWebsites());
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to create website");
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create website");
    }
  }
);

export const websiteSlice = createSlice({
  name: "website",
  initialState,
  reducers: {
    setWebsites: (state, action: PayloadAction<Website[]>) => {
      state.websites = action.payload;
      // Keep the selected object fresh (e.g. timezone edits) and drop it if deleted.
      if (state.selectedWebsite) {
        const fresh = action.payload.find((w) => w.id === state.selectedWebsite!.id);
        state.selectedWebsite = fresh || action.payload[0] || null;
      }
    },
    setSelectedWebsite: (state, action: PayloadAction<Website | null>) => {
      state.selectedWebsite = action.payload;
    },
    openTrackingModal: (
      state,
      action: PayloadAction<
        Website | { website: Website; tab?: "settings" | "code" }
      >
    ) => {
      if ("website" in action.payload) {
        state.trackingModalWebsite = action.payload.website;
        state.trackingModalTab = action.payload.tab || "code";
      } else {
        state.trackingModalWebsite = action.payload;
        state.trackingModalTab = "code";
      }
    },
    closeTrackingModal: (state) => {
      state.trackingModalWebsite = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWebsites.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.loading = true;
    });
    builder.addCase(fetchWebsites.fulfilled, (state, action) => {
      const { websites, preferredId } = action.payload;
      state.loading = false;
      state.loaded = true;
      state.websites = websites;

      if (websites.length === 0) {
        state.selectedWebsite = null;
        return;
      }
      // Priority: ?id= in URL → currently selected site → first site.
      const currentId = state.selectedWebsite?.id;
      const matched =
        (preferredId && websites.find((w) => matchesId(w, preferredId))) ||
        (currentId && websites.find((w) => matchesId(w, currentId))) ||
        websites[0];
      state.selectedWebsite = matched;
    });
    builder.addCase(fetchWebsites.rejected, (state) => {
      state.loading = false;
      state.loaded = true;
    });
  },
});

export const {
  setWebsites,
  setSelectedWebsite,
  openTrackingModal,
  closeTrackingModal,
} = websiteSlice.actions;

export default websiteSlice.reducer;
