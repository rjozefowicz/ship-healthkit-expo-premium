import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { CompanionSnapshot, WatchCommand } from './companionTypes';

export type { CompanionSnapshot, WatchCommand } from './companionTypes';

export function pushCompanionState(data: CompanionSnapshot): void {
  if (Platform.OS !== 'ios') return;
  try {
    NativeModules.WatchConnectivityBridge?.pushState(JSON.stringify(data));
  } catch {
    // best-effort
  }
}

export function patchCompanionIsPro(isPro: boolean): void {
  if (Platform.OS !== 'ios') return;
  try {
    NativeModules.WatchConnectivityBridge?.patchIsPro(isPro);
  } catch {}
}

const bridge = Platform.OS === 'ios' ? NativeModules.WatchConnectivityBridge : null;
const emitter = bridge ? new NativeEventEmitter(bridge) : null;

export function subscribeWatchCommands(handler: (cmd: WatchCommand) => void): () => void {
  if (!emitter) return () => {};
  const sub = emitter.addListener('onWatchCommand', (body: Record<string, unknown>) => {
    if (body.action === 'request_sync') {
      handler({ action: 'request_sync' });
    }
  });
  return () => sub.remove();
}
