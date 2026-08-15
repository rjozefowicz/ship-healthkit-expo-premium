import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Trend } from '@/components/charts/Trend';
import { ProGate } from '@/components/ProGate';
import { FREE_HISTORY_DAYS } from '@/config';
import { metricSeries } from '@/health/aggregator';
import type { MetricKey } from '@/health/types';
import type { RootStackParamList } from '@/navigation/types';
import { useHealthStore } from '@/store/healthStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { colors, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MetricDetail'>;

export function MetricDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { metric } = route.params;
  const summaries = useHealthStore((s) => s.summaries);
  const isPro = usePurchaseStore((s) => s.isPro);

  const meta = useMemo(() => {
    const map: Record<MetricKey, { title: string; color: string; unit: string }> = {
      steps: {
        title: t('metrics.steps'),
        color: colors.steps,
        unit: t('metrics.unitSteps'),
      },
      sleepHours: {
        title: t('metrics.sleep'),
        color: colors.sleep,
        unit: t('metrics.unitHours'),
      },
      restingHeartRate: {
        title: t('metrics.restingHr'),
        color: colors.heart,
        unit: t('metrics.unitBpm'),
      },
      waterMl: {
        title: t('metrics.water'),
        color: colors.water,
        unit: t('metrics.unitMl'),
      },
    };
    return map[metric];
  }, [metric, t]);

  const fullSeries = useMemo(() => metricSeries(summaries, metric), [summaries, metric]);
  const visible = isPro ? fullSeries : fullSeries.slice(-FREE_HISTORY_DAYS);
  const locked = !isPro && fullSeries.length > FREE_HISTORY_DAYS;

  const history = isPro
    ? t('metricDetail.fullHistory')
    : t('metricDetail.freeHistory', { days: FREE_HISTORY_DAYS });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.subtitle}>
        {t('metricDetail.subtitle', { history, unit: meta.unit })}
      </Text>

      <ProGate locked={locked} onPressUnlock={() => navigation.navigate('Paywall')}>
        <View style={styles.chartCard}>
          <Trend points={visible} color={meta.color} />
        </View>
      </ProGate>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: 6, marginBottom: spacing.md },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
