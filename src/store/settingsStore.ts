import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setAppLanguage,
  type LanguagePreference,
} from '@/i18n';

const KEYS = {
  onboardingComplete: '@starter/onboardingComplete',
  healthConnected: '@starter/healthConnected',
  language: '@starter/language',
};

interface SettingsState {
  hydrated: boolean;
  onboardingComplete: boolean;
  healthConnected: boolean;
  language: LanguagePreference;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setHealthConnected: (value: boolean) => Promise<void>;
  setLanguage: (value: LanguagePreference) => Promise<void>;
}

function parseLanguage(raw: string | null): LanguagePreference {
  if (raw === 'en' || raw === 'es' || raw === 'system') return raw;
  return 'system';
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hydrated: false,
  onboardingComplete: false,
  healthConnected: false,
  language: 'system',

  hydrate: async () => {
    const [onboarding, connected, languageRaw] = await Promise.all([
      AsyncStorage.getItem(KEYS.onboardingComplete),
      AsyncStorage.getItem(KEYS.healthConnected),
      AsyncStorage.getItem(KEYS.language),
    ]);
    const language = parseLanguage(languageRaw);
    await setAppLanguage(language);
    set({
      hydrated: true,
      onboardingComplete: onboarding === '1',
      healthConnected: connected === '1',
      language,
    });
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(KEYS.onboardingComplete, '1');
    set({ onboardingComplete: true });
  },

  setHealthConnected: async (value) => {
    await AsyncStorage.setItem(KEYS.healthConnected, value ? '1' : '0');
    set({ healthConnected: value });
  },

  setLanguage: async (value) => {
    await AsyncStorage.setItem(KEYS.language, value);
    await setAppLanguage(value);
    set({ language: value });
  },
}));
