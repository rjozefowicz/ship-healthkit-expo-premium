import 'react-native-gesture-handler';
import '@/i18n';
import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscribeWatchCommands } from '@/companion/companionBridge';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useSessionStore } from '@/session/sessionStore';
import { useHealthStore } from '@/store/healthStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/theme';

export default function App() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const healthConnected = useSettingsStore((s) => s.healthConnected);
  const hydrateHealth = useHealthStore((s) => s.hydrate);
  const fetchHealthData = useHealthStore((s) => s.fetchHealthData);
  const initPurchases = usePurchaseStore((s) => s.init);

  useEffect(() => {
    void (async () => {
      await Promise.all([hydrateSettings(), hydrateHealth(), initPurchases()]);
    })();
  }, [hydrateSettings, hydrateHealth, initPurchases]);

  useEffect(() => {
    if (hydrated && onboardingComplete && healthConnected) {
      void fetchHealthData();
    }
  }, [hydrated, onboardingComplete, healthConnected, fetchHealthData]);

  useEffect(() => {
    return subscribeWatchCommands(() => {
      void fetchHealthData(true);
    });
  }, [fetchHealthData]);

  useEffect(() => {
    const unsub = useHealthStore.subscribe((state, prev) => {
      if (state.summaries !== prev.summaries) {
        useSessionStore.getState().syncCompanions(state.summaries);
      }
    });
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
