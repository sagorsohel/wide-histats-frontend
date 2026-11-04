export interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
  status: "active" | "paused";
  isPublic: boolean;
  createdAt: string;
  activeVisitors?: number;
  usersOnline?: number;
  visitorsToday?: number;
  pageviewsToday?: number;
  totalVisitors?: number;
  totalPageviews?: number;
  displayId?: string;
  snapshotTime?: string;
}

export interface OverviewStats {
  activeVisitors: number;
  totalPageviews: number;
  uniqueVisitors: number;
  totalSessions: number;
  allTimeVisitors?: number;
  allTimePageviews?: number;
  allTimeSessions?: number;
  pagesPerSession: number;
  bounceRate: number;
  avgDuration: number;
  from: string;
  to: string;
}

export interface ActiveVisitor {
  visitorKey: string;
  sessionKey: string;
  currentPath: string;
  pageTitle?: string;
  pageUrl?: string;
  country: string;
  countryCode: string;
  city?: string;
  deviceType: string;
  browser: string;
  os: string;
  source: string;
  ip?: string;
  hitsCount?: number;
  pageviewsCount?: number;
  lastSeenAt: number;
}

export interface RealtimeRecentHit {
  id: string;
  path: string;
  title: string;
  url?: string;
  referrer: string | null;
  viewedAt: string;
  country?: string;
  countryCode?: string;
  city?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  visitorKey?: string;
  ip?: string;
  hitsCount?: number;
  websiteId?: string;
}

export interface RealtimeData {
  activeCount: number;
  activeCount5m?: number;
  activeCount15m?: number;
  todayVisitors?: number;
  todayPageviews?: number;
  totalVisitors?: number;
  totalPageviews?: number;
  browsingPagesCount?: number;
  activeVisitors: ActiveVisitor[];
  topPages: { path: string; title?: string; url?: string; count: number }[];
  topCountries: { country: string; code: string; count: number }[];
  topReferrers?: { referrer: string; count: number }[];
  devices: Record<string, number>;
  sources: Record<string, number>;
  recentPageviews: RealtimeRecentHit[];
}

export interface TimeseriesPoint {
  date: string;
  pageviews: number;
  visitors: number;
  sessions: number;
}

export interface CountryStat {
  country: string;
  country_code: string;
  visitors: number;
  pageviews: number;
}

export interface CityStat {
  city: string;
  country: string;
  visitors: number;
}

export interface GeographyData {
  countries: CountryStat[];
  cities: CityStat[];
}

export interface SourceStat {
  source: string;
  medium: string;
  sessions: number;
  visitors: number;
}

export interface ReferrerStat {
  referrer: string;
  count: number;
}

export interface CampaignStat {
  campaign: string;
  sessions: number;
}

export interface DetailedReferrerStat {
  rank: number;
  trend: "up" | "down" | "same";
  referrerUrl: string;
  fullUrl?: string;
  newVisitors: number;
  visitors: number;
  pageviews: number;
  ppv: number;
  avgDuration: number;
  tpp: string;
  bounceRate: number;
}

export interface ReferrerSummaryComparison {
  totalPageviews: number;
  refPageviews: number;
  pageviewsPct: number;
  totalVisitors: number;
  refVisitors: number;
  visitorsPct: number;
  totalNewVisitors: number;
  refNewVisitors: number;
  newVisitorsPct: number;
  totalPpv: number;
  refPpv: number;
  ppvDiffPct: number;
}

export interface SourcesData {
  sources: SourceStat[];
  referrers: ReferrerStat[];
  detailedReferrers?: DetailedReferrerStat[];
  referrerSummary?: ReferrerSummaryComparison;
  campaigns: CampaignStat[];
}

export interface PageStat {
  path: string;
  title: string | null;
  url?: string;
  pageviews: number;
  visitors: number;
}

export interface DeviceStat {
  device: string;
  sessions: number;
  visitors: number;
}

export interface BrowserStat {
  browser: string;
  sessions: number;
  visitors: number;
}

export interface OsStat {
  os: string;
  sessions: number;
  visitors: number;
}
