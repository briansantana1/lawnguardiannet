import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Export User Data Edge Function
 * 
 * GDPR Article 20 - Right to Data Portability
 * Allows users to download all their personal data in a machine-readable format.
 * 
 * This function:
 * 1. Validates the user is authenticated
 * 2. Retrieves all user data from the database
 * 3. Returns the data as JSON (or processes for download)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  format?: "json" | "csv";
  includeImages?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing data export request for user ${user.id}`);

    // Parse request options
    let options: ExportRequest = { format: "json", includeImages: true };
    if (req.method === "POST") {
      try {
        options = { ...options, ...(await req.json()) };
      } catch {
        // Use defaults if body parsing fails
      }
    }

    // Check for rate limiting (max 1 export per hour)
    const { data: recentRequest } = await supabase
      .from("data_export_requests")
      .select("id, requested_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("requested_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .single();

    if (recentRequest) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "You can only request one data export per hour. Please try again later.",
          next_available: new Date(new Date(recentRequest.requested_at).getTime() + 60 * 60 * 1000).toISOString(),
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create export request record
    const { data: exportRequest, error: requestError } = await supabase
      .from("data_export_requests")
      .insert({
        user_id: user.id,
        status: "processing",
        export_format: options.format,
        include_images: options.includeImages,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (requestError) {
      console.error("Error creating export request:", requestError);
    }

    // Collect all user data
    const exportData: Record<string, any> = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        format: options.format,
        gdpr_article: "Article 20 - Right to Data Portability",
      },
      account_information: {},
      profile: {},
      saved_treatment_plans: [],
      subscription_history: [],
      consent_records: [],
      scan_usage: [],
      notification_preferences: {},
      audit_log: [],
    };

    // 1. Account information (from auth.users - limited fields)
    exportData.account_information = {
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: {
        provider: user.app_metadata?.provider,
      },
    };

    // 2. Profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      exportData.profile = {
        display_name: profile.display_name,
        email: profile.email,
        grass_type: profile.grass_type,
        location: profile.location,
        marketing_opt_in: profile.marketing_opt_in,
        analytics_opt_in: profile.analytics_opt_in,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    }

    // 3. Saved treatment plans
    const { data: treatmentPlans } = await supabase
      .from("saved_treatment_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (treatmentPlans) {
      exportData.saved_treatment_plans = treatmentPlans.map((plan) => ({
        id: plan.id,
        diagnosis: plan.diagnosis,
        treatment_plan: plan.treatment_plan,
        forecast: plan.forecast,
        grass_type: plan.grass_type,
        season: plan.season,
        image_url: options.includeImages ? plan.image_url : "[Image URL redacted]",
        created_at: plan.created_at,
      }));
    }

    // 4. Subscription history
    const { data: subscriptions } = await supabase
      .from("user_subscriptions")
      .select("*, plan:subscription_plans(name, description)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (subscriptions) {
      exportData.subscription_history = subscriptions.map((sub) => ({
        plan_name: sub.plan?.name,
        plan_id: sub.plan_id,
        platform: sub.platform,
        status: sub.status,
        billing_period: sub.billing_period,
        price_paid: sub.price_paid,
        currency: sub.currency,
        started_at: sub.started_at,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        trial_start: sub.trial_start,
        trial_end: sub.trial_end,
        canceled_at: sub.canceled_at,
        cancel_reason: sub.cancel_reason,
        auto_renew_enabled: sub.auto_renew_enabled,
        created_at: sub.created_at,
      }));
    }

    // 5. Consent records
    const { data: consents } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", user.id);

    if (consents) {
      exportData.consent_records = consents.map((consent) => ({
        consent_type: consent.consent_type,
        granted: consent.granted,
        policy_version: consent.policy_version,
        consent_method: consent.consent_method,
        granted_at: consent.granted_at,
        revoked_at: consent.revoked_at,
        updated_at: consent.updated_at,
      }));
    }

    // 6. Scan usage
    const { data: scanUsage } = await supabase
      .from("scan_usage")
      .select("*")
      .eq("user_id", user.id)
      .order("period_start", { ascending: false });

    if (scanUsage) {
      exportData.scan_usage = scanUsage.map((usage) => ({
        period_start: usage.period_start,
        period_end: usage.period_end,
        scans_used: usage.scans_used,
        scans_limit: usage.scans_limit,
      }));
    }

    // 7. Notification preferences
    const { data: notificationPrefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (notificationPrefs) {
      exportData.notification_preferences = {
        weather_alerts: notificationPrefs.weather_alerts,
        treatment_reminders: notificationPrefs.treatment_reminders,
        extreme_weather_only: notificationPrefs.extreme_weather_only,
        marketing_notifications: notificationPrefs.marketing_notifications,
        subscription_reminders: notificationPrefs.subscription_reminders,
        updated_at: notificationPrefs.updated_at,
      };
    }

    // 8. Audit log (last 90 days)
    const { data: auditLog } = await supabase
      .from("audit_log")
      .select("action, resource_type, metadata, created_at")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(500);

    if (auditLog) {
      exportData.audit_log = auditLog;
    }

    // Update export request as completed
    if (exportRequest) {
      await supabase
        .from("data_export_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          export_file_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .eq("id", exportRequest.id);
    }

    // Log the export event
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "data_exported",
      resource_type: "user_data",
      metadata: {
        format: options.format,
        include_images: options.includeImages,
        record_counts: {
          treatment_plans: exportData.saved_treatment_plans.length,
          subscriptions: exportData.subscription_history.length,
          consents: exportData.consent_records.length,
        },
      },
    });

    console.log(`Data export completed for user ${user.id}`);

    // Return the data
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lawn-guardian-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error in data export:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

