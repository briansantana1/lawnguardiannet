-- ============================================================================
-- SUBSCRIPTION MANAGEMENT SCHEMA
-- Comprehensive subscription system for Apple App Store & Google Play Store
-- ============================================================================

-- Subscription plans table (defines available plans)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_annual DECIMAL(10,2),
    apple_product_id TEXT UNIQUE,
    google_product_id TEXT UNIQUE,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    trial_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions table (tracks active subscriptions)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    
    -- Platform info
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web', 'stripe')),
    
    -- Store-specific identifiers
    apple_original_transaction_id TEXT,
    google_purchase_token TEXT,
    stripe_subscription_id TEXT,
    
    -- Subscription status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'trialing', 'past_due', 'canceled', 
        'expired', 'paused', 'grace_period', 'billing_retry'
    )),
    
    -- Billing info
    billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
    price_paid DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    
    -- Dates
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    
    -- Auto-renewal
    auto_renew_enabled BOOLEAN DEFAULT true,
    
    -- Store environment
    is_sandbox BOOLEAN DEFAULT false,
    
    -- Metadata
    raw_receipt JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one active subscription per user per platform
    CONSTRAINT unique_active_subscription_per_platform UNIQUE (user_id, platform, status) 
        WHERE status IN ('active', 'trialing', 'grace_period')
);

-- Subscription receipts/purchases table (audit trail for all transactions)
CREATE TABLE IF NOT EXISTS public.subscription_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Platform info
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web', 'stripe')),
    
    -- Transaction identifiers
    transaction_id TEXT NOT NULL,
    original_transaction_id TEXT,
    
    -- Receipt data
    product_id TEXT NOT NULL,
    receipt_data TEXT,
    receipt_hash TEXT,
    
    -- Verification status
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'failed', 'invalid', 'expired'
    )),
    verification_error TEXT,
    verified_at TIMESTAMPTZ,
    
    -- Transaction details
    purchase_date TIMESTAMPTZ NOT NULL,
    expires_date TIMESTAMPTZ,
    is_trial BOOLEAN DEFAULT false,
    is_intro_offer BOOLEAN DEFAULT false,
    is_upgraded BOOLEAN DEFAULT false,
    
    -- Pricing
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    
    -- Store environment
    is_sandbox BOOLEAN DEFAULT false,
    
    -- Raw response from store
    raw_response JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate receipts
    CONSTRAINT unique_receipt_per_platform UNIQUE (platform, transaction_id)
);

-- Subscription events table (complete audit log)
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Event info
    event_type TEXT NOT NULL,
    event_source TEXT NOT NULL CHECK (event_source IN (
        'apple_webhook', 'google_webhook', 'stripe_webhook', 
        'manual', 'system', 'user_action'
    )),
    
    -- Event data
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Processing status
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    processing_error TEXT,
    
    -- Store notification ID (for deduplication)
    notification_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate webhook events
    CONSTRAINT unique_notification UNIQUE (event_source, notification_id) WHERE notification_id IS NOT NULL
);

-- Scan usage tracking table (for free tier limits)
CREATE TABLE IF NOT EXISTS public.scan_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Usage period (monthly)
    period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
    period_end DATE NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
    
    -- Counts
    scans_used INTEGER DEFAULT 0,
    scans_limit INTEGER DEFAULT 3, -- Free tier limit
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_period UNIQUE (user_id, period_start)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON public.user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_apple ON public.user_subscriptions(apple_original_transaction_id) WHERE apple_original_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_google ON public.user_subscriptions(google_purchase_token) WHERE google_purchase_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_receipts_user_id ON public.subscription_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_receipts_subscription ON public.subscription_receipts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_receipts_verification ON public.subscription_receipts(verification_status);

CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription ON public.subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_unprocessed ON public.subscription_events(created_at) WHERE processed = false;

CREATE INDEX IF NOT EXISTS idx_scan_usage_user_period ON public.scan_usage(user_id, period_start);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_usage ENABLE ROW LEVEL SECURITY;

-- Subscription plans: anyone can read active plans
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- User subscriptions: users can only see their own
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Subscription receipts: users can only see their own
CREATE POLICY "Users can view own receipts"
ON public.subscription_receipts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Subscription events: users can only see their own
CREATE POLICY "Users can view own subscription events"
ON public.subscription_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Scan usage: users can view and update their own
CREATE POLICY "Users can view own scan usage"
ON public.scan_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own scan usage"
ON public.scan_usage FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- SERVICE ROLE POLICIES (for edge functions)
-- These allow the service role to manage all subscription data
-- ============================================================================

CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage receipts"
ON public.subscription_receipts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage events"
ON public.subscription_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage scan usage"
ON public.scan_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage plans"
ON public.subscription_plans FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_subscriptions
        WHERE user_id = check_user_id
        AND status IN ('active', 'trialing', 'grace_period')
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(check_user_id UUID)
RETURNS TABLE (
    has_subscription BOOLEAN,
    subscription_status TEXT,
    plan_id TEXT,
    platform TEXT,
    expires_at TIMESTAMPTZ,
    is_trial BOOLEAN,
    scans_used INTEGER,
    scans_limit INTEGER
) AS $$
DECLARE
    sub RECORD;
    usage RECORD;
