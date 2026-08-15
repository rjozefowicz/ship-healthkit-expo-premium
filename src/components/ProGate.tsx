import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/theme';

interface Props {
  locked: boolean;
  onPressUnlock: () => void;
  children: React.ReactNode;
}

/** Dim overlay + PRO badge when a feature requires purchase. */
export function ProGate({ locked, onPressUnlock, children }: Props) {
  const { t } = useTranslation();
  if (!locked) return <>{children}</>;

  return (
    <View style={styles.wrap}>
      <View style={styles.dimmed}>{children}</View>
      <Pressable style={styles.overlay} onPress={onPressUnlock}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('proGate.badge')}</Text>
        </View>
        <Text style={styles.hint}>{t('proGate.unlock')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  dimmed: {
    opacity: 0.35,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  hint: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
});
