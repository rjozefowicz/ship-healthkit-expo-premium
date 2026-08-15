import type { MetricKey } from '@/health/types';

export type RootStackParamList = {
  MainTabs: undefined;
  MetricDetail: { metric: MetricKey };
  Paywall: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Companion: undefined;
  Log: undefined;
  Settings: undefined;
};
