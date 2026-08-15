import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Gauge } from '@/components/charts/Gauge';
import { MetricCard } from '@/components/MetricCard';
import { metricSeries } from '@/health/aggregator';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { useHealthStore } from '@/store/healthStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, spacing } from '@/theme';

type DashboardNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function formatSteps(n: number | null | undefined, empty: string): string {
  if (n == null) return empty;
  return Math.round(n).toLocaleString();
}

export function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<DashboardNav>();
  const summaries = useHealthStore((s) => s.summaries);
  const loading = useHealthStore((s) => s.loading);
  const error = useHealthStore((s) => s.error);
  const fetchHealthData = useHealthStore((s) => s.fetchHealthData);
  const today = useHealthStore((s) => s.today());
  const healthConnected = useSettingsStore((s) => s.healthConnected);

  const stepsSeries = useMemo(() => metricSeries(summaries, 'steps'), [summaries]);
  const sleepSeries = useMemo(() => metricSeries(summaries, 'sleepHours'), [summaries]);
  const rhrSeries = useMemo(() => metricSeries(summaries, 'restingHeartRate'), [summaries]);
  const waterSeries = useMemo(() => metricSeries(summaries, 'waterMl'), [summaries]);

  const stepGoalPct = Math.min(100, ((today?.steps ?? 0) / 10000) * 100);
  const empty = t('common.emDash');

  const onRefresh = useCallback(() => {
    void fetchHealthData(true);
  }, [fetchHealthData]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <Text style={styles.heading}>{t('dashboard.heading')}</Text>

      {!healthConnected ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('dashboard.healthNotConnectedTitle')}</Text>
          <Text style={styles.emptyBody}>{t('dashboard.healthNotConnectedBody')}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.hero}>
        <Gauge pct={stepGoalPct} color={colors.steps} size={110} label={t('metrics.unitSteps')} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>{t('dashboard.stepGoal')}</Text>
          <Text style={styles.heroValue}>
            {t('dashboard.stepGoalValue', {
              steps: formatSteps(today?.steps, empty),
            })}
          </Text>
          <Text style={styles.heroHint}>{t('dashboard.pullToRefresh')}</Text>
        </View>
      </View>

      <MetricCard
        title={t('metrics.steps')}
        value={formatSteps(today?.steps, empty)}
        color={colors.steps}
        points={stepsSeries.slice(-14)}
        onPress={() => navigation.navigate('MetricDetail', { metric: 'steps' })}
      />
      <MetricCard
        title={t('metrics.sleep')}
        value={today?.sleepHours != null ? today.sleepHours.toFixed(1) : empty}
        unit={t('metrics.unitHoursShort')}
        color={colors.sleep}
        points={sleepSeries.slice(-14)}
        onPress={() => navigation.navigate('MetricDetail', { metric: 'sleepHours' })}
      />
      <MetricCard
        title={t('metrics.restingHr')}
        value={
          today?.restingHeartRate != null
            ? Math.round(today.restingHeartRate).toLocaleString(i18n.language)
            : empty
        }
        unit={t('metrics.unitBpm')}
        color={colors.heart}
        points={rhrSeries.slice(-14)}
        onPress={() => navigation.navigate('MetricDetail', { metric: 'restingHeartRate' })}
      />
      <MetricCard
        title={t('metrics.water')}
        value={
          today?.waterMl != null
            ? Math.round(today.waterMl).toLocaleString(i18n.language)
            : empty
        }
        unit={t('metrics.unitMl')}
        color={colors.water}
        points={waterSeries.slice(-14)}
        onPress={() => navigation.navigate('MetricDetail', { metric: 'waterMl' })}
      />

      <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('Log')}>
        <Text style={styles.secondaryBtnText}>{t('dashboard.logCta')}</Text>
      </Pressable>

      {loading && summaries.length === 0 ? (
        <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.accent} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroLabel: { color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  heroValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  heroHint: { color: colors.textFaint, marginTop: 6, fontSize: 12 },
  empty: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  emptyTitle: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  emptyBody: { color: colors.textMuted, lineHeight: 20 },
  error: { color: colors.warning, marginBottom: spacing.sm },
  secondaryBtn: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.text, fontWeight: '700' },
});
