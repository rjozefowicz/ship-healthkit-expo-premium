import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AIInsightsCard } from '@/components/AIInsightsCard';
import { buildInsightsPrompt } from '@/ai/buildInsightsPrompt';
import { useHealthStore } from '@/store/healthStore';
import { useSessionStore } from '@/session/sessionStore';
import { colors, spacing } from '@/theme';

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CompanionScreen() {
  const { t } = useTranslation();
  const summaries = useHealthStore((s) => s.summaries);
  const active = useSessionStore((s) => s.active);
  const paused = useSessionStore((s) => s.paused);
  const startedAt = useSessionStore((s) => s.startedAt);
  const label = useSessionStore((s) => s.label);
  const start = useSessionStore((s) => s.start);
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);
  const stop = useSessionStore((s) => s.stop);
  const syncCompanions = useSessionStore((s) => s.syncCompanions);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active || paused) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active, paused]);

  useEffect(() => {
    syncCompanions(summaries);
  }, [summaries, active, startedAt, paused, syncCompanions]);

  const elapsed = (() => {
    if (!startedAt) return 0;
    void tick;
    const state = useSessionStore.getState();
    const startMs = new Date(state.startedAt!).getTime();
    const end = state.paused && state.pausedAt ? state.pausedAt : Date.now();
    return Math.max(0, Math.floor((end - startMs - state.pauseAccumulatedMs) / 1000));
  })();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>{t('companion.heading')}</Text>
      <Text style={styles.hint}>{t('companion.hint')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('companion.sessionTitle')}</Text>
        {active ? (
          <>
            <Text style={styles.timer}>
              {t('companion.sessionActive', {
                label,
                elapsed: formatElapsed(elapsed),
              })}
              {paused ? t('companion.pausedSuffix') : ''}
            </Text>
            <View style={styles.row}>
              {paused ? (
                <Pressable style={styles.btn} onPress={() => void resume()}>
                  <Text style={styles.btnText}>{t('companion.resume')}</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.btn} onPress={() => void pause()}>
                  <Text style={styles.btnText}>{t('companion.pause')}</Text>
                </Pressable>
              )}
              <Pressable style={[styles.btn, styles.btnDanger]} onPress={() => void stop()}>
                <Text style={styles.btnText}>{t('companion.end')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            style={styles.btn}
            onPress={() => void start(t('companion.walkLabel'))}
          >
            <Text style={styles.btnText}>{t('companion.startWalk')}</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.secondary} onPress={() => syncCompanions(summaries)}>
        <Text style={styles.btnText}>{t('companion.pushCompanions')}</Text>
      </Pressable>

      <AIInsightsCard prompt={buildInsightsPrompt(summaries)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  hint: { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  timer: { color: colors.text, fontSize: 22, fontWeight: '700' },
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDanger: { backgroundColor: colors.heart },
  btnText: { color: colors.text, fontWeight: '700' },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
