import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { subscribeToWebsite, unsubscribeFromWebsite } from "@/lib/socket";
import { getSite7DigitId } from "@/lib/utils";

export interface WebsiteState {
  websites: Website[];
  selectedWebsite: Website | null;
  loading: boolean;
  trackingModalWebsite: Website | null;
  trackingModalTab: "settings" | "code";
}

const getStoredSelectedWebsite = (): Website | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("histat_selected_website");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState: WebsiteState = {
  websites: [],
  selectedWebsite: null,
  loading: false,
  trackingModalWebsite: null,
  trackingModalTab: "code",
};

export const fetchWebsites = createAsyncThunk(
  "website/fetchWebsites",
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await api.get<Website[]>("/api/v1/websites");
      if (res.success && res.data) {
        return res.data;
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
        dispatch(fetchWebsites());
        dispatch(setSelectedWebsite(res.data));
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
    },
    setSelectedWebsite: (state, action: PayloadAction<Website | null>) => {
      const prev = state.selectedWebsite;
      const next = action.payload;

      if (prev?.id && (!next || prev.id !== next.id)) {
        unsubscribeFromWebsite(prev.id);
      }

      state.selectedWebsite = next;

      if (typeof window !== "undefined") {
        if (next) {
          localStorage.setItem("histat_selected_website", JSON.stringify(next));
          subscribeToWebsite(next.id);
        } else {
          localStorage.removeItem("histat_selected_website");
        }
      }
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
    builder.addCase(fetchWebsites.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWebsites.fulfilled, (state, action) => {
      state.loading = false;
      state.websites = action.payload;

      // Retain currently selected website if still in list, or prioritize URL param, or select first
      if (action.payload.length > 0) {
        let preferredId: string | null = null;
        if (typeof window !== "undefined") {
          try {
            const params = new URLSearchParams(window.location.search);
            preferredId = params.get("id");
          } catch {}
        }
        const currentId = preferredId || state.selectedWebsite?.id;
        const matched = action.payload.find(
          (w) =>
            (preferredId &&
              (getSite7DigitId(w) === preferredId ||
                w.displayId === preferredId ||
                w.trackingId === preferredId ||
                w.id === preferredId)) ||
            (!preferredId &&
              (w.id === currentId || getSite7DigitId(w) === currentId))
        );
        if (matched) {
          state.selectedWebsite = matched;
        } else {
          state.selectedWebsite = action.payload[0];
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("histat_selected_website", JSON.stringify(state.selectedWebsite));
        }
      } else {
        state.selectedWebsite = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("histat_selected_website");
        }
      }
    });
    builder.addCase(fetchWebsites.rejected, (state) => {
      state.loading = false;
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
