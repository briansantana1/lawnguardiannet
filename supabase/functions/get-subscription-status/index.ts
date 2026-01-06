import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Get Subscription Status
 * 
 * Returns the current subscription status for the authenticated user.
 * Used by the app to determine feature access and display subscription info.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionStatus {
  hasSubscription: boolean;
  status: "active" | "trialing" | "canceled" | "expired" | "grace_period" | "past_due" | "none";
  plan: {
    id: string;
    name: string;
    billingPeriod: "monthly" | "annual";
  } | null;
  expiresAt: string | null;
  isTrial: boolean;
  autoRenewEnabled: boolean;
  usage: {
    scansUsed: number;
    scansLimit: number; // -1 for unlimited
    periodStart: string;
    periodEnd: string;
  };
  features: {
    unlimitedScans: boolean;
    aiIdentification: boolean;
    treatmentRecommendations: boolean;
    historyTracking: boolean;
    adFree: boolean;
    prioritySupport: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Return free tier status for unauthenticated users
      return new Response(
        JSON.stringify({
          hasSubscription: false,
          status: "none",
          plan: null,
          expiresAt: null,
          isTrial: false,
          autoRenewEnabled: false,
          usage: {
            scansUsed: 0,
            scansLimit: 3,
            periodStart: new Date().toISOString(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          features: {
            unlimitedScans: false,
            aiIdentification: false,
            treatmentRecommendations: false,
            historyTracking: false,
            adFree: false,
            prioritySupport: false,
          },
        } as SubscriptionStatus),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "grace_period", "canceled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get current period usage
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(0);
    periodEnd.setHours(23, 59, 59, 999);

    let scansUsed = 0;
    let scansLimit = 3;

    const { data: usage } = await supabase
      .from("scan_usage")
      .select("*")
      .eq("user_id", user.id)
      .gte("period_start", periodStart.toISOString().split("T")[0])
      .single();

    if (usage) {
      scansUsed = usage.scans_used;
      scansLimit = usage.scans_limit;
    }

    // Check if subscription is still valid
    const hasActiveSubscription = subscription && 
      ["active", "trialing", "grace_period"].includes(subscription.status) &&
      new Date(subscription.current_period_end) > new Date();

    // Determine features based on subscription
    const isPro = hasActiveSubscription;
    const isAnnual = subscription?.billing_period === "annual";

    const status: SubscriptionStatus = {
      hasSubscription: hasActiveSubscription || false,
      status: subscription?.status || "none",
      plan: subscription ? {
        id: subscription.plan_id,
        name: subscription.plan?.name || subscription.plan_id,
        billingPeriod: subscription.billing_period,
      } : null,
      expiresAt: subscription?.current_period_end || null,
      isTrial: subscription?.status === "trialing" || false,
      autoRenewEnabled: subscription?.auto_renew_enabled || false,
      usage: {
        scansUsed: isPro ? -1 : scansUsed, // -1 indicates unlimited
        scansLimit: isPro ? -1 : scansLimit,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
      features: {
        unlimitedScans: isPro,
        aiIdentification: isPro,
        treatmentRecommendations: isPro,
        historyTracking: isPro,
        adFree: isPro,
        prioritySupport: isAnnual,
      },
    };

    return new Response(
      JSON.stringify(status),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error getting subscription status:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

