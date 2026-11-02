const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  public getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  public setAccessToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }

  // Alias for backward compatibility
  public setToken(token: string | null) {
    this.setAccessToken(token);
  }

  public getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  public setRefreshToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("refreshToken", token);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }

  public getStoredUser(): any | null {
    if (typeof window === "undefined") return null;
    try {
      const u = localStorage.getItem("histat_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  public setStoredUser(user: any | null) {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("histat_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("histat_user");
    }
  }

  public clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("histat_user");
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ refreshToken }),
        });

        if (response.status === 401 || response.status === 403) {
          // Token is definitively invalid/revoked
          this.clearAuth();
          return null;
        }

        if (!response.ok) {
          // Transient server issue, keep credentials intact
          return null;
        }

        const json = await response.json();
        if (json.success && json.data?.accessToken) {
          const newAccessToken = json.data.accessToken;
          this.setAccessToken(newAccessToken);
          if (json.data.refreshToken) {
            this.setRefreshToken(json.data.refreshToken);
          }
          return newAccessToken;
        }
        return null;
      } catch {
        // Network offline or tab sleep/wake glitch - DO NOT clear credentials!
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let token = this.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      // Handle token expiration: attempt auto-refresh on 401
      if (
        response.status === 401 &&
        !endpoint.includes("/auth/login") &&
        !endpoint.includes("/auth/register") &&
        !endpoint.includes("/auth/refresh")
      ) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
            credentials: "include",
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error. Please ensure the backend is running.",
      };
    }
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();
