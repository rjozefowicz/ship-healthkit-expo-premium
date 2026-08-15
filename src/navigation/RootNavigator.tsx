import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CompanionScreen } from '@/screens/CompanionScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { LogScreen } from '@/screens/LogScreen';
import { MetricDetailScreen } from '@/screens/MetricDetailScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { PaywallScreen } from '@/screens/PaywallScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/theme';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('nav.today'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>●</Text>,
        }}
      />
      <Tabs.Screen
        name="Companion"
        component={CompanionScreen}
        options={{
          title: t('nav.companion'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>◌</Text>,
        }}
      />
      <Tabs.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: t('nav.log'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>＋</Text>,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>⚙</Text>,
        }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { t } = useTranslation();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="MetricDetail"
          component={MetricDetailScreen}
          options={{ title: t('nav.metric') }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal', title: t('nav.pro') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
