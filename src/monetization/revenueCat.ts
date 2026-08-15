import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import {
  LIFETIME_PRICE_FALLBACK,
  LIFETIME_PRODUCT_ID,
  PREMIUM_ENTITLEMENT_ID,
  REVENUECAT_IOS_KEY,
} from '@/config';

export function initRevenueCat(): void {
  if (!REVENUECAT_IOS_KEY) return;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
}

export async function purchaseLifetime(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const pkg =
    packages.find((p) => p.identifier === LIFETIME_PRODUCT_ID) ?? packages[0];
  if (!pkg) throw new Error('No RevenueCat package found');
  try {
    await Purchases.purchasePackage(pkg);
    return true;
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean };
    if (err.userCancelled) return false;
    throw e;
  }
}

export async function checkEntitlement(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo();
  return (
    info.entitlements.active[PREMIUM_ENTITLEMENT_ID] != null ||
    info.activeSubscriptions.length > 0
  );
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return (
    info.entitlements.active[PREMIUM_ENTITLEMENT_ID] != null ||
    info.activeSubscriptions.length > 0
  );
}

export async function getLifetimePrice(): Promise<string> {
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    const pkg =
      packages.find((p) => p.identifier === LIFETIME_PRODUCT_ID) ?? packages[0];
    return pkg?.product.priceString?.trim() || LIFETIME_PRICE_FALLBACK;
  } catch {
    return LIFETIME_PRICE_FALLBACK;
  }
}
