/**
 * In-App Purchase Service
 * 
 * Handles subscription purchases through RevenueCat for iOS and Android.
 * RevenueCat provides a unified API for both App Store and Play Store purchases.
 * 
 * Setup Requirements:
 * 1. Create a RevenueCat account at https://www.revenuecat.com
 * 2. Add your app in RevenueCat dashboard
 * 3. Configure products in App Store Connect / Google Play Console
 * 4. Link products to RevenueCat
 * 5. Set API keys in environment variables
 */

import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo, PurchasesEntitlementInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Product identifiers
export const PRODUCT_IDS = {
  PRO_MONTHLY: {
    ios: 'com.lawnguardian.pro.monthly',
    android: 'pro_monthly',
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
 * Call this when the app starts
 */
export async function initializePurchases(userId?: string): Promise<boolean> {
  try {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    console.log('[RevenueCat] initializePurchases called, platform:', platform);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:initializePurchases',message:'Function entry',data:{platform,isNative,userId:userId||'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H3'})}).catch(()=>{});
    // #endregion
    
    if (platform === 'web') {
      console.log('[RevenueCat] In-app purchases not available on web');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:initializePurchases',message:'Skipped - web platform',data:{platform},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      return false;
    }

    // Get API key based on platform
    // These should be set in your environment or app configuration
    const apiKey = platform === 'ios' 
      ? import.meta.env.VITE_REVENUECAT_APPLE_API_KEY 
      : import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY;

    console.log('[RevenueCat] API key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:initializePurchases',message:'API key check',data:{hasApiKey:!!apiKey,keyPrefix:apiKey?apiKey.substring(0,10):'NONE',platform},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    if (!apiKey) {
      console.error('[RevenueCat] API key not configured! Check .env file');
      return false;
    }

    // Always enable debug logging for now
    console.log('[RevenueCat] Setting DEBUG log level...');
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    // Configure RevenueCat
    console.log('[RevenueCat] Configuring with userId:', userId || 'anonymous');
    await Purchases.configure({
      apiKey,
      appUserID: userId || undefined, // Anonymous if no user ID
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:initializePurchases',message:'SDK configured successfully',data:{userId:userId||'anonymous'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    console.log('[RevenueCat] ✅ Initialized successfully!');
    return true;
  } catch (error) {
    console.error('[RevenueCat] ❌ Failed to initialize:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:initializePurchases',message:'SDK init FAILED',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    return false;
  }
}

/**
 * Set the RevenueCat user ID (call when user logs in)
 */
export async function setUserId(userId: string, email?: string): Promise<void> {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:setUserId',message:'Setting user ID',data:{userId,email:email||'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    // Log in the user to RevenueCat
    const { customerInfo } = await Purchases.logIn({ appUserID: userId });
    console.log('RevenueCat user logged in:', userId, 'Customer ID:', customerInfo.originalAppUserId);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:setUserId',message:'User logged in to RevenueCat',data:{userId,rcCustomerId:customerInfo.originalAppUserId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    // Set subscriber attributes for better identification in dashboard
    if (email) {
      await Purchases.setEmail({ email });
    }
    
    // Set custom attributes
    await Purchases.setAttributes({
      attributes: {
        '$supabaseUserId': userId,
      }
    });
    
    console.log('RevenueCat subscriber attributes set');
  } catch (error) {
    console.error('Failed to set user ID:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:setUserId',message:'Failed to set user ID',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    throw error; // Re-throw to handle in calling code
  }
}

/**
 * Clear the user ID (call when user logs out)
 */
export async function clearUserId(): Promise<void> {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    
    await Purchases.logOut();
    console.log('RevenueCat user logged out');
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
      console.log('No offerings available');
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:purchasePackage',message:'Starting purchase',data:{packageId:pkg.identifier,productId:pkg.product?.identifier},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:purchasePackage',message:'Purchase completed',data:{customerId:customerInfo.originalAppUserId,activeEntitlements:Object.keys(customerInfo.entitlements.active||{}),allEntitlements:Object.keys(customerInfo.entitlements.all||{})},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    // Check if the pro entitlement is now active
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (proEntitlement) {
      // Sync with backend
      await syncSubscriptionWithBackend(customerInfo);
      
      return { success: true, customerInfo };
    }

    return { success: false, error: 'Purchase completed but entitlement not active' };
  } catch (error: any) {
    console.error('Purchase failed:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d6a09e46-6885-4200-8674-0aecbfdc1924',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'inAppPurchaseService.ts:purchasePackage',message:'Purchase FAILED',data:{error:String(error),code:error.code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    // Handle specific error cases
    if (error.code === 1) { // USER_CANCELLED
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
    
    // Check if the pro entitlement is now active
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (proEntitlement) {
      await syncSubscriptionWithBackend(customerInfo);
      return { success: true, customerInfo };
    }

    return { success: false, error: 'No active subscriptions found' };
  } catch (error: any) {
    console.error('Restore failed:', error);
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
    console.error('Failed to get subscription status:', error);
    return { isSubscribed: false, willRenew: false };
  }
}

/**
 * Sync subscription status with backend
 */
async function syncSubscriptionWithBackend(customerInfo: CustomerInfo): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session, skipping backend sync');
      return;
    }

    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (!proEntitlement) {
      console.log('No pro entitlement, skipping sync');
      return;
    }

    const platform = Capacitor.getPlatform() as 'ios' | 'android';
    const planId = proEntitlement.productIdentifier.includes('annual') 
      ? 'pro_annual' 
      : 'pro_monthly';

    // Upsert subscription in database
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: session.user.id,
        plan_id: planId,
        platform,
        status: 'active',
        billing_period: planId.includes('annual') ? 'annual' : 'monthly',
        current_period_end: proEntitlement.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew_enabled: proEntitlement.willRenew,
        metadata: {
          revenuecat_id: customerInfo.originalAppUserId,
          product_id: proEntitlement.productIdentifier,
        },
      }, {
        onConflict: 'user_id,platform',
      });

    if (error) {
      console.error('Failed to sync subscription with backend:', error);
    } else {
      console.log('Subscription synced with backend');
    }
  } catch (error) {
    console.error('Error syncing subscription:', error);
  }
}

/**
 * Check if user has pro access (with caching)
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
 * Get full customer info for debugging
 * Returns detailed info about the current RevenueCat customer
 */
export async function getCustomerDebugInfo(): Promise<{
  customerId: string | null;
  allEntitlements: string[];
  activeEntitlements: string[];
  allPurchasedProductIds: string[];
  latestExpirationDate: string | null;
  requestDate: string;
} | null> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return null;
    }

    const { customerInfo } = await Purchases.getCustomerInfo();
    
    return {
      customerId: customerInfo.originalAppUserId,
      allEntitlements: Object.keys(customerInfo.entitlements.all || {}),
      activeEntitlements: Object.keys(customerInfo.entitlements.active || {}),
      allPurchasedProductIds: customerInfo.allPurchasedProductIdentifiers || [],
      latestExpirationDate: customerInfo.latestExpirationDate || null,
      requestDate: customerInfo.requestDate,
    };
  } catch (error) {
    console.error('Failed to get customer debug info:', error);
    return null;
  }
}

/**
 * Force refresh customer info from RevenueCat servers
 */
export async function forceRefreshCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return null;
    }

    // Invalidate cache and fetch fresh data
    await Purchases.invalidateCustomerInfoCache();
    const { customerInfo } = await Purchases.getCustomerInfo();
    
    console.log('Customer info refreshed:', {
      id: customerInfo.originalAppUserId,
      activeEntitlements: Object.keys(customerInfo.entitlements.active || {}),
      purchasedProducts: customerInfo.allPurchasedProductIdentifiers,
    });
    
    return customerInfo;
  } catch (error) {
    console.error('Failed to refresh customer info:', error);
    return null;
  }
}

