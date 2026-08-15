import { create } from 'zustand';
import {
  checkEntitlement,
  initRevenueCat,
  purchaseLifetime,
  restorePurchases,
} from '@/monetization/revenueCat';
import { REVENUECAT_IOS_KEY } from '@/config';

interface PurchaseState {
  isPro: boolean;
  ready: boolean;
  purchasing: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  buyLifetime: () => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  isPro: false,
  ready: false,
  purchasing: false,

  init: async () => {
    if (!REVENUECAT_IOS_KEY) {
      set({ ready: true, isPro: false });
      return;
    }
    try {
      initRevenueCat();
      const isPro = await checkEntitlement();
      set({ isPro, ready: true });
    } catch {
      set({ ready: true, isPro: false });
    }
  },

  refresh: async () => {
    if (!REVENUECAT_IOS_KEY) return;
    try {
      const isPro = await checkEntitlement();
      set({ isPro });
    } catch {
      // keep previous
    }
  },

  buyLifetime: async () => {
    if (!REVENUECAT_IOS_KEY) return false;
    set({ purchasing: true });
    try {
      const ok = await purchaseLifetime();
      if (ok) await get().refresh();
      return ok;
    } finally {
      set({ purchasing: false });
    }
  },

  restore: async () => {
    if (!REVENUECAT_IOS_KEY) return false;
    set({ purchasing: true });
    try {
      const ok = await restorePurchases();
      if (ok) set({ isPro: true });
      return ok;
    } finally {
      set({ purchasing: false });
    }
  },
}));
