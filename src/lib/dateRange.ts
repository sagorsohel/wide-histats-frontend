import type { RangeOption, CustomDateWindow } from "@/components/analytics/DateRangePicker";

/** Must match the backend fallback in analytics.service.ts. */
export const DEFAULT_TIMEZONE = "Asia/Dhaka";

function isValidTimeZone(tz?: string | null): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function resolveTz(tz?: string | null): string {
  return isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
}

/** Calendar Y/M/D of `instant` as seen in `tz`. */
function ymdInTz(instant: Date, tz: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** Offset (ms) of `tz` from UTC at `instant`. */
function tzOffsetMs(instant: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** UTC instant of 00:00 on calendar day (y, m, d + addDays) in `tz`. */
function startOfDayInTz(y: number, m: number, d: number, tz: string, addDays = 0): Date {
  const guess = Date.UTC(y, m - 1, d + addDays);
  // Two passes handle days where the offset changes (DST).
  let t = guess - tzOffsetMs(new Date(guess), tz);
  t = guess - tzOffsetMs(new Date(t), tz);
  return new Date(t);
}

export interface ResolvedRange {
  from: string;
  to: string;
  /** True when the whole window starts after "now" (no traffic possible). */
  isFuture: boolean;
  /** True when the window contains the current moment (live counters may tick it). */
  includesNow: boolean;
}

/**
 * Single source of truth for report date windows, evaluated in the website's timezone
 * (the backend buckets hours/days in that same timezone).
 *
 * Presets are whole calendar days:
 *  - today:     today 00:00 → today 23:59:59.999
 *  - yesterday: yesterday 00:00 → yesterday 23:59:59.999
 *  - 7d / 30d:  the last 7 / 30 calendar days INCLUDING today
 *
 * Bounds are stable for the whole day, so repeated requests share cache keys.
 *
 * Custom windows from the calendar carry local-midnight instants; we keep their
 * calendar days and re-anchor them to the website timezone.
 */
export function resolveRange(
  range: RangeOption,
  customWindow: CustomDateWindow | null,
  timezone?: string | null,
  now: Date = new Date(),
): ResolvedRange {
  const tz = resolveTz(timezone);
  let fromDate: Date;
  let toDate: Date;

  if (customWindow) {
    const localFrom = new Date(customWindow.from);
    const localTo = new Date(customWindow.to);
    fromDate = startOfDayInTz(localFrom.getFullYear(), localFrom.getMonth() + 1, localFrom.getDate(), tz);
    toDate = new Date(
      startOfDayInTz(localTo.getFullYear(), localTo.getMonth() + 1, localTo.getDate(), tz, 1).getTime() - 1,
    );
  } else {
    const { y, m, d } = ymdInTz(now, tz);
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 1;
    const endOffset = range === "yesterday" ? 0 : 1;
    const startOffset = range === "yesterday" ? -1 : 1 - days;
    fromDate = startOfDayInTz(y, m, d, tz, startOffset);
    toDate = new Date(startOfDayInTz(y, m, d, tz, endOffset).getTime() - 1);
  }

  const nowMs = now.getTime();
  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    isFuture: fromDate.getTime() > nowMs,
    includesNow: fromDate.getTime() <= nowMs && toDate.getTime() >= nowMs,
  };
}

/** Bounds of a single calendar day (the local Y/M/D of `day`) in the website timezone. */
export function resolveDay(day: Date, timezone?: string | null): ResolvedRange {
  const win: CustomDateWindow = { from: day.toISOString(), to: day.toISOString(), mode: "daily" };
  return resolveRange("today", win, timezone);
}
