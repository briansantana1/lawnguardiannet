/**
 * Purchase Context Provider
 * 
 * Provides RevenueCat state management across the app.
 * Handles initialization, user identification, and purchase state.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import {
  initializePurchases,
  setUserId,
  clearUserId,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getSubscriptionStatus,
  hasProAccess,
  getManagementUrl,
  ENTITLEMENT_ID,
  SubscriptionStatus,
  PurchaseResult,
} from '@/services/inAppPurchaseService';
import { useAuth } from '@/hooks/useAuth';

interface PurchaseContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  offerings: PurchasesPackage[];
  error: string | null;
  
  // Actions
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  refresh: () => Promise<void>;
  getManageUrl: () => string;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

interface PurchaseProviderProps {
  children: ReactNode;
}

export function PurchaseProvider({ children }: PurchaseProviderProps) {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat when component mounts
  useEffect(() => {
    const init = async () => {
      const platform = Capacitor.getPlatform();
      console.log('[PurchaseContext] Initializing on platform:', platform);
      
      if (platform === 'web') {
        // Web doesn't support in-app purchases
        console.log('[PurchaseContext] Web platform - skipping RevenueCat init');
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log('[PurchaseContext] Calling initializePurchases with user:', user?.id);
        const success = await initializePurchases(user?.id);
        console.log('[PurchaseContext] initializePurchases result:', success);
        setIsInitialized(success);
        
        if (success) {
          // Load offerings and status
          console.log('[PurchaseContext] Loading offerings and status...');
          await refreshState();
        } else {
          console.error('[PurchaseContext] initializePurchases returned false');
          setError('Failed to initialize - check API key');
        }
      } catch (err) {
        console.error('[PurchaseContext] Failed to initialize purchases:', err);
        setError('Failed to initialize purchase system: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Sync user ID with RevenueCat when auth state changes
  useEffect(() => {
    const syncUser = async () => {
      if (!isInitialized) return;
      
      const platform = Capacitor.getPlatform();
      if (platform === 'web') return;

      try {
        if (user?.id) {
          // Pass email for better customer identification in RevenueCat
          await setUserId(user.id, user.email);
          console.log('User synced with RevenueCat:', user.id, user.email);
        } else {
          await clearUserId();
        }
        
        // Refresh subscription status after user change
        await refreshState();
      } catch (err) {
        console.error('Failed to sync user with RevenueCat:', err);
        setError('Failed to sync user identity');
      }
    };

    syncUser();
  }, [user?.id, user?.email, isInitialized]);

  const refreshState = useCallback(async () => {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') return;

    try {
      setIsLoading(true);
      
      // Get subscription status
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
      setIsPro(status.isSubscribed);

      // Get available offerings
      const availableOfferings = await getOfferings();
      setOfferings(availableOfferings);
      
      setError(null);
    } catch (err) {
      console.error('Failed to refresh purchase state:', err);
      setError('Failed to load subscription status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await purchasePackage(pkg);
      
      if (result.success) {
        // Refresh state after successful purchase
        await refreshState();
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Purchase failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        // Refresh state after successful restore
        await refreshState();
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Restore failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const getManageUrl = useCallback(() => {
    return getManagementUrl();
  }, []);

  const value: PurchaseContextType = {
    isInitialized,
    isLoading,
    isPro,
    subscriptionStatus,
    offerings,
    error,
    purchase,
    restore,
    refresh: refreshState,
    getManageUrl,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase(): PurchaseContextType {
  const context = useContext(PurchaseContext);
  
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  
  return context;
}

// Export for convenience
export { ENTITLEMENT_ID };

