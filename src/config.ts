/** Days of HealthKit history to fetch on each sync. */
export const FETCH_WINDOW_DAYS = 30;

/** Cache TTL before a background refresh is suggested (ms). */
export const HEALTH_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * RevenueCat iOS API key — replace with your public SDK key.
 * Leave empty to run the app without purchases (isPro stays false).
 */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

/** Entitlement identifier configured in RevenueCat. */
export const PREMIUM_ENTITLEMENT_ID = 'pro';

/** Prefer this package id for lifetime unlock; falls back to first available. */
export const LIFETIME_PRODUCT_ID = '$rc_lifetime';

export const LIFETIME_PRICE_FALLBACK = '$29.99';

/** Free tier: how many days of chart history are visible without Pro. */
export const FREE_HISTORY_DAYS = 7;

/** App Group shared by phone, widget extension, and watch. */
export const APP_GROUP = 'group.com.example.healthstack';

export const WIDGET_DATA_KEY = 'widget_data';
