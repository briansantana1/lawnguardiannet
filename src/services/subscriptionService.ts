/**
 * Subscription Service
 * 
 * Handles all subscription-related operations for the app.
 * Works with Supabase Edge Functions for server-side validation.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  hasSubscription: boolean;
  status: "active" | "trialing" | "canceled" | "expired" | "grace_period" | "past_due" | "none";
  plan: {
    id: string;
    name: string;
    billingPeriod: "monthly" | "annual";
  } | null;
  expiresAt: string | null;
  isTrial: boolean;
  autoRenewEnabled: boolean;
  usage: {
    scansUsed: number;
    scansLimit: number;
    periodStart: string;
    periodEnd: string;
  };
  features: {
    unlimitedScans: boolean;
    aiIdentification: boolean;
    treatmentRecommendations: boolean;
    historyTracking: boolean;
    adFree: boolean;
    prioritySupport: boolean;
  };
}

export interface ValidateReceiptResult {
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    planId: string;
    billingPeriod: string;
    expiresAt: string;
    isTrial: boolean;
    autoRenewEnabled: boolean;
  };
  error?: string;
}

export interface RestorePurchasesResult {
  success: boolean;
  restoredPurchases: Array<{
    productId: string;
    transactionId: string;
    expiresAt: string;
    isActive: boolean;
    status: string;
  }>;
  hasActiveSubscription: boolean;
  activeSubscription?: {
    productId: string;
    expiresAt: string;
    isTrial: boolean;
  };
  error?: string;
}

// Default free tier status
const FREE_TIER_STATUS: SubscriptionStatus = {
  hasSubscription: false,
  status: "none",
  plan: null,
  expiresAt: null,
  isTrial: false,
  autoRenewEnabled: false,
  usage: {
    scansUsed: 0,
    scansLimit: 3,
    periodStart: new Date().toISOString(),
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  features: {
    unlimitedScans: false,
    aiIdentification: false,
    treatmentRecommendations: false,
    historyTracking: false,
    adFree: false,
    prioritySupport: false,
  },
};

/**
 * Get the current subscription status for the authenticated user
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return FREE_TIER_STATUS;
    }

    const { data, error } = await supabase.functions.invoke("get-subscription-status", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Error fetching subscription status:", error);
      return FREE_TIER_STATUS;
    }

    return data as SubscriptionStatus;
  } catch (error) {
    console.error("Error in getSubscriptionStatus:", error);
    return FREE_TIER_STATUS;
  }
}

/**
 * Validate an Apple App Store receipt
 */
export async function validateAppleReceipt(
  receiptData: string,
  productId: string,
  transactionId?: string
): Promise<ValidateReceiptResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase.functions.invoke("validate-apple-receipt", {
      body: { receiptData, productId, transactionId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Validate a Google Play purchase
 */
export async function validateGooglePurchase(
  purchaseToken: string,
  productId: string
): Promise<ValidateReceiptResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase.functions.invoke("validate-google-purchase", {
      body: { purchaseToken, productId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Restore purchases from the app store
 * Required by Apple App Store and Google Play Store guidelines
 */
export async function restorePurchases(
  platform: "ios" | "android",
  receipts: Array<{
    receiptData?: string;
    purchaseToken?: string;
    productId: string;
  }>
): Promise<RestorePurchasesResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { 
        success: false, 
        restoredPurchases: [],
        hasActiveSubscription: false,
        error: "Not authenticated" 
      };
    }

    const { data, error } = await supabase.functions.invoke("restore-purchases", {
      body: { platform, receipts },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      return { 
        success: false, 
        restoredPurchases: [],
        hasActiveSubscription: false,
        error: error.message 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      restoredPurchases: [],
      hasActiveSubscription: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Check if the user can perform a scan (has remaining scans or subscription)
 */
export async function canPerformScan(): Promise<{
  canScan: boolean;
  reason?: string;
  remainingScans?: number;
}> {
  const status = await getSubscriptionStatus();

  if (status.features.unlimitedScans) {
    return { canScan: true };
  }

  if (status.usage.scansUsed >= status.usage.scansLimit) {
    return { 
      canScan: false, 
      reason: "Monthly scan limit reached. Upgrade to Pro for unlimited scans.",
      remainingScans: 0
    };
  }

  return { 
    canScan: true, 
    remainingScans: status.usage.scansLimit - status.usage.scansUsed 
  };
}

/**
 * Record a scan usage (called after successful scan)
 */
export async function recordScanUsage(): Promise<{
  success: boolean;
  scansUsed: number;
  scansLimit: number;
  message?: string;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, scansUsed: 0, scansLimit: 3, message: "Not authenticated" };
    }

    // Call the database function to increment usage
    const { data, error } = await supabase.rpc("increment_scan_usage", {
      check_user_id: session.user.id,
    });

    if (error) {
      console.error("Error recording scan usage:", error);
      return { success: false, scansUsed: 0, scansLimit: 3, message: error.message };
    }

    const result = data?.[0];
    return {
      success: result?.success ?? false,
      scansUsed: result?.scans_used ?? 0,
      scansLimit: result?.scans_limit ?? 3,
      message: result?.message,
    };
  } catch (error) {
    return { 
      success: false, 
      scansUsed: 0, 
      scansLimit: 3, 
      message: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Check if user has premium features
 */
export function hasPremiumFeature(
  status: SubscriptionStatus,
  feature: keyof SubscriptionStatus["features"]
): boolean {
  return status.features[feature];
}

/**
 * Product IDs for in-app purchases
 */
export const PRODUCT_IDS = {
  ios: {
    monthly: "com.lawnguardian.pro.monthly",
    annual: "com.lawnguardian.pro.annual",
  },
  android: {
    monthly: "pro_monthly",
    annual: "pro_annual",
  },
} as const;

