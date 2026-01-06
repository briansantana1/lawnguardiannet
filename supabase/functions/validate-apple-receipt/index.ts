import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Apple App Store endpoints
const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

// Apple App Store status codes
const APPLE_STATUS = {
  VALID: 0,
  SANDBOX_RECEIPT_ON_PRODUCTION: 21007,
  PRODUCTION_RECEIPT_ON_SANDBOX: 21008,
};

interface AppleReceiptRequest {
  receiptData: string;
  productId: string;
  transactionId?: string;
}

interface AppleVerifyResponse {
  status: number;
  environment?: string;
  receipt?: {
    bundle_id: string;
    application_version: string;
    in_app: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
      is_trial_period?: string;
      is_in_intro_offer_period?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
    is_trial_period?: string;
    is_in_intro_offer_period?: string;
    cancellation_date_ms?: string;
  }>;
  pending_renewal_info?: Array<{
    product_id: string;
    auto_renew_product_id: string;
    auto_renew_status: string;
    expiration_intent?: string;
    is_in_billing_retry_period?: string;
    grace_period_expires_date_ms?: string;
  }>;
}

async function verifyWithApple(
  receiptData: string, 
  sharedSecret: string,
  useSandbox: boolean = false
): Promise<AppleVerifyResponse> {
  const url = useSandbox ? APPLE_SANDBOX_URL : APPLE_PRODUCTION_URL;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      "password": sharedSecret,
      "exclude-old-transactions": true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple verification failed: ${response.status}`);
  }

  return response.json();
}

function determineSubscriptionStatus(
  latestReceipt: AppleVerifyResponse["latest_receipt_info"][0],
  renewalInfo?: AppleVerifyResponse["pending_renewal_info"][0]
): string {
  const now = Date.now();
  const expiresDate = parseInt(latestReceipt.expires_date_ms || "0");
  
  // Check for cancellation
  if (latestReceipt.cancellation_date_ms) {
    return "canceled";
  }
  
  // Check if expired
  if (expiresDate < now) {
    // Check for billing retry
    if (renewalInfo?.is_in_billing_retry_period === "1") {
      return "billing_retry";
    }
    // Check for grace period
    if (renewalInfo?.grace_period_expires_date_ms) {
      const gracePeriodEnd = parseInt(renewalInfo.grace_period_expires_date_ms);
      if (gracePeriodEnd > now) {
        return "grace_period";
      }
    }
    return "expired";
  }
  
  // Check for trial
  if (latestReceipt.is_trial_period === "true") {
    return "trialing";
  }
  
  // Check auto-renew status
  if (renewalInfo?.auto_renew_status === "0") {
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
    const appleSharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    
    if (!appleSharedSecret) {
      console.error("APPLE_SHARED_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Apple receipt validation not configured" }),
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
    const { receiptData, productId, transactionId }: AppleReceiptRequest = await req.json();
    
    if (!receiptData) {
      return new Response(
        JSON.stringify({ error: "Receipt data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Validating Apple receipt for user ${user.id}, product: ${productId}`);

    // Verify with Apple (try production first, fallback to sandbox)
    let verifyResponse = await verifyWithApple(receiptData, appleSharedSecret, false);
    let isSandbox = false;
    
    if (verifyResponse.status === APPLE_STATUS.SANDBOX_RECEIPT_ON_PRODUCTION) {
      console.log("Production returned sandbox error, retrying with sandbox");
      verifyResponse = await verifyWithApple(receiptData, appleSharedSecret, true);
      isSandbox = true;
    }

    if (verifyResponse.status !== APPLE_STATUS.VALID) {
      console.error(`Apple verification failed with status: ${verifyResponse.status}`);
      
      // Log failed receipt
      await supabase.from("subscription_receipts").insert({
        user_id: user.id,
        platform: "ios",
        transaction_id: transactionId || `failed_${Date.now()}`,
        product_id: productId || "unknown",
        receipt_data: receiptData.substring(0, 100) + "...", // Truncate for storage
        verification_status: "failed",
        verification_error: `Apple status: ${verifyResponse.status}`,
        purchase_date: new Date().toISOString(),
        is_sandbox: isSandbox,
        raw_response: verifyResponse,
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Receipt validation failed",
          appleStatus: verifyResponse.status
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the latest receipt info
    const latestReceipts = verifyResponse.latest_receipt_info || verifyResponse.receipt?.in_app || [];
    const latestReceipt = latestReceipts
      .filter(r => r.product_id === productId || !productId)
      .sort((a, b) => parseInt(b.purchase_date_ms) - parseInt(a.purchase_date_ms))[0];

    if (!latestReceipt) {
      return new Response(
        JSON.stringify({ error: "No matching subscription found in receipt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get renewal info if available
    const renewalInfo = verifyResponse.pending_renewal_info?.find(
      r => r.product_id === latestReceipt.product_id
    );

    // Determine subscription status
    const status = determineSubscriptionStatus(latestReceipt, renewalInfo);
    
    // Map product ID to plan
    const planMap: Record<string, string> = {
      "com.lawnguardian.pro.monthly": "pro_monthly",
      "com.lawnguardian.pro.annual": "pro_annual",
    };
    const planId = planMap[latestReceipt.product_id] || "pro_monthly";
    const billingPeriod = latestReceipt.product_id.includes("annual") ? "annual" : "monthly";

    // Calculate dates
    const purchaseDate = new Date(parseInt(latestReceipt.purchase_date_ms));
    const expiresDate = latestReceipt.expires_date_ms 
      ? new Date(parseInt(latestReceipt.expires_date_ms))
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Store receipt
    const receiptHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(receiptData)
    ).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join(""));

    const { data: receipt, error: receiptError } = await supabase
      .from("subscription_receipts")
      .upsert({
        user_id: user.id,
        platform: "ios",
        transaction_id: latestReceipt.transaction_id,
        original_transaction_id: latestReceipt.original_transaction_id,
        product_id: latestReceipt.product_id,
        receipt_hash: receiptHash,
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        purchase_date: purchaseDate.toISOString(),
        expires_date: expiresDate.toISOString(),
        is_trial: latestReceipt.is_trial_period === "true",
        is_intro_offer: latestReceipt.is_in_intro_offer_period === "true",
        is_sandbox: isSandbox,
        raw_response: verifyResponse,
      }, { onConflict: "platform,transaction_id" })
      .select()
      .single();

    if (receiptError) {
      console.error("Error storing receipt:", receiptError);
    }

    // Upsert subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: planId,
        platform: "ios",
        apple_original_transaction_id: latestReceipt.original_transaction_id,
        status: status,
        billing_period: billingPeriod,
        started_at: purchaseDate.toISOString(),
        current_period_start: purchaseDate.toISOString(),
        current_period_end: expiresDate.toISOString(),
        trial_start: latestReceipt.is_trial_period === "true" ? purchaseDate.toISOString() : null,
        trial_end: latestReceipt.is_trial_period === "true" ? expiresDate.toISOString() : null,
        auto_renew_enabled: renewalInfo?.auto_renew_status === "1",
        is_sandbox: isSandbox,
        raw_receipt: verifyResponse,
      }, { 
        onConflict: "apple_original_transaction_id",
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
      subscription_id: subscription?.id,
      user_id: user.id,
      event_type: "receipt_validated",
      event_source: "manual",
      event_data: {
        product_id: latestReceipt.product_id,
        transaction_id: latestReceipt.transaction_id,
        status: status,
        is_sandbox: isSandbox,
      },
      processed: true,
      processed_at: new Date().toISOString(),
    });

    console.log(`Successfully validated subscription for user ${user.id}: ${status}`);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          status: status,
          planId: planId,
          billingPeriod: billingPeriod,
          expiresAt: expiresDate.toISOString(),
          isTrial: latestReceipt.is_trial_period === "true",
          autoRenewEnabled: renewalInfo?.auto_renew_status === "1",
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

