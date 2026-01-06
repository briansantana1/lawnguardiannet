import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Google Play Real-time Developer Notifications (RTDN) Webhook Handler
 * 
 * This endpoint receives notifications from Google Play via Cloud Pub/Sub.
 * Configure this URL as an HTTPS push endpoint for your Pub/Sub subscription.
 * 
 * Notification Types for Subscriptions:
 * 1 - SUBSCRIPTION_RECOVERED: Recovered from account hold
 * 2 - SUBSCRIPTION_RENEWED: Successfully renewed
 * 3 - SUBSCRIPTION_CANCELED: Canceled by user
 * 4 - SUBSCRIPTION_PURCHASED: New subscription purchase
 * 5 - SUBSCRIPTION_ON_HOLD: Account hold started
 * 6 - SUBSCRIPTION_IN_GRACE_PERIOD: Grace period started
 * 7 - SUBSCRIPTION_RESTARTED: Restarted after cancellation
 * 8 - SUBSCRIPTION_PRICE_CHANGE_CONFIRMED: User confirmed price change
 * 9 - SUBSCRIPTION_DEFERRED: Deferred billing
 * 10 - SUBSCRIPTION_PAUSED: Subscription paused
 * 11 - SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED: Pause schedule changed
 * 12 - SUBSCRIPTION_REVOKED: Subscription revoked
 * 13 - SUBSCRIPTION_EXPIRED: Subscription expired
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GooglePubSubMessage {
  message: {
    data: string; // Base64 encoded
    messageId: string;
    publishTime: string;
    attributes?: Record<string, string>;
  };
  subscription: string;
}

interface GoogleDeveloperNotification {
  version: string;
  packageName: string;
  eventTimeMillis: string;
  subscriptionNotification?: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    subscriptionId: string;
  };
  oneTimeProductNotification?: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    sku: string;
  };
  testNotification?: {
    version: string;
  };
}

// Notification type mappings
const SUBSCRIPTION_NOTIFICATION_TYPE: Record<number, string> = {
  1: "SUBSCRIPTION_RECOVERED",
  2: "SUBSCRIPTION_RENEWED",
  3: "SUBSCRIPTION_CANCELED",
  4: "SUBSCRIPTION_PURCHASED",
  5: "SUBSCRIPTION_ON_HOLD",
  6: "SUBSCRIPTION_IN_GRACE_PERIOD",
  7: "SUBSCRIPTION_RESTARTED",
  8: "SUBSCRIPTION_PRICE_CHANGE_CONFIRMED",
  9: "SUBSCRIPTION_DEFERRED",
  10: "SUBSCRIPTION_PAUSED",
  11: "SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED",
  12: "SUBSCRIPTION_REVOKED",
  13: "SUBSCRIPTION_EXPIRED",
};

function mapNotificationToStatus(notificationType: number): string {
  switch (notificationType) {
    case 1: // RECOVERED
    case 2: // RENEWED
    case 4: // PURCHASED
    case 7: // RESTARTED
      return "active";
    case 3: // CANCELED
      return "canceled";
    case 5: // ON_HOLD
      return "past_due";
    case 6: // GRACE_PERIOD
      return "grace_period";
    case 10: // PAUSED
      return "paused";
    case 12: // REVOKED
    case 13: // EXPIRED
      return "expired";
    default:
      return "active";
  }
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

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get Google access token`);
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

async function fetchSubscriptionDetails(
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
    console.error("Failed to fetch subscription details:", await response.text());
    return null;
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleCredentialsJson = Deno.env.get("GOOGLE_PLAY_CREDENTIALS");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the Pub/Sub message
    const pubsubMessage: GooglePubSubMessage = await req.json();
    console.log("Received Google Pub/Sub message:", pubsubMessage.message.messageId);

    // Decode the notification data
    const notificationData = atob(pubsubMessage.message.data);
    const notification: GoogleDeveloperNotification = JSON.parse(notificationData);

    // Handle test notifications
    if (notification.testNotification) {
      console.log("Received test notification from Google");
      return new Response(JSON.stringify({ received: true, test: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // We only handle subscription notifications for now
    if (!notification.subscriptionNotification) {
      console.log("Received non-subscription notification, ignoring");
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subNotification = notification.subscriptionNotification;
    const notificationTypeName = SUBSCRIPTION_NOTIFICATION_TYPE[subNotification.notificationType] || "UNKNOWN";
    
    console.log(`Google notification: ${notificationTypeName} (${subNotification.notificationType})`);

    // Log the raw event
    const { error: eventError } = await supabase.from("subscription_events").insert({
      event_type: notificationTypeName,
      event_source: "google_webhook",
      event_data: {
        notificationType: subNotification.notificationType,
        subscriptionId: subNotification.subscriptionId,
        purchaseToken: subNotification.purchaseToken.substring(0, 50) + "...",
        packageName: notification.packageName,
        eventTime: notification.eventTimeMillis,
      },
      notification_id: pubsubMessage.message.messageId,
      processed: false,
    });

    if (eventError) {
      console.error("Error logging event:", eventError);
    }

    // Find the subscription by purchase token
    const { data: subscription, error: findError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("google_purchase_token", subNotification.purchaseToken)
      .single();

    if (findError || !subscription) {
      console.log(`No subscription found for purchase_token: ${subNotification.purchaseToken.substring(0, 20)}...`);
      // Return 200 to acknowledge - the app will handle when user opens it
      return new Response(JSON.stringify({ received: true, processed: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine new status
    const newStatus = mapNotificationToStatus(subNotification.notificationType);

    // Prepare update data
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Fetch full subscription details from Google if we have credentials
    if (googleCredentialsJson) {
      try {
        const credentials = JSON.parse(googleCredentialsJson);
        const accessToken = await getGoogleAccessToken(credentials);
        const details = await fetchSubscriptionDetails(
          notification.packageName,
          subNotification.subscriptionId,
          subNotification.purchaseToken,
          accessToken
        );

        if (details) {
          updateData.current_period_end = new Date(parseInt(details.expiryTimeMillis)).toISOString();
          updateData.auto_renew_enabled = details.autoRenewing;
          
          if (details.userCancellationTimeMillis) {
            updateData.canceled_at = new Date(parseInt(details.userCancellationTimeMillis)).toISOString();
          }
        }
      } catch (err) {
        console.error("Error fetching subscription details:", err);
        // Continue with basic update
      }
    }

    // Handle specific notification types
    switch (subNotification.notificationType) {
      case 3: // CANCELED
        updateData.canceled_at = updateData.canceled_at || new Date().toISOString();
        updateData.cancel_reason = "user_canceled";
        break;
      case 5: // ON_HOLD
        updateData.cancel_reason = "billing_issue";
        break;
      case 12: // REVOKED
        updateData.canceled_at = new Date().toISOString();
        updateData.cancel_reason = "revoked";
        break;
      case 13: // EXPIRED
        updateData.canceled_at = updateData.canceled_at || new Date().toISOString();
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
      .eq("notification_id", pubsubMessage.message.messageId);

    console.log(`Successfully processed Google notification for subscription ${subscription.id}: ${newStatus}`);

    return new Response(JSON.stringify({ received: true, processed: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing Google webhook:", error);
    // Return 200 to prevent retries
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

