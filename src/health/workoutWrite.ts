import { Platform } from 'react-native';
import {
  saveWorkoutSample,
  WorkoutActivityType,
} from '@kingstinct/react-native-healthkit';
import { requestHealthWritePermissions } from './permissions';

export type WorkoutWriteResult =
  | { ok: true }
  | { ok: false; reason: 'unauthorized' | 'invalid' | 'error'; error?: unknown };

export interface WorkoutInput {
  /** Unique id stored in HealthKit metadata for later cleanup. */
  id: string;
  startDate: Date;
  endDate: Date;
  /** Active energy in kcal. */
  energyKcal: number;
  /** Optional walking distance in meters. */
  distanceMeters?: number;
}

const MIN_DURATION_SECONDS = 60;

/**
 * Save a walking workout to Apple Health (simplified DeskWalker pattern).
 * Requests write auth on first call.
 */
export async function saveWalkingWorkout(
  input: WorkoutInput
): Promise<WorkoutWriteResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, reason: 'error', error: 'HealthKit writes require iOS' };
  }

  const durationSec = (input.endDate.getTime() - input.startDate.getTime()) / 1000;
  if (durationSec < MIN_DURATION_SECONDS || input.energyKcal <= 0) {
    return { ok: false, reason: 'invalid' };
  }

  const authorized = await requestHealthWritePermissions();
  if (!authorized) {
    return { ok: false, reason: 'unauthorized' };
  }

  try {
    const quantities =
      input.distanceMeters != null && input.distanceMeters > 0
        ? [
            {
              quantityType: 'HKQuantityTypeIdentifierDistanceWalkingRunning' as const,
              unit: 'm',
              quantity: input.distanceMeters,
              startDate: input.startDate,
              endDate: input.endDate,
            },
          ]
        : [];

    await saveWorkoutSample(
      WorkoutActivityType.walking,
      quantities,
      input.startDate,
      input.endDate,
      { energyBurned: input.energyKcal },
      {
        HKMetadataKeyIndoorWorkout: true,
        'com.example.healthkitstarter.workoutId': input.id,
      }
    );

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: 'error', error };
  }
}
