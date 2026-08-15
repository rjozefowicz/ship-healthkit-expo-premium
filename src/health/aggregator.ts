import { FETCH_WINDOW_DAYS } from '@/config';
import { formatDateKey, getDateRange, shortDayLabel } from '@/utils/dateUtils';
import type { RawHealthData } from './fetchers';
import type { ChartPoint, DailySummary, MetricKey, RawSample } from './types';

function groupByDay(samples: RawSample[]): Record<string, number[]> {
  const byDay: Record<string, number[]> = {};
  for (const s of samples) {
    const key = formatDateKey(s.startDate);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(s.value);
  }
  return byDay;
}

const sum = (vals: number[]) => vals.reduce((a, b) => a + b, 0);
const avg = (vals: number[]) => vals.reduce((a, b) => a + b, 0) / vals.length;

function reduceDay(
  byDay: Record<string, number[]>,
  dateKey: string,
  reducer: (vals: number[]) => number
): number | null {
  const vals = byDay[dateKey];
  if (!vals?.length) return null;
  return reducer(vals);
}

/**
 * Bucket raw samples into one DailySummary per calendar day.
 * Sleep is summed by sample start day (simple starter approach).
 */
export function aggregateToDailySummaries(
  raw: RawHealthData,
  days: number = FETCH_WINDOW_DAYS
): DailySummary[] {
  const { start, end } = getDateRange(days);
  const stepsByDay = groupByDay(raw.steps);
  const sleepByDay = groupByDay(raw.sleep);
  const rhrByDay = groupByDay(raw.restingHeartRate);
  const waterByDay = groupByDay(raw.water);

  const summaries: DailySummary[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dateKey = formatDateKey(cursor);
    summaries.push({
      dateKey,
      steps: reduceDay(stepsByDay, dateKey, sum),
      sleepHours: reduceDay(sleepByDay, dateKey, sum),
      restingHeartRate: reduceDay(rhrByDay, dateKey, avg),
      waterMl: reduceDay(waterByDay, dateKey, sum),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return summaries;
}

export function metricSeries(
  summaries: DailySummary[],
  metric: MetricKey
): ChartPoint[] {
  return summaries.map((s) => {
    const value = s[metric];
    return {
      dateKey: s.dateKey,
      label: shortDayLabel(s.dateKey),
      value: value ?? 0,
      missing: value == null,
    };
  });
}

export function todaySummary(summaries: DailySummary[]): DailySummary | null {
  const today = formatDateKey(new Date());
  return summaries.find((s) => s.dateKey === today) ?? null;
}
