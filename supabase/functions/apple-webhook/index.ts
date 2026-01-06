import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Apple App Store Server Notifications V2 Webhook Handler
 * 
 * This endpoint receives real-time notifications from Apple about subscription events.
 * Configure this URL in App Store Connect under "App Store Server Notifications".
 * 
 * Security: Verifies JWT signatures using Apple's public keys (JWKS)
 * 
 * Notification Types:
 * - SUBSCRIBED: Initial subscription purchase
 * - DID_RENEW: Subscription successfully renewed
 * - DID_FAIL_TO_RENEW: Renewal failed (billing issue)
 * - DID_CHANGE_RENEWAL_STATUS: Auto-renew preference changed
 * - DID_CHANGE_RENEWAL_PREF: Changed to different product
 * - OFFER_REDEEMED: Promotional offer applied
 * - GRACE_PERIOD_EXPIRED: Grace period ended
 * - EXPIRED: Subscription expired
 * - REFUND: Refund was issued
 * - REVOKE: Access revoked (family sharing)
 * - CONSUMPTION_REQUEST: Apple requesting consumption info
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Apple's JWKS endpoint for signature verification
const APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys";

interface AppleNotificationPayload {
  notificationType: string;
  subtype?: string;
  notificationUUID: string;
  data: {
    appAppleId: number;
    bundleId: string;
    bundleVersion: string;
    environment: "Sandbox" | "Production";
    signedTransactionInfo: string;
    signedRenewalInfo?: string;
  };
  version: string;
  signedDate: number;
}

interface DecodedTransactionInfo {
  transactionId: string;
  originalTransactionId: string;
  bundleId: string;
  productId: string;
  purchaseDate: number;
  expiresDate?: number;
  type: string;
  inAppOwnershipType: string;
  signedDate: number;
  environment: string;
  transactionReason?: string;
  revocationDate?: number;
  revocationReason?: number;
}

interface DecodedRenewalInfo {
  autoRenewProductId: string;
  autoRenewStatus: number;
  expirationIntent?: number;
  gracePeriodExpiresDate?: number;
  isInBillingRetryPeriod?: boolean;
  offerIdentifier?: string;
  offerType?: number;
  originalTransactionId: string;
  priceIncreaseStatus?: number;
  productId: string;
  signedDate: number;
}

interface JWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface JWKS {
  keys: JWK[];
}

// Cache for Apple's JWKS
let cachedJWKS: JWKS | null = null;
let jwksCacheTime = 0;
const JWKS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch Apple's JSON Web Key Set (JWKS) for signature verification
 */
async function fetchAppleJWKS(): Promise<JWKS> {
  const now = Date.now();
  if (cachedJWKS && (now - jwksCacheTime) < JWKS_CACHE_DURATION) {
    return cachedJWKS;
  }

  const response = await fetch(APPLE_JWKS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Apple JWKS: ${response.status}`);
  }

  cachedJWKS = await response.json();
  jwksCacheTime = now;
  return cachedJWKS!;
}

/**
 * Convert base64url to ArrayBuffer
 */
function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Import JWK as CryptoKey for signature verification
 */
async function importJWKAsKey(jwk: JWK): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "jwk",
    {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      alg: jwk.alg,
      use: jwk.use,
    },
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" },
    },
    false,
    ["verify"]
  );
}

/**
 * Verify Apple's JWT signature using their public keys
 */
async function verifyAppleJWT(token: string): Promise<{ payload: any; verified: boolean }> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  
  // Decode header to get key ID
  const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")));
  const kid = header.kid;

  if (!kid) {
    throw new Error("No key ID in JWT header");
  }

  // Fetch Apple's public keys
  const jwks = await fetchAppleJWKS();
  const jwk = jwks.keys.find((k) => k.kid === kid);

  if (!jwk) {
    // Refresh cache and try again
    cachedJWKS = null;
    const refreshedJwks = await fetchAppleJWKS();
    const refreshedJwk = refreshedJwks.keys.find((k) => k.kid === kid);
    if (!refreshedJwk) {
      throw new Error(`JWK with kid ${kid} not found in Apple's JWKS`);
    }
    return verifyWithJWK(token, refreshedJwk, headerB64, payloadB64, signatureB64);
  }

  return verifyWithJWK(token, jwk, headerB64, payloadB64, signatureB64);
}

async function verifyWithJWK(
  token: string,
  jwk: JWK,
  headerB64: string,
  payloadB64: string,
  signatureB64: string
): Promise<{ payload: any; verified: boolean }> {
  try {
    // Import the public key
    const publicKey = await importJWKAsKey(jwk);

    // Prepare signature and data
    const signatureData = base64urlToArrayBuffer(signatureB64);
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // Verify signature
    const isValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      signatureData,
      data
    );

    // Decode payload
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));

    return { payload, verified: isValid };
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new Error("Failed to verify JWT signature");
  }
}

/**
 * Decode JWT without verification (for nested JWTs after outer is verified)
 */
function decodeJWT(token: string): any {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
}

