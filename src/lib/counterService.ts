import { Website, WebsiteCounter, CounterStyle, CounterDisplayOptions } from "@/types/analytics";
import { api } from "./api";

// Helper to generate a unique 7-digit numeric counter ID
export const generate7DigitCounterId = (): string => {
  return String(Math.floor(1000000 + Math.random() * 9000000));
};

const getStorageKey = (websiteId: string) => `analycos_counters_${websiteId}`;

export const counterService = {
  // Load counters for a specific website
  async getCounters(website: Website): Promise<WebsiteCounter[]> {
    if (!website || !website.id) return [];

    const storageKey = getStorageKey(website.id);

    // 1. Try reading from localStorage first for instantaneous 0ms display
    let localList: WebsiteCounter[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localList = JSON.parse(stored);
      }
    } catch {}

    // If no counters exist locally, create the initial default "Main (Hidden)" counter
    if (!localList || localList.length === 0) {
      const mainCounter: WebsiteCounter = {
        id: `main-${website.id}`,
        websiteId: website.id,
        counterId: website.trackingId || generate7DigitCounterId(),
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
      };
      localList = [mainCounter];
      try {
        localStorage.setItem(storageKey, JSON.stringify(localList));
      } catch {}
    }

    // 2. Background attempt to fetch/sync from backend API if available
    try {
      const res = await api.get<WebsiteCounter[]>(
        `/api/v1/websites/${website.id}/counters`,
        { skipCache: true }
      );
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Merge API data with local storage
        localList = res.data;
        try {
          localStorage.setItem(storageKey, JSON.stringify(localList));
        } catch {}
      }
    } catch {
      // Offline or network error: fallback smoothly to local storage
    }

    return localList;
  },

  // Create a new counter for a website
  async createCounter(
    website: Website,
    data: {
      name?: string;
      style: CounterStyle;
      displayOptions: CounterDisplayOptions;
    }
  ): Promise<WebsiteCounter> {
    const counterId = generate7DigitCounterId();
    const isHidden = data.style === "hidden";

    const newCounter: WebsiteCounter = {
      id: `c_${Date.now()}_${counterId}`,
      websiteId: website.id,
      counterId,
      name: data.name || (isHidden ? "Standard counter" : `Counter ${counterId}`),
      style: data.style,
      isHidden,
      isMain: false,
      displayOptions: data.displayOptions,
      createdAt: new Date().toISOString(),
    };

    // Save locally immediately
    const storageKey = getStorageKey(website.id);
    try {
      const stored = localStorage.getItem(storageKey);
      const list: WebsiteCounter[] = stored ? JSON.parse(stored) : [];
      list.push(newCounter);
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}

    // Background push to backend API
    try {
      await api.post(`/api/v1/websites/${website.id}/counters`, {
        name: newCounter.name,
        style: newCounter.style,
        isHidden: newCounter.isHidden,
        displayOptions: newCounter.displayOptions,
      });
    } catch {}

    return newCounter;
  },

  // Delete a counter
  async deleteCounter(website: Website, counterId: string): Promise<void> {
    const storageKey = getStorageKey(website.id);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let list: WebsiteCounter[] = JSON.parse(stored);
        list = list.filter((c) => c.counterId !== counterId && c.id !== counterId);
        localStorage.setItem(storageKey, JSON.stringify(list));
      }
    } catch {}

    // Background push to backend API
    try {
      await api.delete(`/api/v1/websites/${website.id}/counters/${counterId}`);
    } catch {}
  },
};

