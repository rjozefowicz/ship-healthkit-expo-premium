import { Platform } from 'react-native';
import {
  queryCategorySamples,
  queryQuantitySamples,
} from '@kingstinct/react-native-healthkit';
import { FETCH_WINDOW_DAYS } from '@/config';
import { getDateRange } from '@/utils/dateUtils';
import type { RawSample } from './types';

const opts = (start: Date, end: Date) => ({
  from: start,
  to: end,
  limit: 100000,
});

export interface RawHealthData {
  steps: RawSample[];
  sleep: RawSample[];
  restingHeartRate: RawSample[];
  water: RawSample[];
}

async function fetchQuantity(
  type: string,
  unit: string,
  start: Date,
  end: Date
): Promise<RawSample[]> {
  if (Platform.OS !== 'ios') return [];
  try {
    const samples = await queryQuantitySamples(type as never, {
      ...opts(start, end),
      unit,
    } as never);
    return samples.map((s) => ({
      startDate: new Date(s.startDate),
      endDate: new Date(s.endDate),
      value: s.quantity,
    }));
  } catch (e) {
    console.warn(`[HealthKit] ${type} fetch failed`, e);
    return [];
  }
}

async function fetchSleep(start: Date, end: Date): Promise<RawSample[]> {
  if (Platform.OS !== 'ios') return [];
  try {
    const samples = await queryCategorySamples(
      'HKCategoryTypeIdentifierSleepAnalysis',
      opts(start, end)
    );
    // 1 = asleepUnspecified (legacy), 3 = core, 4 = deep, 5 = REM
    const asleep = new Set([1, 3, 4, 5]);
    return samples
      .filter((s) => asleep.has(typeof s.value === 'number' ? s.value : Number(s.value)))
      .map((s) => {
        const startDate = new Date(s.startDate);
        const endDate = new Date(s.endDate);
        const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        return { startDate, endDate, value: hours };
      });
  } catch (e) {
    console.warn('[HealthKit] sleep fetch failed', e);
    return [];
  }
}

export async function fetchAllHealthData(
  days: number = FETCH_WINDOW_DAYS
): Promise<RawHealthData> {
  const { start, end } = getDateRange(days);

  const [steps, sleep, restingHeartRate, water] = await Promise.all([
    fetchQuantity('HKQuantityTypeIdentifierStepCount', 'count', start, end),
    fetchSleep(start, end),
    fetchQuantity('HKQuantityTypeIdentifierRestingHeartRate', 'count/min', start, end),
    fetchQuantity('HKQuantityTypeIdentifierDietaryWater', 'mL', start, end),
  ]);

  return { steps, sleep, restingHeartRate, water };
}
