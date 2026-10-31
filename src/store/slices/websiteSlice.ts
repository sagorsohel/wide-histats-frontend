import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Website } from "@/types/analytics";
import { api } from "@/lib/api";
import { subscribeToWebsite, unsubscribeFromWebsite } from "@/lib/socket";

export interface WebsiteState {
  websites: Website[];
  selectedWebsite: Website | null;
  loading: boolean;
  trackingModalWebsite: Website | null;
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
  selectedWebsite: getStoredSelectedWebsite(),
  loading: false,
  trackingModalWebsite: null,
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
    openTrackingModal: (state, action: PayloadAction<Website>) => {
      state.trackingModalWebsite = action.payload;
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

      // Retain currently selected website if still in list, or select first
      if (action.payload.length > 0) {
        const currentId = state.selectedWebsite?.id;
        const matched = action.payload.find((w) => w.id === currentId);
        if (matched) {
          state.selectedWebsite = matched;
          if (typeof window !== "undefined") {
            localStorage.setItem("histat_selected_website", JSON.stringify(matched));
          }
        } else if (!state.selectedWebsite) {
          state.selectedWebsite = action.payload[0];
          if (typeof window !== "undefined") {
            localStorage.setItem("histat_selected_website", JSON.stringify(action.payload[0]));
          }
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
