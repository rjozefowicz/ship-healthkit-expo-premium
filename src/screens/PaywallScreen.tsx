import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getLifetimePrice } from '@/monetization/revenueCat';
import { LIFETIME_PRICE_FALLBACK, REVENUECAT_IOS_KEY } from '@/config';
import { usePurchaseStore } from '@/store/purchaseStore';
import { colors, spacing } from '@/theme';

export function PaywallScreen() {
  const { t } = useTranslation();
  const isPro = usePurchaseStore((s) => s.isPro);
  const purchasing = usePurchaseStore((s) => s.purchasing);
  const buyLifetime = usePurchaseStore((s) => s.buyLifetime);
  const restore = usePurchaseStore((s) => s.restore);
  const [price, setPrice] = useState(LIFETIME_PRICE_FALLBACK);

  useEffect(() => {
    void getLifetimePrice().then(setPrice);
  }, []);

  async function onBuy() {
    if (!REVENUECAT_IOS_KEY) {
      Alert.alert(t('paywall.rcMissingTitle'), t('paywall.rcMissingBuy'));
      return;
    }
    try {
      const ok = await buyLifetime();
      if (ok) Alert.alert(t('paywall.welcomeTitle'), t('paywall.welcomeBody'));
    } catch (e) {
      Alert.alert(
        t('paywall.purchaseFailed'),
        e instanceof Error ? e.message : t('paywall.unknownError')
      );
    }
  }

  async function onRestore() {
    if (!REVENUECAT_IOS_KEY) {
      Alert.alert(t('paywall.rcMissingTitle'), t('paywall.rcMissingRestore'));
      return;
    }
    const ok = await restore();
    Alert.alert(
      ok ? t('paywall.restoredTitle') : t('paywall.noPurchasesTitle'),
      ok ? t('paywall.restoredBody') : undefined
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t('paywall.title')}</Text>
      <Text style={styles.body}>{t('paywall.body')}</Text>

      <View style={styles.card}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.priceHint}>{t('paywall.lifetime')}</Text>
        <Text style={styles.bullet}>{t('paywall.bulletHistory')}</Text>
        <Text style={styles.bullet}>{t('paywall.bulletGating')}</Text>
        <Text style={styles.bullet}>{t('paywall.bulletRestore')}</Text>
      </View>

      {isPro ? (
        <Text style={styles.proActive}>{t('paywall.alreadyPro')}</Text>
      ) : (
        <Pressable style={styles.btn} onPress={onBuy} disabled={purchasing}>
          {purchasing ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.btnText}>{t('paywall.continue')}</Text>
          )}
        </Pressable>
      )}

      <Pressable onPress={onRestore} style={styles.restore}>
        <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: spacing.md },
  body: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  price: { color: colors.text, fontSize: 36, fontWeight: '800' },
  priceHint: { color: colors.textMuted, marginBottom: spacing.md },
  bullet: { color: colors.text, marginBottom: 6, lineHeight: 22 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  restore: { alignItems: 'center', marginTop: spacing.md, padding: 8 },
  restoreText: { color: colors.textMuted, fontWeight: '600' },
  proActive: { color: colors.success, fontWeight: '700', textAlign: 'center' },
});
