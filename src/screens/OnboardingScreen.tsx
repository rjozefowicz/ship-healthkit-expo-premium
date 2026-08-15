import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { requestAllHealthPermissions } from '@/health/permissions';
import { useHealthStore } from '@/store/healthStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, spacing } from '@/theme';

const STEP_KEYS = ['ship', 'privacy', 'connect'] as const;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const setHealthConnected = useSettingsStore((s) => s.setHealthConnected);
  const fetchHealthData = useHealthStore((s) => s.fetchHealthData);

  const stepKey = STEP_KEYS[index];
  const isLast = index === STEP_KEYS.length - 1;

  async function onContinue() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    setBusy(true);
    try {
      const ok = await requestAllHealthPermissions();
      await setHealthConnected(ok);
      if (ok) {
        await fetchHealthData(true);
      }
      await completeOnboarding();
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          {t('onboarding.stepCounter', {
            current: index + 1,
            total: STEP_KEYS.length,
          })}
        </Text>
        <Text style={styles.title}>{t(`onboarding.steps.${stepKey}.title`)}</Text>
        <Text style={styles.body}>{t(`onboarding.steps.${stepKey}.body`)}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={onContinue}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.btnText}>
              {isLast ? t('onboarding.connectHealth') : t('onboarding.continue')}
            </Text>
          )}
        </Pressable>
        {isLast ? (
          <Pressable
            onPress={async () => {
              await setHealthConnected(false);
              await completeOnboarding();
            }}
            style={styles.skip}
          >
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  eyebrow: {
    color: colors.textFaint,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: colors.textMuted, fontWeight: '600' },
});
