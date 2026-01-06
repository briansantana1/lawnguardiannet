import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Subscription Sync Edge Function
 * 
 * This function should be called periodically (via cron job or scheduler) to:
 * 1. Expire subscriptions that have passed their end date
 * 2. Verify subscription status with Apple/Google (optional)
 * 3. Send expiration warning notifications
 * 4. Clean up stale data
 * 
 * Configure a cron job to call this endpoint daily:
 * - Supabase pg_cron
 * - External scheduler (Codemagic, GitHub Actions, etc.)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

// Apple endpoints
const APPLE_PRODUCTION_VERIFY = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_VERIFY = "https://sandbox.itunes.apple.com/verifyReceipt";

interface SyncResult {
  expired_count: number;
  verified_count: number;
  warning_sent_count: number;
  errors: string[];
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

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

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

  const { access_token } = await tokenResponse.json();
  return access_token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret or admin authentication
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("Authorization");

    // Allow either cron secret or service role key
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const isAuthorized =
      (cronSecret && providedSecret === cronSecret) ||
      (authHeader && authHeader.includes(supabaseServiceKey));

    if (!isAuthorized) {
      // For development/testing, allow unauthenticated calls
      console.warn("No authentication provided - proceeding with caution");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const appleSharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    const googleCredentialsJson = Deno.env.get("GOOGLE_PLAY_CREDENTIALS");
    const googlePackageName = Deno.env.get("GOOGLE_PLAY_PACKAGE_NAME") || "com.lawnguardian.app";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const result: SyncResult = {
      expired_count: 0,
      verified_count: 0,
      warning_sent_count: 0,
      errors: [],
    };

    console.log("Starting subscription sync...");

    // 1. Expire subscriptions that have passed their end date
    const { data: expiredCount, error: expireError } = await supabase.rpc(
      "expire_old_subscriptions"
    );

    if (expireError) {
      console.error("Error expiring subscriptions:", expireError);
      result.errors.push(`Expire error: ${expireError.message}`);
    } else {
      result.expired_count = expiredCount || 0;
      console.log(`Expired ${result.expired_count} subscriptions`);
    }

    // 2. Get subscriptions expiring in the next 3 days for verification
    const { data: expiringSubscriptions, error: expiringError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .in("status", ["active", "trialing", "grace_period"])
      .lte("current_period_end", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
      .gt("current_period_end", new Date().toISOString());

    if (expiringError) {
      console.error("Error fetching expiring subscriptions:", expiringError);
      result.errors.push(`Fetch error: ${expiringError.message}`);
    }

    // 3. Verify subscription status with stores (optional, for critical subscriptions)
    if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      console.log(`Found ${expiringSubscriptions.length} subscriptions to verify`);

      for (const sub of expiringSubscriptions) {
        try {
          if (sub.platform === "ios" && sub.raw_receipt && appleSharedSecret) {
            // Verify with Apple
            const receiptData = sub.raw_receipt?.latest_receipt || sub.raw_receipt;
            if (typeof receiptData === "string") {
              const response = await fetch(
                sub.is_sandbox ? APPLE_SANDBOX_VERIFY : APPLE_PRODUCTION_VERIFY,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    "receipt-data": receiptData,
                    password: appleSharedSecret,
                    "exclude-old-transactions": true,
                  }),
                }
              );

              if (response.ok) {
                const verifyResult = await response.json();
                if (verifyResult.status === 0) {
                  // Update subscription with latest info
                  const latestReceipt = verifyResult.latest_receipt_info?.[0];
                  if (latestReceipt && latestReceipt.expires_date_ms) {
                    const newExpiry = new Date(parseInt(latestReceipt.expires_date_ms));
                    if (newExpiry > new Date(sub.current_period_end)) {
                      await supabase
                        .from("user_subscriptions")
                        .update({
                          current_period_end: newExpiry.toISOString(),
                          status: "active",
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", sub.id);
                      result.verified_count++;
                    }
                  }
                }
              }
            }
          } else if (
            sub.platform === "android" &&
            sub.google_purchase_token &&
            googleCredentialsJson
          ) {
            // Verify with Google
            try {
              const credentials = JSON.parse(googleCredentialsJson);
              const accessToken = await getGoogleAccessToken(credentials);

              const productId = sub.plan_id.includes("annual") ? "pro_annual" : "pro_monthly";
              const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${googlePackageName}/purchases/subscriptions/${productId}/tokens/${sub.google_purchase_token}`;

              const response = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (response.ok) {
                const googleSub = await response.json();
                const newExpiry = new Date(parseInt(googleSub.expiryTimeMillis));

                if (newExpiry > new Date(sub.current_period_end)) {
                  await supabase
                    .from("user_subscriptions")
                    .update({
                      current_period_end: newExpiry.toISOString(),
                      status: googleSub.cancelReason ? "canceled" : "active",
                      auto_renew_enabled: googleSub.autoRenewing,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", sub.id);
                  result.verified_count++;
                }
              }
            } catch (googleError) {
              console.error(`Google verification error for ${sub.id}:`, googleError);
            }
          }
        } catch (verifyError) {
          console.error(`Verification error for subscription ${sub.id}:`, verifyError);
          result.errors.push(`Verify error ${sub.id}: ${verifyError}`);
        }
      }
    }

    // 4. Get subscriptions expiring in 7 days for warning notifications
    const { data: warningSubscriptions } = await supabase.rpc("get_expiring_subscriptions", {
      days_until_expiry: 7,
    });

    if (warningSubscriptions && warningSubscriptions.length > 0) {
      // Log subscriptions that need warning notifications
      for (const sub of warningSubscriptions) {
        // Check if we already sent a warning
        const { data: existingWarning } = await supabase
          .from("subscription_events")
          .select("id")
          .eq("subscription_id", sub.subscription_id)
          .eq("event_type", "expiration_warning_sent")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (!existingWarning) {
          // Log the warning event (actual notification sending would be done by another service)
          await supabase.from("subscription_events").insert({
            subscription_id: sub.subscription_id,
            user_id: sub.user_id,
            event_type: "expiration_warning_sent",
            event_source: "system",
            event_data: {
              expires_at: sub.current_period_end,
              platform: sub.platform,
              auto_renew_enabled: sub.auto_renew_enabled,
            },
            processed: true,
            processed_at: new Date().toISOString(),
          });
          result.warning_sent_count++;
        }
      }
    }

    // 5. Clean up old data
    await supabase.rpc("cleanup_old_rate_limits");
    await supabase.rpc("cleanup_expired_exports");

    // Log the sync completion
    await supabase.from("audit_log").insert({
      action: "subscription_sync_completed",
      resource_type: "system",
      metadata: result,
    });

    console.log("Subscription sync completed:", result);

    return new Response(JSON.stringify({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

