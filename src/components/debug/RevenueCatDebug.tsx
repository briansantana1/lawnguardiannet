/**
 * RevenueCat Debug Component
 * 
 * Use this component during development to verify RevenueCat integration.
 * Shows current subscription status, available offerings, and allows testing.
 * 
 * Usage: Add <RevenueCatDebug /> to any page during development.
 * Remove or hide in production!
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePurchases } from '@/hooks/usePurchases';
import { useAuth } from '@/hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { getCustomerDebugInfo, forceRefreshCustomerInfo } from '@/services/inAppPurchaseService';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Smartphone,
  Apple,
  Globe,
  User,
  Package,
  CreditCard,
  Loader2,
  Bug,
  Search
} from 'lucide-react';

interface CustomerDebugInfo {
  customerId: string | null;
  allEntitlements: string[];
  activeEntitlements: string[];
  allPurchasedProductIds: string[];
  latestExpirationDate: string | null;
  requestDate: string;
}

export function RevenueCatDebug() {
  const { user } = useAuth();
  const {
    isInitialized,
    isLoading,
    isPro,
    isNative,
    isPurchaseAvailable,
    offerings,
    monthlyPackage,
    annualPackage,
    subscriptionStatus,
    subscriptionDetails,
    error,
    refresh,
    restore,
    purchaseMonthly,
    purchaseAnnual,
  } = usePurchases();

  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [customerDebugInfo, setCustomerDebugInfo] = useState<CustomerDebugInfo | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const platform = Capacitor.getPlatform();
  
  // Add log helper
  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };
  
  // Log on mount
  useEffect(() => {
    addLog(`Platform: ${platform}, isNative: ${Capacitor.isNativePlatform()}`);
    addLog(`User: ${user?.id?.substring(0,8) || 'none'}`);
    addLog(`SDK Init: ${isInitialized}, Loading: ${isLoading}`);
    addLog(`Apple Key: ${import.meta.env.VITE_REVENUECAT_APPLE_API_KEY ? 'SET' : 'MISSING'}`);
  }, []);
  
  // Log when state changes
  useEffect(() => {
    if (isInitialized) addLog(`✅ SDK Initialized!`);
  }, [isInitialized]);
  
  useEffect(() => {
    if (offerings.length > 0) addLog(`✅ ${offerings.length} offerings loaded`);
  }, [offerings.length]);
  
  useEffect(() => {
    if (error) addLog(`❌ Error: ${error}`);
  }, [error]);

  const handleRestore = async () => {
    setIsRestoring(true);
    await restore();
    setIsRestoring(false);
  };

  const handlePurchaseMonthly = async () => {
    setIsPurchasing(true);
    await purchaseMonthly();
    setIsPurchasing(false);
  };

  const handlePurchaseAnnual = async () => {
    setIsPurchasing(true);
    await purchaseAnnual();
    setIsPurchasing(false);
  };

  const handleCheckCustomer = async () => {
    setIsCheckingCustomer(true);
    try {
      // Force refresh from RevenueCat servers
      await forceRefreshCustomerInfo();
      // Get detailed debug info
      const info = await getCustomerDebugInfo();
      setCustomerDebugInfo(info);
    } catch (err) {
      console.error('Failed to check customer:', err);
    }
    setIsCheckingCustomer(false);
  };

  const StatusIcon = ({ ok }: { ok: boolean }) => (
    ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  );

  const PlatformIcon = () => {
    switch (platform) {
      case 'ios': return <Apple className="w-4 h-4" />;
      case 'android': return <Smartphone className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  // TEMPORARILY show always for debugging RevenueCat
  // TODO: Remove this after testing - restore the condition below
  // const showDebug = !import.meta.env.PROD || Capacitor.isNativePlatform();
  // if (!showDebug) { return null; }

  return (
    <Card className="border-dashed border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          RevenueCat Debug Panel
          <Badge variant="outline" className="ml-auto">DEV ONLY</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Platform & Status */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <PlatformIcon />
            <span className="font-medium">Platform:</span>
            <span className="capitalize">{platform}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon ok={isInitialized} />
            <span>SDK Initialized</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon ok={isNative} />
            <span>Native Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon ok={isPurchaseAvailable} />
            <span>Purchases Available</span>
          </div>
        </div>

        {/* User Info */}
        <div className="border-t pt-2">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4" />
            <span className="font-medium">User</span>
          </div>
          <div className="pl-6 text-xs text-muted-foreground">
            {user ? (
              <>
                <p>Supabase ID: {user.id.substring(0, 8)}...</p>
                <p>Email: {user.email}</p>
              </>
            ) : (
              <p className="text-red-500">Not logged in - purchases won't be linked!</p>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="border-t pt-2">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="font-medium">Subscription</span>
            {isPro && <Badge className="bg-green-500">PRO</Badge>}
          </div>
          <div className="pl-6 text-xs text-muted-foreground">
            <p>Is Pro: {isPro ? 'Yes ✓' : 'No'}</p>
            {subscriptionDetails && (
              <>
                <p>Expires: {subscriptionDetails.expirationDate || 'N/A'}</p>
                <p>Will Renew: {subscriptionDetails.willRenew ? 'Yes' : 'No'}</p>
                <p>Product: {subscriptionDetails.productId || 'N/A'}</p>
              </>
            )}
          </div>
        </div>

        {/* Customer Debug Info */}
        {customerDebugInfo && (
          <div className="border-t pt-2">
            <div className="flex items-center gap-2 mb-1">
              <Bug className="w-4 h-4" />
              <span className="font-medium">RevenueCat Customer</span>
            </div>
            <div className="pl-6 text-xs text-muted-foreground space-y-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <p><strong>Customer ID:</strong> {customerDebugInfo.customerId || 'Anonymous'}</p>
              <p><strong>All Entitlements:</strong> {customerDebugInfo.allEntitlements.length > 0 ? customerDebugInfo.allEntitlements.join(', ') : 'None'}</p>
              <p><strong>Active Entitlements:</strong> {customerDebugInfo.activeEntitlements.length > 0 ? customerDebugInfo.activeEntitlements.join(', ') : 'None'}</p>
              <p><strong>Purchased Products:</strong> {customerDebugInfo.allPurchasedProductIds.length > 0 ? customerDebugInfo.allPurchasedProductIds.join(', ') : 'None'}</p>
              <p><strong>Latest Expiration:</strong> {customerDebugInfo.latestExpirationDate || 'N/A'}</p>
            </div>
            {customerDebugInfo.allPurchasedProductIds.length > 0 && customerDebugInfo.activeEntitlements.length === 0 && (
              <p className="text-yellow-600 text-xs mt-2 font-medium">
                ⚠️ Products purchased but no entitlements! Check RevenueCat dashboard - make sure "pro" entitlement is configured and products are attached.
              </p>
            )}
          </div>
        )}

        {/* Offerings */}
        <div className="border-t pt-2">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4" />
            <span className="font-medium">Offerings ({offerings.length})</span>
          </div>
          <div className="pl-6 text-xs text-muted-foreground space-y-1">
            {offerings.length === 0 ? (
              <p className="text-yellow-600">No offerings loaded - check RevenueCat dashboard</p>
            ) : (
              offerings.map((pkg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <StatusIcon ok={true} />
                  <span>{pkg.identifier}: {pkg.product?.priceString || 'N/A'}</span>
                </div>
              ))
            )}
            <div className="mt-2">
              <p>Monthly Package: {monthlyPackage ? '✓ Available' : '✗ Not found'}</p>
              <p>Annual Package: {annualPackage ? '✓ Available' : '✗ Not found'}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="border-t pt-2">
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="pl-6 text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-2 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Refresh
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRestore}
              disabled={isRestoring || !isNative}
            >
              {isRestoring ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Restore
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCheckCustomer}
              disabled={isCheckingCustomer || !isNative}
            >
              {isCheckingCustomer ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
              Check Customer
            </Button>
          </div>
          
          {isNative && isPurchaseAvailable && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handlePurchaseMonthly}
                disabled={isPurchasing || !monthlyPackage}
              >
                {isPurchasing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Buy Monthly
              </Button>
              <Button 
                size="sm" 
                onClick={handlePurchaseAnnual}
                disabled={isPurchasing || !annualPackage}
              >
                {isPurchasing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Buy Annual
              </Button>
            </div>
          )}
        </div>

        {/* Environment Info */}
        <div className="border-t pt-2 text-xs text-muted-foreground bg-blue-100 dark:bg-blue-900 p-2 rounded">
          <p className="font-bold text-blue-800 dark:text-blue-200">Environment Info:</p>
          <p>Mode: {import.meta.env.MODE}</p>
          <p>Platform: {platform}</p>
          <p>Is Native: {Capacitor.isNativePlatform() ? 'YES ✓' : 'NO ✗'}</p>
          <p>Apple Key: {import.meta.env.VITE_REVENUECAT_APPLE_API_KEY ? `SET: ${import.meta.env.VITE_REVENUECAT_APPLE_API_KEY.substring(0, 10)}...` : 'NOT SET ✗'}</p>
          <p className="font-bold">Google Key: {import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY ? `SET: ${import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY.substring(0, 10)}...` : 'NOT SET ✗'}</p>
        </div>

        {/* Live Debug Logs */}
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">Live Logs:</p>
          <div className="bg-black text-green-400 text-xs p-2 rounded font-mono max-h-32 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              debugLogs.map((log, i) => <p key={i}>{log}</p>)
            )}
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Troubleshooting:</p>
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
            <li>No customers in RevenueCat? Click "Check Customer" to see purchase status</li>
            <li>Products purchased but no entitlements? Configure "pro" entitlement in RevenueCat</li>
            <li>Customer ID shows as anonymous? Make sure user is logged in before purchase</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueCatDebug;
