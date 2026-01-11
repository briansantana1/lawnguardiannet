/**
 * usePurchases Hook
 * 
 * Convenient hook for accessing RevenueCat purchase functionality.
 * Wraps the PurchaseContext with additional utility functions.
 */

import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { usePurchase } from '@/contexts/PurchaseContext';
import { PRODUCT_IDS, OFFERING_ID } from '@/services/inAppPurchaseService';

export function usePurchases() {
  const {
    isInitialized,
    isLoading,
    isPro,
    subscriptionStatus,
    offerings,
    error,
    purchase,
    restore,
    refresh,
    getManageUrl,
  } = usePurchase();

  const platform = Capacitor.getPlatform();
  const isNative = platform === 'ios' || platform === 'android';

  // Get the weekly package
  const weeklyPackage = useMemo(() => {
    return offerings.find(pkg => 
      pkg.identifier === '$rc_weekly' || 
      pkg.product.identifier.includes('weekly')
    );
  }, [offerings]);

  // Get the annual package
  const annualPackage = useMemo(() => {
    return offerings.find(pkg => 
      pkg.identifier === '$rc_annual' || 
      pkg.product.identifier.includes('annual')
    );
  }, [offerings]);

  // Purchase weekly subscription
  const purchaseWeekly = async () => {
    if (!weeklyPackage) {
      return { success: false, error: 'Weekly package not available' };
    }
    return purchase(weeklyPackage);
  };

  // Purchase annual subscription
  const purchaseAnnual = async () => {
    if (!annualPackage) {
      return { success: false, error: 'Annual package not available' };
    }
    return purchase(annualPackage);
  };

  // Format price for display
  const formatPrice = (priceString: string | undefined) => {
    return priceString || 'N/A';
  };

  // Get subscription details for display
  const subscriptionDetails = useMemo(() => {
    if (!subscriptionStatus?.isSubscribed) {
      return null;
    }

    return {
      isActive: subscriptionStatus.isSubscribed,
      expirationDate: subscriptionStatus.expirationDate 
        ? new Date(subscriptionStatus.expirationDate).toLocaleDateString()
        : null,
      willRenew: subscriptionStatus.willRenew,
      productId: subscriptionStatus.productId,
    };
  }, [subscriptionStatus]);

  // Check if purchases are available on this platform
  const isPurchaseAvailable = useMemo(() => {
    return isNative && isInitialized && offerings.length > 0;
  }, [isNative, isInitialized, offerings.length]);

  return {
    // State
    isInitialized,
    isLoading,
    isPro,
    isNative,
    isPurchaseAvailable,
    error,
    
    // Packages
    offerings,
    weeklyPackage,
    annualPackage,
    
    // Subscription info
    subscriptionStatus,
    subscriptionDetails,
    
    // Actions
    purchase,
    purchaseWeekly,
    purchaseAnnual,
    restore,
    refresh,
    
    // Utilities
    getManageUrl,
    formatPrice,
    
    // Constants
    PRODUCT_IDS,
    OFFERING_ID,
  };
}

export default usePurchases;