BEGIN
    -- Get active subscription
    SELECT * INTO sub FROM public.user_subscriptions
    WHERE user_subscriptions.user_id = check_user_id
    AND status IN ('active', 'trialing', 'grace_period')
    AND current_period_end > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get current period usage
    SELECT * INTO usage FROM public.scan_usage
    WHERE scan_usage.user_id = check_user_id
    AND period_start = date_trunc('month', CURRENT_DATE)
    LIMIT 1;
    
    -- If no usage record, create one
    IF usage IS NULL THEN
        INSERT INTO public.scan_usage (user_id, scans_used, scans_limit)
        VALUES (check_user_id, 0, 3)
        RETURNING * INTO usage;
    END IF;
    
    RETURN QUERY SELECT 
        sub IS NOT NULL AS has_subscription,
        COALESCE(sub.status, 'none')::TEXT AS subscription_status,
        sub.plan_id::TEXT,
        sub.platform::TEXT,
        sub.current_period_end AS expires_at,
        COALESCE(sub.trial_end > NOW(), false) AS is_trial,
        COALESCE(usage.scans_used, 0) AS scans_used,
        CASE WHEN sub IS NOT NULL THEN -1 ELSE COALESCE(usage.scans_limit, 3) END AS scans_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment scan usage
CREATE OR REPLACE FUNCTION public.increment_scan_usage(check_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    scans_used INTEGER,
    scans_limit INTEGER,
    message TEXT
) AS $$
DECLARE
    has_sub BOOLEAN;
    current_usage INTEGER;
    current_limit INTEGER;
BEGIN
    -- Check for active subscription
    has_sub := public.has_active_subscription(check_user_id);
    
    IF has_sub THEN
        -- Unlimited scans for subscribers
        RETURN QUERY SELECT true, -1, -1, 'Unlimited scans with subscription'::TEXT;
        RETURN;
    END IF;
    
    -- Get or create usage record
    INSERT INTO public.scan_usage (user_id, scans_used, scans_limit)
    VALUES (check_user_id, 0, 3)
    ON CONFLICT (user_id, period_start) DO NOTHING;
    
    SELECT su.scans_used, su.scans_limit INTO current_usage, current_limit
    FROM public.scan_usage su
    WHERE su.user_id = check_user_id
    AND su.period_start = date_trunc('month', CURRENT_DATE);
    
    IF current_usage >= current_limit THEN
        RETURN QUERY SELECT false, current_usage, current_limit, 'Monthly scan limit reached. Upgrade to Pro for unlimited scans.'::TEXT;
        RETURN;
    END IF;
    
    -- Increment usage
    UPDATE public.scan_usage
    SET scans_used = scans_used + 1, updated_at = NOW()
    WHERE scan_usage.user_id = check_user_id
    AND period_start = date_trunc('month', CURRENT_DATE)
    RETURNING scan_usage.scans_used, scan_usage.scans_limit INTO current_usage, current_limit;
    
    RETURN QUERY SELECT true, current_usage, current_limit, 'Scan recorded successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription updates
CREATE TRIGGER update_subscription_timestamp
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscription_status();

-- ============================================================================
-- INSERT DEFAULT PLANS
-- ============================================================================

INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_annual, apple_product_id, google_product_id, features, trial_days)
VALUES 
    ('free', 'Free Plan', 'Basic lawn diagnostics with limited scans', 0, 0, NULL, NULL, 
     '["3 photo scans per month", "Basic diagnosis", "Confidence scores"]'::jsonb, 0),
    ('pro_monthly', 'Pro Monthly', 'Full access to all features, billed monthly', 9.99, NULL, 
     'com.lawnguardian.pro.monthly', 'pro_monthly', 
     '["Unlimited photo scans", "AI-powered identification", "Detailed diagnosis", "Treatment recommendations", "Organic & chemical options", "Prevention strategies", "History & tracking", "Ad-free experience"]'::jsonb, 7),
    ('pro_annual', 'Pro Annual', 'Full access to all features, billed annually with 33% savings', NULL, 79.99, 
     'com.lawnguardian.pro.annual', 'pro_annual', 
     '["Unlimited photo scans", "AI-powered identification", "Detailed diagnosis", "Treatment recommendations", "Organic & chemical options", "Prevention strategies", "History & tracking", "Ad-free experience", "Priority support"]'::jsonb, 7)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_annual = EXCLUDED.price_annual,
    apple_product_id = EXCLUDED.apple_product_id,
    google_product_id = EXCLUDED.google_product_id,
    features = EXCLUDED.features,
    trial_days = EXCLUDED.trial_days,
    updated_at = NOW();

-- ============================================================================
-- ADD DELETE ACCOUNT SUPPORT (Required by App Stores)
-- ============================================================================

-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verify the user is deleting their own account
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Can only delete your own account';
    END IF;
    
    -- Cancel any active subscriptions (they'll be handled by webhook)
    UPDATE public.user_subscriptions
    SET status = 'canceled', canceled_at = NOW(), cancel_reason = 'account_deletion'
    WHERE user_id = target_user_id AND status IN ('active', 'trialing', 'grace_period');
    
    -- Log the deletion event
    INSERT INTO public.subscription_events (user_id, event_type, event_source, event_data)
    VALUES (target_user_id, 'account_deleted', 'user_action', '{"reason": "user_requested"}'::jsonb);
    
    -- Delete will cascade to all user data via foreign keys
    DELETE FROM auth.users WHERE id = target_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

