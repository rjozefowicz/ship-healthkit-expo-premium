import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Spark } from '@/components/charts/Spark';
import type { ChartPoint } from '@/health/types';
import { colors, spacing } from '@/theme';

interface Props {
  title: string;
  value: string;
  unit?: string;
  color: string;
  points: ChartPoint[];
  onPress?: () => void;
}

export function MetricCard({ title, value, unit, color, points, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>
            {value}
            {unit ? <Text style={styles.unit}> {unit}</Text> : null}
          </Text>
        </View>
        <Spark points={points} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  unit: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
