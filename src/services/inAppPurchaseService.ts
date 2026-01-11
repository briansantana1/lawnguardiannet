/**
 * In-App Purchase Service
 * 
 * Handles subscription purchases through RevenueCat for iOS and Android.
 * RevenueCat provides a unified API for both App Store and Play Store purchases.
 */

import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo, PurchasesEntitlementInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Product identifiers
export const PRODUCT_IDS = {
  PRO_WEEKLY: {
    ios: 'com.lawnguardian.pro.weekly',
    android: 'pro_weekly',
  },
  PRO_ANNUAL: {
    ios: 'com.lawnguardian.pro.annual',
    android: 'pro_annual',
  },
};

// RevenueCat entitlement identifier
export const ENTITLEMENT_ID = 'premium';

// Offering identifier
export const OFFERING_ID = 'default';

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  entitlement?: PurchasesEntitlementInfo;
  expirationDate?: string;
  willRenew: boolean;
  productId?: string;
}

/**
 * Initialize RevenueCat SDK
 */
export async function initializePurchases(userId?: string): Promise<boolean> {
  try {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'web') {
      return false;
    }

    const apiKey = platform === 'ios' 
      ? import.meta.env.VITE_REVENUECAT_APPLE_API_KEY 
      : import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY;

    if (!apiKey) {
      console.error('[RevenueCat] API key not configured');
      return false;
    }

    await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
    await Purchases.configure({
      apiKey,
      appUserID: userId || undefined,
    });

    return true;
  } catch (error) {
    console.error('[RevenueCat] Failed to initialize:', error);
    return false;
  }
}

/**
 * Set the RevenueCat user ID (call when user logs in)
 */
export async function setUserId(userId: string, email?: string): Promise<void> {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    
    const { customerInfo } = await Purchases.logIn({ appUserID: userId });
    
    if (email) {
      await Purchases.setEmail({ email });
    }
  } catch (error) {
    console.error('Failed to set user ID:', error);
    throw error;
  }
}

/**
 * Clear the user ID (call when user logs out)
 */
export async function clearUserId(): Promise<void> {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to log out:', error);
  }
}

/**
 * Get available packages/products
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return [];
    }

    const offerings = await Purchases.getOfferings();
    
    if (!offerings.current || !offerings.current.availablePackages) {
      return [];
    }

    return offerings.current.availablePackages;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return { success: false, error: 'Purchases not available on web' };
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (proEntitlement) {
      await syncSubscriptionWithBackend(customerInfo);
      return { success: true, customerInfo };
    }

    return { success: false, error: 'Purchase completed but entitlement not active' };
  } catch (error: any) {
    if (error.code === 1) {
      return { success: false, error: 'Purchase cancelled' };
    }
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return { success: false, error: 'Purchases not available on web' };
    }

    const { customerInfo } = await Purchases.restorePurchases();
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (proEntitlement) {
      await syncSubscriptionWithBackend(customerInfo);
      return { success: true, customerInfo };
    }

    return { success: false, error: 'No active subscriptions found' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return { isSubscribed: false, willRenew: false };
    }

    const { customerInfo } = await Purchases.getCustomerInfo();
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (proEntitlement) {
      return {
        isSubscribed: true,
        entitlement: proEntitlement,
        expirationDate: proEntitlement.expirationDate || undefined,
        willRenew: proEntitlement.willRenew,
        productId: proEntitlement.productIdentifier,
      };
    }

    return { isSubscribed: false, willRenew: false };
  } catch (error) {
    return { isSubscribed: false, willRenew: false };
  }
}

/**
 * Sync subscription status with backend
 */
async function syncSubscriptionWithBackend(customerInfo: CustomerInfo): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (!proEntitlement) return;

    // Subscription data is managed by RevenueCat
  } catch (error) {
    console.error('Error syncing subscription:', error);
  }
}

/**
 * Check if user has pro access
 */
export async function hasProAccess(): Promise<boolean> {
  const status = await getSubscriptionStatus();
  return status.isSubscribed;
}

/**
 * Get management URL for subscriptions
 */
export function getManagementUrl(): string {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'ios') {
    return 'https://apps.apple.com/account/subscriptions';
  } else if (platform === 'android') {
    return 'https://play.google.com/store/account/subscriptions';
  }
  
  return '';
}

/**
 * Force refresh customer info from RevenueCat servers
 */
export async function forceRefreshCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return null;
    }

    await Purchases.invalidateCustomerInfoCache();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    return null;
  }
}
