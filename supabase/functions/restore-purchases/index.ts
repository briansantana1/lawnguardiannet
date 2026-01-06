import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Restore Purchases
 * 
 * Restores all purchases for a user from their app store receipts.
 * Required by Apple App Store and Google Play Store guidelines.
 * 
 * The client should:
 * 1. Request all purchase receipts from StoreKit (iOS) or BillingClient (Android)
 * 2. Send them to this endpoint for verification
 * 3. Receive back the restored subscription status
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Apple endpoints
const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

interface RestoreRequest {
  platform: "ios" | "android";
  receipts: Array<{
    receiptData?: string; // iOS
    purchaseToken?: string; // Android
    productId: string;
  }>;
}

interface RestoredPurchase {
  productId: string;
  transactionId: string;
  expiresAt: string;
  isActive: boolean;
  status: string;
}

async function verifyAppleReceipt(
  receiptData: string, 
  sharedSecret: string
): Promise<any> {
  // Try production first
  let response = await fetch(APPLE_PRODUCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      "password": sharedSecret,
      "exclude-old-transactions": false, // Get all transactions for restore
    }),
  });

  let result = await response.json();
  
  // If sandbox receipt on production, retry with sandbox
  if (result.status === 21007) {
    response = await fetch(APPLE_SANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "receipt-data": receiptData,
        "password": sharedSecret,
        "exclude-old-transactions": false,
      }),
    });
    result = await response.json();
  }

  return result;
}

async function getGoogleAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify(claim));
  
  const pemContents = credentials.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureInput = encoder.encode(`${header}.${payload}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, signatureInput);
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const jwt = `${header}.${payload}.${signatureBase64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const { access_token } = await tokenResponse.json();
  return access_token;
}

async function verifyGooglePurchase(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string,
  accessToken: string
): Promise<any> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appleSharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    const googleCredentialsJson = Deno.env.get("GOOGLE_PLAY_CREDENTIALS");
    const googlePackageName = Deno.env.get("GOOGLE_PLAY_PACKAGE_NAME") || "com.lawnguardian.app";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Authenticate user
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform, receipts }: RestoreRequest = await req.json();

    if (!receipts || receipts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No receipts provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Restoring ${receipts.length} purchases for user ${user.id} on ${platform}`);

    const restoredPurchases: RestoredPurchase[] = [];
    let latestSubscription: any = null;

    if (platform === "ios") {
      if (!appleSharedSecret) {
        return new Response(
          JSON.stringify({ error: "Apple receipt validation not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // For iOS, typically one receipt contains all transactions
      for (const receipt of receipts) {
        if (!receipt.receiptData) continue;

        const verifyResult = await verifyAppleReceipt(receipt.receiptData, appleSharedSecret);
        
        if (verifyResult.status !== 0) {
          console.log(`Apple verification failed with status: ${verifyResult.status}`);
          continue;
        }

        const allTransactions = verifyResult.latest_receipt_info || verifyResult.receipt?.in_app || [];
        
        // Process all subscription transactions
        for (const transaction of allTransactions) {
          const expiresDate = transaction.expires_date_ms 
            ? new Date(parseInt(transaction.expires_date_ms))
            : null;
          
          const isActive = expiresDate && expiresDate > new Date();
          
          restoredPurchases.push({
            productId: transaction.product_id,
            transactionId: transaction.original_transaction_id,
            expiresAt: expiresDate?.toISOString() || "",
            isActive: isActive || false,
            status: isActive ? "active" : "expired",
          });

          // Track the latest active subscription
          if (isActive && (!latestSubscription || expiresDate > new Date(latestSubscription.expiresAt))) {
            latestSubscription = {
              productId: transaction.product_id,
              originalTransactionId: transaction.original_transaction_id,
              expiresAt: expiresDate.toISOString(),
              isTrial: transaction.is_trial_period === "true",
              isSandbox: verifyResult.environment === "Sandbox",
              rawReceipt: verifyResult,
            };
          }
        }
      }
    } else if (platform === "android") {
      if (!googleCredentialsJson) {
        return new Response(
          JSON.stringify({ error: "Google Play validation not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const credentials = JSON.parse(googleCredentialsJson);
      const accessToken = await getGoogleAccessToken(credentials);

      for (const receipt of receipts) {
        if (!receipt.purchaseToken) continue;

        const subscription = await verifyGooglePurchase(
          googlePackageName,
          receipt.productId,
          receipt.purchaseToken,
          accessToken
        );

        if (!subscription) continue;

        const expiresDate = new Date(parseInt(subscription.expiryTimeMillis));
        const isActive = expiresDate > new Date() && !subscription.cancelReason;

        restoredPurchases.push({
          productId: receipt.productId,
          transactionId: receipt.purchaseToken.substring(0, 50),
          expiresAt: expiresDate.toISOString(),
          isActive: isActive,
          status: isActive ? "active" : (subscription.cancelReason ? "canceled" : "expired"),
        });

        if (isActive && (!latestSubscription || expiresDate > new Date(latestSubscription.expiresAt))) {
          latestSubscription = {
            productId: receipt.productId,
            purchaseToken: receipt.purchaseToken,
            expiresAt: expiresDate.toISOString(),
            isTrial: subscription.paymentState === 2,
            autoRenewing: subscription.autoRenewing,
            rawReceipt: subscription,
          };
        }
      }
    }

    // If we found an active subscription, upsert it
    if (latestSubscription) {
      const planMap: Record<string, string> = {
        "com.lawnguardian.pro.monthly": "pro_monthly",
        "com.lawnguardian.pro.annual": "pro_annual",
        "pro_monthly": "pro_monthly",
        "pro_annual": "pro_annual",
      };
      
      const planId = planMap[latestSubscription.productId] || "pro_monthly";
      const billingPeriod = latestSubscription.productId.includes("annual") ? "annual" : "monthly";

      const upsertData: any = {
        user_id: user.id,
        plan_id: planId,
        platform: platform,
        status: "active",
        billing_period: billingPeriod,
        current_period_end: latestSubscription.expiresAt,
        auto_renew_enabled: latestSubscription.autoRenewing ?? true,
        is_sandbox: latestSubscription.isSandbox ?? false,
        raw_receipt: latestSubscription.rawReceipt,
      };

      if (platform === "ios") {
        upsertData.apple_original_transaction_id = latestSubscription.originalTransactionId;
      } else {
        upsertData.google_purchase_token = latestSubscription.purchaseToken;
      }

      await supabase.from("user_subscriptions").upsert(upsertData, {
        onConflict: platform === "ios" ? "apple_original_transaction_id" : "google_purchase_token",
      });

      // Log the restore event
      await supabase.from("subscription_events").insert({
        user_id: user.id,
        event_type: "purchases_restored",
        event_source: "user_action",
        event_data: {
          platform,
          restoredCount: restoredPurchases.length,
          activeCount: restoredPurchases.filter(p => p.isActive).length,
        },
        processed: true,
        processed_at: new Date().toISOString(),
      });
    }

    console.log(`Restored ${restoredPurchases.length} purchases, ${restoredPurchases.filter(p => p.isActive).length} active`);

    return new Response(
      JSON.stringify({
        success: true,
        restoredPurchases,
        hasActiveSubscription: !!latestSubscription,
        activeSubscription: latestSubscription ? {
          productId: latestSubscription.productId,
          expiresAt: latestSubscription.expiresAt,
          isTrial: latestSubscription.isTrial,
        } : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error restoring purchases:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

