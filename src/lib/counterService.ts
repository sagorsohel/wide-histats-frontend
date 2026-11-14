import { Website, WebsiteCounter, CounterStyle, CounterDisplayOptions } from "@/types/analytics";
import { api } from "./api";

// The backend is the source of truth for counters (it generates the 7-digit counter IDs
// and always creates the main counter). localStorage is only a read-through cache so the
// list can render instantly / offline; it is never used to invent IDs.

const getStorageKey = (websiteId: string) => `analycos_counters_${websiteId}`;

const readCache = (websiteId: string): WebsiteCounter[] => {
  try {
    const stored = localStorage.getItem(getStorageKey(websiteId));
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCache = (websiteId: string, list: WebsiteCounter[]) => {
  try {
    localStorage.setItem(getStorageKey(websiteId), JSON.stringify(list));
  } catch {
    // storage unavailable
  }
};

/** Placeholder shown only when the server can't be reached and nothing is cached. */
const offlineMainCounter = (website: Website): WebsiteCounter => ({
  id: `main-${website.id}`,
  websiteId: website.id,
  counterId: website.trackingId,
  name: "Standard counter",
  style: "hidden",
  isHidden: true,
  isMain: true,
  displayOptions: {
    visitorsToday: true,
    totalVisitors: false,
    pageviewsToday: false,
    totalPageviews: false,
    usersOnline: false,
  },
  createdAt: new Date().toISOString(),
});

export const counterService = {
  /** Server list (refreshes the cache); falls back to the cache if the request fails. */
  async getCounters(website: Website): Promise<WebsiteCounter[]> {
    if (!website?.id) return [];

    const res = await api.get<WebsiteCounter[]>(`/api/v1/websites/${website.id}/counters`, {
      skipCache: true,
    });
    if (res.success && Array.isArray(res.data)) {
      writeCache(website.id, res.data);
      return res.data;
    }

    const cached = readCache(website.id);
    return cached.length > 0 ? cached : [offlineMainCounter(website)];
  },

  /** Creates the counter on the server and returns the server's record. Throws on failure. */
  async createCounter(
    website: Website,
    data: {
      name?: string;
      style: CounterStyle;
      displayOptions: CounterDisplayOptions;
    }
  ): Promise<WebsiteCounter> {
    const res = await api.post<WebsiteCounter>(`/api/v1/websites/${website.id}/counters`, {
      name: data.name,
      style: data.style,
      isHidden: data.style === "hidden",
      displayOptions: data.displayOptions,
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to create counter.");
    }
    writeCache(website.id, [...readCache(website.id), res.data]);
    return res.data;
  },

  /** Deletes on the server first; the cache is only updated when that succeeds. Throws on failure. */
  async deleteCounter(website: Website, counterId: string): Promise<void> {
    const res = await api.delete(`/api/v1/websites/${website.id}/counters/${encodeURIComponent(counterId)}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to delete counter.");
    }
    writeCache(
      website.id,
      readCache(website.id).filter((c) => c.counterId !== counterId && c.id !== counterId),
    );
  },
};