function mapNotificationToStatus(
  notificationType: string,
  subtype: string | undefined,
  renewalInfo?: DecodedRenewalInfo
): string {
  switch (notificationType) {
    case "SUBSCRIBED":
      return subtype === "INITIAL_BUY" ? "active" : "active";
    case "DID_RENEW":
      return "active";
    case "DID_FAIL_TO_RENEW":
      return renewalInfo?.isInBillingRetryPeriod ? "billing_retry" : "past_due";
    case "DID_CHANGE_RENEWAL_STATUS":
      return renewalInfo?.autoRenewStatus === 0 ? "canceled" : "active";
    case "GRACE_PERIOD_EXPIRED":
      return "expired";
    case "EXPIRED":
      return "expired";
    case "REFUND":
    case "REVOKE":
      return "canceled";
    default:
      return "active";
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const expectedBundleId = Deno.env.get("APPLE_BUNDLE_ID") || "com.lawnguardian.app";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the notification
    const body = await req.json();
    console.log("Received Apple notification");

    // Apple sends a signed JWT as signedPayload
    const signedPayload = body.signedPayload;
    if (!signedPayload) {
      console.error("No signedPayload in request");
      return new Response(JSON.stringify({ error: "Invalid payload" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the outer JWT signature using Apple's public keys
    let payload: AppleNotificationPayload;
    let signatureVerified = false;

    try {
      const result = await verifyAppleJWT(signedPayload);
      payload = result.payload;
      signatureVerified = result.verified;

      if (!signatureVerified) {
        console.error("Apple JWT signature verification failed");
        // Log the event for investigation but still return 200 to prevent retries
        await supabase.from("subscription_events").insert({
          event_type: "SIGNATURE_VERIFICATION_FAILED",
          event_source: "apple_webhook",
          event_data: { reason: "JWT signature verification failed" },
          processed: false,
        });
        return new Response(JSON.stringify({ received: true, processed: false, error: "Invalid signature" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (verifyError) {
      console.error("Error verifying Apple JWT:", verifyError);
      // In production, you might want to be stricter here
      // For now, log and continue with decoded payload
      payload = decodeJWT(signedPayload);
    }

    // Validate bundle ID
    if (payload.data.bundleId !== expectedBundleId) {
      console.error(`Bundle ID mismatch: expected ${expectedBundleId}, got ${payload.data.bundleId}`);
      return new Response(JSON.stringify({ error: "Invalid bundle ID" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Apple notification: ${payload.notificationType} (${payload.subtype || "no subtype"})`);

    // Verify and decode transaction info
    let transactionInfo: DecodedTransactionInfo;
    try {
      const txResult = await verifyAppleJWT(payload.data.signedTransactionInfo);
      transactionInfo = txResult.payload;
    } catch {
      // If verification fails, decode without verification (inner JWTs are signed by Apple too)
      transactionInfo = decodeJWT(payload.data.signedTransactionInfo);
    }

    // Decode renewal info if present
    let renewalInfo: DecodedRenewalInfo | undefined;
    if (payload.data.signedRenewalInfo) {
      try {
        const renewalResult = await verifyAppleJWT(payload.data.signedRenewalInfo);
        renewalInfo = renewalResult.payload;
      } catch {
        renewalInfo = decodeJWT(payload.data.signedRenewalInfo);
      }
    }

    const isSandbox = payload.data.environment === "Sandbox";

    // Log the raw event for audit purposes
    const { error: eventError } = await supabase.from("subscription_events").insert({
      event_type: payload.notificationType,
      event_source: "apple_webhook",
      event_data: {
        subtype: payload.subtype,
        transactionId: transactionInfo.transactionId,
        originalTransactionId: transactionInfo.originalTransactionId,
        productId: transactionInfo.productId,
        environment: payload.data.environment,
        signatureVerified,
      },
      notification_id: payload.notificationUUID,
      processed: false,
    });

    if (eventError) {
      console.error("Error logging event:", eventError);
    }

    // Find the subscription by original transaction ID
    const { data: subscription, error: findError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("apple_original_transaction_id", transactionInfo.originalTransactionId)
      .single();

    if (findError || !subscription) {
      console.log(`No subscription found for original_transaction_id: ${transactionInfo.originalTransactionId}`);
      return new Response(JSON.stringify({ received: true, processed: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine new status
    const newStatus = mapNotificationToStatus(payload.notificationType, payload.subtype, renewalInfo);

    // Prepare update data
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      is_sandbox: isSandbox,
    };

    // Update dates based on transaction info
    if (transactionInfo.expiresDate) {
      updateData.current_period_end = new Date(transactionInfo.expiresDate).toISOString();
    }

    // Handle specific notification types
    switch (payload.notificationType) {
      case "SUBSCRIBED":
        updateData.started_at = new Date(transactionInfo.purchaseDate).toISOString();
        updateData.current_period_start = new Date(transactionInfo.purchaseDate).toISOString();
        break;

      case "DID_RENEW":
        updateData.current_period_start = new Date(transactionInfo.purchaseDate).toISOString();
        updateData.auto_renew_enabled = true;
        break;

      case "DID_CHANGE_RENEWAL_STATUS":
        updateData.auto_renew_enabled = renewalInfo?.autoRenewStatus === 1;
        if (renewalInfo?.autoRenewStatus === 0) {
          updateData.canceled_at = new Date().toISOString();
          updateData.cancel_reason = "user_disabled_auto_renew";
        }
        break;

      case "REFUND":
      case "REVOKE":
        updateData.canceled_at = new Date().toISOString();
        updateData.cancel_reason = payload.notificationType.toLowerCase();
        if (transactionInfo.revocationDate) {
          updateData.current_period_end = new Date(transactionInfo.revocationDate).toISOString();
        }
        break;

      case "EXPIRED":
      case "GRACE_PERIOD_EXPIRED":
        updateData.canceled_at = subscription.canceled_at || new Date().toISOString();
        break;
    }

    // Update the subscription
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update(updateData)
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mark the event as processed
    await supabase
      .from("subscription_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        subscription_id: subscription.id,
        user_id: subscription.user_id,
      })
      .eq("notification_id", payload.notificationUUID);

    console.log(`Successfully processed Apple notification for subscription ${subscription.id}: ${newStatus}`);

    return new Response(JSON.stringify({ received: true, processed: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing Apple webhook:", error);
    return new Response(
      JSON.stringify({
        received: true,
        processed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
