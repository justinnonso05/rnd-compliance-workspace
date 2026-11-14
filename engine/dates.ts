export const REG13_AREAS = [
  "Engineering studies",
  "Geological and geophysical studies",
  "Safety and environmental studies",
  "Local materials substitution studies",
];

export const TEMPLATE_FOCUS_AREAS = [
  ...REG13_AREAS,
  "Technology development studies",
];

export const HOLIDAYS_ON_QUARTER_STARTS = new Set([
  "2025-10-01",
  "2026-01-01",
  "2026-10-01",
]);

export interface SimpleDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export function parseISODate(s: string): SimpleDate {
  const parts = s.split("-").map((p) => parseInt(p, 10));
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
  };
}

export function formatISODate(d: SimpleDate): string {
  const y = d.year.toString().padStart(4, "0");
  const m = d.month.toString().padStart(2, "0");
  const day = d.day.toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addMonths(d: SimpleDate, n: number): SimpleDate {
  const mIndex = d.month - 1 + n;
  const year = d.year + Math.floor(mIndex / 12);
  const month = ((mIndex % 12) + 12) % 12 + 1;
  const maxD = daysInMonth(year, month);
  const day = Math.min(d.day, maxD);
  return { year, month, day };
}

export function addDays(d: SimpleDate, days: number): SimpleDate {
  const date = new Date(Date.UTC(d.year, d.month - 1, d.day));
  date.setUTCDate(date.getUTCDate() + days);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function diffInDays(a: SimpleDate, b: SimpleDate): number {
  const utc1 = Date.UTC(a.year, a.month - 1, a.day);
  const utc2 = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

export function compareDates(a: SimpleDate, b: SimpleDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function isAfter(a: SimpleDate, b: SimpleDate): boolean {
  return compareDates(a, b) > 0;
}

export function isBeforeOrEqual(a: SimpleDate, b: SimpleDate): boolean {
  return compareDates(a, b) <= 0;
}

export function getDayOfWeek(d: SimpleDate): number {
  // 0 is Sunday, 6 is Saturday
  return new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay();
}

export function isWeekendOrHoliday(d: SimpleDate): boolean {
  const dow = getDayOfWeek(d);
  if (dow === 0 || dow === 6) return true;
  const iso = formatISODate(d);
  return HOLIDAYS_ON_QUARTER_STARTS.has(iso);
}

export function firstWorkingDay(quarterStart: SimpleDate): SimpleDate {
  let cur = { ...quarterStart };
  while (isWeekendOrHoliday(cur)) {
    cur = addDays(cur, 1);
  }
  return cur;
}

export function countWords(s: string): number {
  if (!s || !s.trim()) return 0;
  return s.trim().split(/\s+/).length;
}
