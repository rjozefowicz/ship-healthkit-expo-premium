import { Platform } from 'react-native';
import {
  isHealthDataAvailableAsync,
  requestAuthorization,
} from '@kingstinct/react-native-healthkit';
import { READ_TYPES, WRITE_TYPES } from './types';

export async function isHealthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await isHealthDataAvailableAsync();
  } catch {
    return false;
  }
}

/** Request read access for dashboard metrics. */
export async function requestHealthReadPermissions(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    const available = await isHealthAvailable();
    if (!available) return false;
    await requestAuthorization({ toRead: [...READ_TYPES] });
    return true;
  } catch (e) {
    console.warn('[HealthKit] read permission failed', e);
    return false;
  }
}

/** Request write access for workouts + water logging. */
export async function requestHealthWritePermissions(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    const available = await isHealthAvailable();
    if (!available) return false;
    await requestAuthorization({
      toShare: [...WRITE_TYPES],
      toRead: ['HKWorkoutTypeIdentifier'],
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] write permission failed', e);
    return false;
  }
}

/** Full onboarding grant: read + write in one sheet. */
export async function requestAllHealthPermissions(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    const available = await isHealthAvailable();
    if (!available) return false;
    await requestAuthorization({
      toRead: [...READ_TYPES, 'HKWorkoutTypeIdentifier'],
      toShare: [...WRITE_TYPES],
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] permission request failed', e);
    return false;
  }
}
