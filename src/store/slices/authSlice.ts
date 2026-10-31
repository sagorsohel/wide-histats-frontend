import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialStoredUser = api.getStoredUser();
const initialAccessToken = api.getAccessToken();
const initialRefreshToken = api.getRefreshToken();

const initialState: AuthState = {
  user: initialStoredUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!(initialStoredUser && initialAccessToken),
  loading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        "/api/v1/auth/login",
        credentials
      );

      if (!res.success || !res.data) {
        return rejectWithValue(res.message || "Login failed");
      }

      api.setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) {
        api.setRefreshToken(res.data.refreshToken);
      }
      api.setStoredUser(res.data.user);

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "An unexpected error occurred during login.");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        "/api/v1/auth/register",
        payload
      );

      if (!res.success || !res.data) {
        return rejectWithValue(res.message || "Registration failed");
      }

      api.setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) {
        api.setRefreshToken(res.data.refreshToken);
      }
      api.setStoredUser(res.data.user);

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "An unexpected error occurred during registration.");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = api.getAccessToken();
      const refreshToken = api.getRefreshToken();
      if (!token && !refreshToken) {
        return null;
      }

      const res = await api.get<User>("/api/v1/auth/me");
      if (res.success && res.data) {
        api.setStoredUser(res.data);
        return res.data;
      }

      // If /me returned unauthenticated and no refresh was possible, return null
      return rejectWithValue("Session expired");
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch user");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (allDevices: boolean = false) => {
    const refreshToken = api.getRefreshToken();
    try {
      await api.post("/api/v1/auth/logout", { refreshToken, allDevices });
    } catch {
      // Ignore network errors on logout
    } finally {
      api.clearAuth();
    }
    return true;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      api.setAccessToken(action.payload.accessToken);
      if (action.payload.refreshToken) {
        api.setRefreshToken(action.payload.refreshToken);
      }
      api.setStoredUser(action.payload.user);
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      api.setStoredUser(action.payload);
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      api.setAccessToken(action.payload.accessToken);
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        api.setRefreshToken(action.payload.refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      api.clearAuth();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Login failed";
    });

    // registerUser
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Registration failed";
    });

    // fetchCurrentUser
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      }
      state.loading = false;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      // Only clear if neither accessToken nor refreshToken exists
      if (!api.getAccessToken() && !api.getRefreshToken()) {
        state.user = null;
        state.isAuthenticated = false;
      }
      state.loading = false;
    });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
  },
});

export const { setCredentials, setUser, setTokens, logout, setLoading, setError } =
  authSlice.actions;

export default authSlice.reducer;
