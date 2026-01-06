import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Apple App Store Server Notifications V2 Webhook Handler
 * 
 * This endpoint receives real-time notifications from Apple about subscription events.
 * Configure this URL in App Store Connect under "App Store Server Notifications".
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

// Decode Apple's signed JWT payload (simplified - in production use proper JWT verification)
function decodeAppleJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    throw new Error("Failed to decode Apple JWT");
  }
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
  // Apple sends POST requests, but we handle OPTIONS for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the notification
    const body = await req.json();
    console.log("Received Apple notification");
    
    // Apple sends a signed JWT as signedPayload
    const signedPayload = body.signedPayload;
    if (!signedPayload) {
      console.error("No signedPayload in request");
      return new Response("Invalid payload", { status: 400 });
    }

    // Decode the payload (in production, verify signature with Apple's public key)
    const payload: AppleNotificationPayload = decodeAppleJWT(signedPayload);
    
    console.log(`Apple notification: ${payload.notificationType} (${payload.subtype || "no subtype"})`);

    // Decode transaction info
    const transactionInfo: DecodedTransactionInfo = decodeAppleJWT(payload.data.signedTransactionInfo);
    
    // Decode renewal info if present
    let renewalInfo: DecodedRenewalInfo | undefined;
    if (payload.data.signedRenewalInfo) {
      renewalInfo = decodeAppleJWT(payload.data.signedRenewalInfo);
    }

    const isSandbox = payload.data.environment === "Sandbox";

    // First, log the raw event for audit purposes
    const { error: eventError } = await supabase.from("subscription_events").insert({
      event_type: payload.notificationType,
      event_source: "apple_webhook",
      event_data: {
        subtype: payload.subtype,
        transactionId: transactionInfo.transactionId,
        originalTransactionId: transactionInfo.originalTransactionId,
        productId: transactionInfo.productId,
        environment: payload.data.environment,
      },
      notification_id: payload.notificationUUID,
      processed: false,
    });

    if (eventError) {
      console.error("Error logging event:", eventError);
      // Continue processing even if logging fails
    }

    // Find the subscription by original transaction ID
    const { data: subscription, error: findError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("apple_original_transaction_id", transactionInfo.originalTransactionId)
      .single();

    if (findError || !subscription) {
      console.log(`No subscription found for original_transaction_id: ${transactionInfo.originalTransactionId}`);
      // This could be a new subscription not yet in our system
      // Return 200 to acknowledge receipt - the app will validate when user opens it
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
    // Return 200 to prevent Apple from retrying (we'll investigate the error)
    return new Response(JSON.stringify({ 
      received: true, 
      processed: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});

