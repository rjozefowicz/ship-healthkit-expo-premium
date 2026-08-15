import { NativeModules, Platform } from 'react-native';
import type { CompanionSnapshot } from '@/companion/companionTypes';

export function updateWidgetData(data: CompanionSnapshot): void {
  if (Platform.OS !== 'ios') return;
  try {
    NativeModules.WidgetDataBridge?.updateWidgetData(JSON.stringify(data));
  } catch {
    // best-effort
  }
}

export function patchWidgetIsPro(isPro: boolean): void {
  if (Platform.OS !== 'ios') return;
  try {
    NativeModules.WidgetDataBridge?.patchWidgetIsPro(isPro);
  } catch {}
}
