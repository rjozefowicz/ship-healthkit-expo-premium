export type MetricKey = 'steps' | 'sleepHours' | 'restingHeartRate' | 'waterMl';

export interface RawSample {
  startDate: Date;
  endDate: Date;
  value: number;
}

export interface DailySummary {
  dateKey: string;
  steps: number | null;
  sleepHours: number | null;
  restingHeartRate: number | null;
  waterMl: number | null;
}

export const READ_TYPES = [
  'HKQuantityTypeIdentifierStepCount',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierDietaryWater',
] as const;

export const WRITE_TYPES = [
  'HKWorkoutTypeIdentifier',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierDietaryWater',
] as const;

export interface ChartPoint {
  dateKey: string;
  label: string;
  value: number;
  missing: boolean;
}
