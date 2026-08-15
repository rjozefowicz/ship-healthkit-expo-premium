import { Platform } from 'react-native';
import { saveQuantitySample } from '@kingstinct/react-native-healthkit';
import { requestHealthWritePermissions } from './permissions';

export type WaterWriteResult =
  | { ok: true; uuid?: string }
  | { ok: false; reason: 'unauthorized' | 'invalid' | 'error'; error?: unknown };

/** Log dietary water (mL) to Apple Health. */
export async function saveWaterMl(volumeMl: number): Promise<WaterWriteResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, reason: 'error', error: 'HealthKit writes require iOS' };
  }
  if (volumeMl <= 0) {
    return { ok: false, reason: 'invalid' };
  }

  const authorized = await requestHealthWritePermissions();
  if (!authorized) {
    return { ok: false, reason: 'unauthorized' };
  }

  try {
    const now = new Date();
    const result = await saveQuantitySample(
      'HKQuantityTypeIdentifierDietaryWater',
      'mL',
      volumeMl,
      now,
      now,
      { HKWasUserEntered: true } as never
    );
    return { ok: true, uuid: result?.uuid };
  } catch (error) {
    return { ok: false, reason: 'error', error };
  }
}
