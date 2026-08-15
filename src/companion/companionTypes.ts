/** JSON keys must match native/HealthStackShared/CompanionData.swift */
export interface CompanionSnapshot {
  stepsToday: number;
  stepsGoal: number;
  sleepHoursLastNight: number | null;
  restingHeartRate: number | null;
  waterMlToday: number | null;
  isPro: boolean;
  updatedAt: string;
  /** ISO start of an active demo session (Live Activity / Island / Watch). */
  activeSessionStartedAt: string | null;
  activeSessionLabel: string | null;
}

export type WatchCommand = { action: 'request_sync' };

export function emptyCompanionSnapshot(isPro = false): CompanionSnapshot {
  return {
    stepsToday: 0,
    stepsGoal: 10000,
    sleepHoursLastNight: null,
    restingHeartRate: null,
    waterMlToday: null,
    isPro,
    updatedAt: new Date().toISOString(),
    activeSessionStartedAt: null,
    activeSessionLabel: null,
  };
}
