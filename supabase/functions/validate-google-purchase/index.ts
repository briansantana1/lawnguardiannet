import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GooglePurchaseRequest {
  purchaseToken: string;
  productId: string;
  packageName?: string;
}

interface GoogleSubscription {
  kind: string;
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: string;
  countryCode: string;
  paymentState?: number;
  cancelReason?: number;
  userCancellationTimeMillis?: string;
  acknowledgementState: number;
  linkedPurchaseToken?: string;
}

// Payment states
const PAYMENT_STATE = {
  PENDING: 0,
  RECEIVED: 1,
  FREE_TRIAL: 2,
  PENDING_DEFERRED: 3,
};

// Cancel reasons
const CANCEL_REASON = {
  USER_CANCELED: 0,
  SYSTEM_CANCELED: 1,
  REPLACED: 2,
  DEVELOPER_CANCELED: 3,
};

async function getGoogleAccessToken(credentials: any): Promise<string> {
  // Create JWT for Google OAuth
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  // Sign JWT with RS256
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify(claim));
  
  // Import private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = credentials.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
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
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${header}.${payload}.${signatureBase64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get Google access token: ${error}`);
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

async function verifyGoogleSubscription(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string,
  accessToken: string
): Promise<GoogleSubscription> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google verification failed: ${error}`);
  }

  return response.json();
}

function determineSubscriptionStatus(subscription: GoogleSubscription): string {
  const now = Date.now();
  const expiryTime = parseInt(subscription.expiryTimeMillis);
  
  // Check if canceled
  if (subscription.cancelReason !== undefined) {
    if (expiryTime > now) {
      return "canceled"; // Canceled but still active until expiry
    }
    return "expired";
  }
  
  // Check payment state
  if (subscription.paymentState === PAYMENT_STATE.PENDING) {
    return "past_due";
  }
  
  if (subscription.paymentState === PAYMENT_STATE.FREE_TRIAL) {
    return "trialing";
  }
  
  // Check if expired
  if (expiryTime < now) {
    return "expired";
  }
  
  // Check auto-renewal
  if (!subscription.autoRenewing) {
    return "canceled"; // Will expire at end of period
  }
  
  return "active";
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

    // Environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleCredentialsJson = Deno.env.get("GOOGLE_PLAY_CREDENTIALS");
    const defaultPackageName = Deno.env.get("GOOGLE_PLAY_PACKAGE_NAME") || "com.lawnguardian.app";
    
    if (!googleCredentialsJson) {
      console.error("GOOGLE_PLAY_CREDENTIALS not configured");
      return new Response(
        JSON.stringify({ error: "Google Play validation not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { purchaseToken, productId, packageName }: GooglePurchaseRequest = await req.json();
    
    if (!purchaseToken || !productId) {
      return new Response(
        JSON.stringify({ error: "Purchase token and product ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Validating Google purchase for user ${user.id}, product: ${productId}`);

    // Parse Google credentials
    const googleCredentials = JSON.parse(googleCredentialsJson);
    
    // Get access token
    const accessToken = await getGoogleAccessToken(googleCredentials);
    
    // Verify with Google
    const subscription = await verifyGoogleSubscription(
      packageName || defaultPackageName,
      productId,
      purchaseToken,
      accessToken
    );

    // Determine status
    const status = determineSubscriptionStatus(subscription);
    
    // Map product ID to plan
    const planMap: Record<string, string> = {
      "pro_monthly": "pro_monthly",
      "pro_annual": "pro_annual",
    };
    const planId = planMap[productId] || "pro_monthly";
    const billingPeriod = productId.includes("annual") ? "annual" : "monthly";

    // Calculate dates
    const startDate = new Date(parseInt(subscription.startTimeMillis));
    const expiryDate = new Date(parseInt(subscription.expiryTimeMillis));
    const price = parseInt(subscription.priceAmountMicros) / 1000000;

    // Store receipt
    const { data: receipt, error: receiptError } = await supabase
      .from("subscription_receipts")
      .upsert({
        user_id: user.id,
        platform: "android",
        transaction_id: purchaseToken.substring(0, 100), // Truncate for unique constraint
        original_transaction_id: subscription.linkedPurchaseToken || purchaseToken.substring(0, 100),
        product_id: productId,
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        purchase_date: startDate.toISOString(),
        expires_date: expiryDate.toISOString(),
        is_trial: subscription.paymentState === PAYMENT_STATE.FREE_TRIAL,
        price: price,
        currency: subscription.priceCurrencyCode,
        is_sandbox: false, // Google doesn't distinguish sandbox in API response
        raw_response: subscription,
      }, { onConflict: "platform,transaction_id" })
      .select()
      .single();

    if (receiptError) {
      console.error("Error storing receipt:", receiptError);
    }

    // Upsert subscription
    const { data: sub, error: subError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: planId,
        platform: "android",
        google_purchase_token: purchaseToken,
        status: status,
        billing_period: billingPeriod,
        price_paid: price,
        currency: subscription.priceCurrencyCode,
        started_at: startDate.toISOString(),
        current_period_start: startDate.toISOString(),
        current_period_end: expiryDate.toISOString(),
        trial_start: subscription.paymentState === PAYMENT_STATE.FREE_TRIAL ? startDate.toISOString() : null,
        trial_end: subscription.paymentState === PAYMENT_STATE.FREE_TRIAL ? expiryDate.toISOString() : null,
        canceled_at: subscription.userCancellationTimeMillis 
          ? new Date(parseInt(subscription.userCancellationTimeMillis)).toISOString() 
          : null,
        auto_renew_enabled: subscription.autoRenewing,
        is_sandbox: false,
        raw_receipt: subscription,
      }, { 
        onConflict: "google_purchase_token",
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (subError) {
      console.error("Error upserting subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log event
    await supabase.from("subscription_events").insert({
      subscription_id: sub?.id,
      user_id: user.id,
      event_type: "receipt_validated",
      event_source: "manual",
      event_data: {
        product_id: productId,
        purchase_token: purchaseToken.substring(0, 20) + "...",
        status: status,
      },
      processed: true,
      processed_at: new Date().toISOString(),
    });

    console.log(`Successfully validated Google subscription for user ${user.id}: ${status}`);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: sub.id,
          status: status,
          planId: planId,
          billingPeriod: billingPeriod,
          expiresAt: expiryDate.toISOString(),
          isTrial: subscription.paymentState === PAYMENT_STATE.FREE_TRIAL,
          autoRenewEnabled: subscription.autoRenewing,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

