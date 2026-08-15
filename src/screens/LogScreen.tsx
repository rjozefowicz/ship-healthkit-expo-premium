import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { saveWaterMl } from '@/health/waterWrite';
import { saveWalkingWorkout } from '@/health/workoutWrite';
import { useHealthStore } from '@/store/healthStore';
import { colors, spacing } from '@/theme';

export function LogScreen() {
  const { t } = useTranslation();
  const fetchHealthData = useHealthStore((s) => s.fetchHealthData);
  const [minutes, setMinutes] = useState('30');
  const [kcal, setKcal] = useState('150');
  const [distance, setDistance] = useState('2000');
  const [water, setWater] = useState('250');
  const [busy, setBusy] = useState(false);

  async function onSaveWorkout() {
    const durationMin = Number(minutes);
    const energyKcal = Number(kcal);
    const distanceMeters = Number(distance);
    if (!durationMin || !energyKcal) {
      Alert.alert(t('log.invalidTitle'), t('log.invalidWorkout'));
      return;
    }

    setBusy(true);
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - durationMin * 60 * 1000);
      const result = await saveWalkingWorkout({
        id: `workout_${Date.now()}`,
        startDate,
        endDate,
        energyKcal,
        distanceMeters: distanceMeters > 0 ? distanceMeters : undefined,
      });

      if (!result.ok) {
        Alert.alert(t('log.writeFailed'), result.reason);
        return;
      }
      Alert.alert(t('log.savedTitle'), t('log.workoutSaved'));
      await fetchHealthData(true);
    } finally {
      setBusy(false);
    }
  }

  async function onSaveWater() {
    const volumeMl = Number(water);
    if (!volumeMl) {
      Alert.alert(t('log.invalidTitle'), t('log.invalidWater'));
      return;
    }
    setBusy(true);
    try {
      const result = await saveWaterMl(volumeMl);
      if (!result.ok) {
        Alert.alert(t('log.writeFailed'), result.reason);
        return;
      }
      Alert.alert(t('log.savedTitle'), t('log.waterSaved', { volume: volumeMl }));
      await fetchHealthData(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('log.heading')}</Text>
      <Text style={styles.hint}>{t('log.hint')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('log.walkingWorkout')}</Text>
        <Field label={t('log.durationMin')} value={minutes} onChangeText={setMinutes} />
        <Field label={t('log.energyKcal')} value={kcal} onChangeText={setKcal} />
        <Field label={t('log.distanceM')} value={distance} onChangeText={setDistance} />
        <Pressable style={styles.btn} onPress={onSaveWorkout} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.btnText}>{t('log.saveWorkout')}</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('log.water')}</Text>
        <Field label={t('log.volumeMl')} value={water} onChangeText={setWater} />
        <Pressable style={[styles.btn, styles.btnAlt]} onPress={onSaveWater} disabled={busy}>
          <Text style={styles.btnText}>{t('log.saveWater')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  hint: { color: colors.textMuted, marginTop: 6, marginBottom: spacing.md, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: spacing.sm },
  field: { marginBottom: spacing.sm },
  label: { color: colors.textMuted, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnAlt: { backgroundColor: colors.water },
  btnText: { color: colors.text, fontWeight: '700' },
});
