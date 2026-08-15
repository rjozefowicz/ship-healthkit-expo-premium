import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HEALTH_CACHE_TTL_MS } from '@/config';
import { aggregateToDailySummaries, todaySummary } from '@/health/aggregator';
import { fetchAllHealthData } from '@/health/fetchers';
import type { DailySummary } from '@/health/types';
import i18n from '@/i18n';

const STORAGE_KEY = '@starter/health/summaries_v1';

interface HealthState {
  summaries: DailySummary[];
  lastFetchedAt: string | null;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  fetchHealthData: (force?: boolean) => Promise<void>;
  today: () => DailySummary | null;
}

let inFlight: Promise<void> | null = null;

export const useHealthStore = create<HealthState>((set, get) => ({
  summaries: [],
  lastFetchedAt: null,
  loading: false,
  error: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        summaries: DailySummary[];
        lastFetchedAt: string | null;
      };
      set({
        summaries: parsed.summaries ?? [],
        lastFetchedAt: parsed.lastFetchedAt ?? null,
      });
    } catch {
      // ignore corrupt cache
    }
  },

  fetchHealthData: async (force = false) => {
    if (inFlight) return inFlight;

    const { lastFetchedAt } = get();
    if (
      !force &&
      lastFetchedAt &&
      Date.now() - new Date(lastFetchedAt).getTime() < HEALTH_CACHE_TTL_MS
    ) {
      return;
    }

    inFlight = (async () => {
      set({ loading: true, error: null });
      try {
        const raw = await fetchAllHealthData();
        const summaries = aggregateToDailySummaries(raw);
        const fetchedAt = new Date().toISOString();
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ summaries, lastFetchedAt: fetchedAt })
        );
        set({ summaries, lastFetchedAt: fetchedAt, loading: false });
      } catch (e) {
        set({
          loading: false,
          error:
            e instanceof Error ? e.message : i18n.t('health.fetchFailed'),
        });
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  },

  today: () => todaySummary(get().summaries),
}));
