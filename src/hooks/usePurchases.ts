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

  // Get the monthly package
  const monthlyPackage = useMemo(() => {
    return offerings.find(pkg => 
      pkg.identifier === '$rc_monthly' || 
      pkg.product.identifier.includes('monthly')
    );
  }, [offerings]);

  // Get the annual package
  const annualPackage = useMemo(() => {
    return offerings.find(pkg => 
      pkg.identifier === '$rc_annual' || 
      pkg.product.identifier.includes('annual')
    );
  }, [offerings]);

  // Purchase monthly subscription
  const purchaseMonthly = async () => {
    if (!monthlyPackage) {
      return { success: false, error: 'Monthly package not available' };
    }
    return purchase(monthlyPackage);
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
    monthlyPackage,
    annualPackage,
    
    // Subscription info
    subscriptionStatus,
    subscriptionDetails,
    
    // Actions
    purchase,
    purchaseMonthly,
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

