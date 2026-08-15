import { create } from 'zustand';
import SessionActivity, { type SessionActivityProps } from '@/liveActivities/SessionActivity';
import { pushCompanionState } from '@/companion/companionBridge';
import { emptyCompanionSnapshot, type CompanionSnapshot } from '@/companion/companionTypes';
import { todaySummary } from '@/health/aggregator';
import type { DailySummary } from '@/health/types';
import { usePurchaseStore } from '@/store/purchaseStore';
import { updateWidgetData } from '@/widget/widgetBridge';

type LiveHandle = {
  update: (props: SessionActivityProps) => Promise<void>;
  end: () => Promise<void>;
} | null;

interface SessionState {
  active: boolean;
  label: string;
  startedAt: string | null;
  paused: boolean;
  pauseAccumulatedMs: number;
  pausedAt: number | null;
  liveHandle: LiveHandle;
  start: (label?: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  /** Push widget + watch from latest health summaries + session. */
  syncCompanions: (summaries: DailySummary[]) => void;
}

let liveHandle: LiveHandle = null;

function activeElapsedSeconds(state: {
  startedAt: string | null;
  paused: boolean;
  pauseAccumulatedMs: number;
  pausedAt: number | null;
}): number {
  if (!state.startedAt) return 0;
  const start = new Date(state.startedAt).getTime();
  const end = state.paused && state.pausedAt ? state.pausedAt : Date.now();
  return Math.max(0, Math.floor((end - start - state.pauseAccumulatedMs) / 1000));
}

function buildSnapshot(
  summaries: DailySummary[],
  session: {
    startedAt: string | null;
    label: string;
    active: boolean;
  }
): CompanionSnapshot {
  const today = todaySummary(summaries);
  const isPro = usePurchaseStore.getState().isPro;
  return {
    ...emptyCompanionSnapshot(isPro),
    stepsToday: today?.steps ?? 0,
    sleepHoursLastNight: today?.sleepHours ?? null,
    restingHeartRate: today?.restingHeartRate ?? null,
    waterMlToday: today?.waterMl ?? null,
    isPro,
    updatedAt: new Date().toISOString(),
    activeSessionStartedAt: session.active ? session.startedAt : null,
    activeSessionLabel: session.active ? session.label : null,
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  active: false,
  label: 'Walk',
  startedAt: null,
  paused: false,
  pauseAccumulatedMs: 0,
  pausedAt: null,
  liveHandle: null,

  start: async (label = 'Walk') => {
    const startedAt = new Date().toISOString();
    try {
      liveHandle = await SessionActivity.start({ label, startedAt, paused: false });
    } catch (e) {
      console.warn('[LiveActivity] start failed', e);
      liveHandle = null;
    }
    set({
      active: true,
      label,
      startedAt,
      paused: false,
      pauseAccumulatedMs: 0,
      pausedAt: null,
      liveHandle,
    });
  },

  pause: async () => {
    const state = get();
    if (!state.active || state.paused || !state.startedAt) return;
    const pausedAt = Date.now();
    const elapsedSeconds = activeElapsedSeconds({ ...state, paused: true, pausedAt });
    try {
      await liveHandle?.update({
        label: state.label,
        startedAt: state.startedAt,
        paused: true,
        elapsedSeconds,
      });
    } catch {}
    set({ paused: true, pausedAt });
  },

  resume: async () => {
    const state = get();
    if (!state.active || !state.paused || !state.startedAt || state.pausedAt == null) return;
    const pauseAccumulatedMs = state.pauseAccumulatedMs + (Date.now() - state.pausedAt);
    // Shift startedAt forward so native timer shows active-only elapsed.
    const adjustedStart = new Date(
      new Date(state.startedAt).getTime() + pauseAccumulatedMs
    ).toISOString();
    try {
      await liveHandle?.update({
        label: state.label,
        startedAt: adjustedStart,
        paused: false,
      });
    } catch {}
    set({
      paused: false,
      pausedAt: null,
      pauseAccumulatedMs: 0,
      startedAt: adjustedStart,
    });
  },

  stop: async () => {
    try {
      await liveHandle?.end();
    } catch {}
    liveHandle = null;
    set({
      active: false,
      startedAt: null,
      paused: false,
      pauseAccumulatedMs: 0,
      pausedAt: null,
      liveHandle: null,
    });
  },

  syncCompanions: (summaries) => {
    const s = get();
    const snapshot = buildSnapshot(summaries, {
      active: s.active,
      startedAt: s.startedAt,
      label: s.label,
    });
    updateWidgetData(snapshot);
    pushCompanionState(snapshot);
  },
}));
