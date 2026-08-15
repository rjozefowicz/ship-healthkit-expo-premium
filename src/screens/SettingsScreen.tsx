import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { requestAllHealthPermissions } from '@/health/permissions';
import type { LanguagePreference } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useHealthStore } from '@/store/healthStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { REVENUECAT_IOS_KEY } from '@/config';
import { colors, spacing } from '@/theme';

const LANGUAGE_OPTIONS: { value: LanguagePreference; labelKey: string }[] = [
  { value: 'system', labelKey: 'settings.languageSystem' },
  { value: 'en', labelKey: 'settings.languageEn' },
  { value: 'es', labelKey: 'settings.languageEs' },
];

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPro = usePurchaseStore((s) => s.isPro);
  const restore = usePurchaseStore((s) => s.restore);
  const setHealthConnected = useSettingsStore((s) => s.setHealthConnected);
  const healthConnected = useSettingsStore((s) => s.healthConnected);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const fetchHealthData = useHealthStore((s) => s.fetchHealthData);
  const lastFetchedAt = useHealthStore((s) => s.lastFetchedAt);

  async function reconnectHealth() {
    const ok = await requestAllHealthPermissions();
    await setHealthConnected(ok);
    if (ok) await fetchHealthData(true);
    Alert.alert(
      ok ? t('settings.connectedTitle') : t('settings.unavailableTitle'),
      ok ? t('settings.connectedBody') : t('settings.unavailableBody')
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>{t('settings.heading')}</Text>

      <Row
        label={t('settings.healthConnected')}
        value={healthConnected ? t('common.yes') : t('common.no')}
      />
      <Row
        label={t('settings.pro')}
        value={isPro ? t('settings.proActive') : t('settings.proFree')}
      />
      <Row
        label={t('settings.lastSync')}
        value={
          lastFetchedAt
            ? new Date(lastFetchedAt).toLocaleString(i18n.language)
            : t('common.never')
        }
      />
      <Row
        label={t('settings.revenueCat')}
        value={
          REVENUECAT_IOS_KEY
            ? t('settings.revenueCatConfigured')
            : t('settings.revenueCatNotSet')
        }
      />

      <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
      <View style={styles.langRow}>
        {LANGUAGE_OPTIONS.map((opt) => {
          const active = language === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.langChip, active && styles.langChipActive]}
              onPress={() => void setLanguage(opt.value)}
            >
              <Text style={[styles.langChipText, active && styles.langChipTextActive]}>
                {t(opt.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.btn} onPress={reconnectHealth}>
        <Text style={styles.btnText}>{t('settings.requestHealth')}</Text>
      </Pressable>
      <Pressable style={styles.btnSecondary} onPress={() => navigation.navigate('Paywall')}>
        <Text style={styles.btnText}>{t('settings.openPaywall')}</Text>
      </Pressable>
      <Pressable
        style={styles.btnSecondary}
        onPress={async () => {
          const ok = await restore();
          Alert.alert(
            ok ? t('settings.restoredTitle') : t('settings.noPurchasesTitle'),
            ok ? t('settings.restoredBody') : undefined
          );
        }}
      >
        <Text style={styles.btnText}>{t('settings.restorePurchases')}</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.md },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  langChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  langChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  langChipText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  langChipTextActive: { color: colors.text },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textMuted, fontWeight: '600' },
  rowValue: { color: colors.text, fontWeight: '600' },
  btn: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondary: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: colors.text, fontWeight: '700' },
});
