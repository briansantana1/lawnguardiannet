-- ============================================================================
-- APP STORE COMPLIANCE MIGRATION
-- Comprehensive security and compliance updates for Apple App Store & Google Play
-- ============================================================================

-- ============================================================================
-- 1. GDPR/CCPA CONSENT TRACKING
-- ============================================================================

-- User consent records table
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Consent types
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'privacy_policy',        -- Accepted privacy policy
        'terms_of_service',      -- Accepted terms of service
        'marketing_emails',      -- Opted in to marketing emails
        'push_notifications',    -- Opted in to push notifications
        'location_tracking',     -- Consented to location usage
        'analytics',             -- Consented to analytics collection
        'data_processing'        -- General GDPR data processing consent
    )),
    
    -- Consent status
    granted BOOLEAN NOT NULL DEFAULT false,
    
    -- Version tracking (for policy updates)
    policy_version TEXT,
    
    -- Consent metadata
    ip_address TEXT,
    user_agent TEXT,
    consent_method TEXT CHECK (consent_method IN ('explicit', 'implicit', 'settings', 'signup')),
    
    -- Timestamps
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per consent type
    CONSTRAINT unique_user_consent UNIQUE (user_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own consents
CREATE POLICY "Users can view own consents"
ON public.user_consents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own consents"
ON public.user_consents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
ON public.user_consents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages consents"
ON public.user_consents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 2. DATA EXPORT REQUESTS (GDPR Right to Data Portability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'expired'
    )),
    
    -- Export details
    export_format TEXT DEFAULT 'json' CHECK (export_format IN ('json', 'csv')),
    include_images BOOLEAN DEFAULT true,
    
    -- File storage
    export_file_url TEXT,
    export_file_expires_at TIMESTAMPTZ,
    
    -- Processing info
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_export_user ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON public.data_export_requests(status);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own export requests"
ON public.data_export_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
ON public.data_export_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages export requests"
ON public.data_export_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 3. ACCOUNT DELETION REQUESTS (Enhanced for App Store Compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- User info (retained for records even after deletion)
    user_email TEXT NOT NULL,
    
    -- Request status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Request submitted
        'confirmed',         -- User confirmed deletion
        'processing',        -- Deletion in progress
        'completed',         -- Account deleted
        'canceled'           -- User canceled request
    )),
    
    -- Reason for deletion (optional)
    deletion_reason TEXT,
    feedback TEXT,
    
    -- Subscription handling
    had_active_subscription BOOLEAN DEFAULT false,
    subscription_platform TEXT,
    subscription_reminder_sent BOOLEAN DEFAULT false,
    
    -- Processing
    confirmed_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Retention (for legal requirements)
    data_retained_until TIMESTAMPTZ,
    
    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON public.account_deletion_requests(status);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests"
ON public.account_deletion_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages deletion requests"
ON public.account_deletion_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 4. ENHANCED PROFILE TABLE (Add compliance fields)
-- ============================================================================

-- Add compliance-related columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS analytics_opt_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_consent_review TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_deletion', 'deleted')),
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_retention_acknowledged BOOLEAN DEFAULT false;

-- ============================================================================
-- 5. GDPR DATA EXPORT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.request_data_export(
    requesting_user_id UUID,
    include_images_param BOOLEAN DEFAULT true,
    format_param TEXT DEFAULT 'json'
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
    existing_pending_request UUID;
BEGIN
    -- Verify the user is requesting their own data
    IF auth.uid() != requesting_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Can only request export of your own data';
    END IF;
    
    -- Check for existing pending request
    SELECT id INTO existing_pending_request
    FROM public.data_export_requests
    WHERE user_id = requesting_user_id
    AND status = 'pending'
    LIMIT 1;
    
    IF existing_pending_request IS NOT NULL THEN
        RAISE EXCEPTION 'A data export request is already pending';
    END IF;
    
    -- Create the export request
    INSERT INTO public.data_export_requests (
        user_id, export_format, include_images, status
    )
    VALUES (
        requesting_user_id, format_param, include_images_param, 'pending'
    )
    RETURNING id INTO request_id;
    
    -- Log the request
    PERFORM public.log_audit_event(
        requesting_user_id,
        'data_export_requested',
        'data_export',
        request_id::TEXT,
        NULL,
        NULL,
        jsonb_build_object('format', format_param, 'include_images', include_images_param)
    );
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. GET USER DATA FOR EXPORT (Used by Edge Function)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_export_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    export_data JSONB;
    profile_data JSONB;
    plans_data JSONB;
    subscriptions_data JSONB;
    consents_data JSONB;
    audit_data JSONB;
BEGIN
    -- Get profile
    SELECT to_jsonb(p.*) INTO profile_data
    FROM public.profiles p
    WHERE p.user_id = target_user_id;
    
    -- Get saved treatment plans
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO plans_data
    FROM public.saved_treatment_plans t
    WHERE t.user_id = target_user_id;
    
    -- Get subscription history
    SELECT COALESCE(jsonb_agg(to_jsonb(s.*)), '[]'::jsonb) INTO subscriptions_data
    FROM public.user_subscriptions s
    WHERE s.user_id = target_user_id;
    
    -- Get consent records
    SELECT COALESCE(jsonb_agg(to_jsonb(c.*)), '[]'::jsonb) INTO consents_data
    FROM public.user_consents c
    WHERE c.user_id = target_user_id;
    
    -- Get audit logs (last 90 days)
    SELECT COALESCE(jsonb_agg(to_jsonb(a.*)), '[]'::jsonb) INTO audit_data
    FROM public.audit_log a
    WHERE a.user_id = target_user_id
    AND a.created_at > NOW() - INTERVAL '90 days';
    
    -- Compile export data
    export_data := jsonb_build_object(
        'export_date', NOW(),
        'user_id', target_user_id,
        'profile', COALESCE(profile_data, '{}'::jsonb),
        'saved_treatment_plans', plans_data,
        'subscription_history', subscriptions_data,
        'consent_records', consents_data,
        'recent_activity', audit_data
    );
    
    RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. ENHANCED ACCOUNT DELETION (With proper cleanup)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account_v2(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    has_active_sub BOOLEAN;
    sub_platform TEXT;
    user_email_val TEXT;
BEGIN
    -- Verify the user is deleting their own account
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Can only delete your own account';
    END IF;
    
    -- Get user email before deletion
    SELECT email INTO user_email_val
    FROM public.profiles
    WHERE user_id = target_user_id;
    
    -- Check for active subscriptions
    SELECT EXISTS (
        SELECT 1 FROM public.user_subscriptions
        WHERE user_id = target_user_id
        AND status IN ('active', 'trialing', 'grace_period')
    ), platform INTO has_active_sub, sub_platform
    FROM public.user_subscriptions
    WHERE user_id = target_user_id
    AND status IN ('active', 'trialing', 'grace_period')
    LIMIT 1;
    
    -- Create deletion request record
    INSERT INTO public.account_deletion_requests (
        user_id, user_email, status, had_active_subscription, 
        subscription_platform, confirmed_at, data_retained_until
    )
    VALUES (
        target_user_id, 
        user_email_val, 
        'processing',
        COALESCE(has_active_sub, false),
        sub_platform,
        NOW(),
        NOW() + INTERVAL '30 days'  -- Retain record for 30 days per legal requirements
    );
    
    -- Cancel any active subscriptions (they'll be handled by webhook)
    UPDATE public.user_subscriptions
    SET status = 'canceled', 
        canceled_at = NOW(), 
        cancel_reason = 'account_deletion',
        auto_renew_enabled = false
    WHERE user_id = target_user_id 
    AND status IN ('active', 'trialing', 'grace_period');
    
    -- Log the deletion event
    INSERT INTO public.subscription_events (user_id, event_type, event_source, event_data, processed, processed_at)
    VALUES (
        target_user_id, 
        'account_deleted', 
        'user_action', 
        jsonb_build_object(
            'reason', 'user_requested',
            'had_subscription', COALESCE(has_active_sub, false),
            'email', user_email_val
        ),
        true,
        NOW()
    );
    
    -- Update deletion request to completed
    UPDATE public.account_deletion_requests
    SET status = 'completed', processed_at = NOW()
    WHERE user_id = target_user_id AND status = 'processing';
    
    -- Delete the user from auth.users (cascades to all related data)
    DELETE FROM auth.users WHERE id = target_user_id;
    
    result := jsonb_build_object(
        'success', true,
        'message', 'Account deleted successfully',
        'had_active_subscription', COALESCE(has_active_sub, false),
        'subscription_platform', sub_platform,
        'reminder', CASE 
            WHEN has_active_sub THEN 'Please cancel your subscription in ' || COALESCE(sub_platform, 'your app store') || ' to stop future charges.'
            ELSE NULL
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. CONSENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Record user consent
CREATE OR REPLACE FUNCTION public.record_consent(
    consent_user_id UUID,
    consent_type_param TEXT,
    granted_param BOOLEAN,
    policy_version_param TEXT DEFAULT NULL,
    consent_method_param TEXT DEFAULT 'explicit'
)
RETURNS UUID AS $$
DECLARE
    consent_id UUID;
BEGIN
    -- Verify user is recording their own consent
    IF auth.uid() != consent_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Can only record your own consent';
    END IF;
    
    INSERT INTO public.user_consents (
        user_id, consent_type, granted, policy_version, consent_method,
        granted_at, revoked_at, updated_at
    )
    VALUES (
        consent_user_id,
        consent_type_param,
        granted_param,
        policy_version_param,
        consent_method_param,
        CASE WHEN granted_param THEN NOW() ELSE NULL END,
        CASE WHEN NOT granted_param THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (user_id, consent_type) DO UPDATE SET
        granted = EXCLUDED.granted,
        policy_version = COALESCE(EXCLUDED.policy_version, user_consents.policy_version),
        consent_method = EXCLUDED.consent_method,
        granted_at = CASE WHEN EXCLUDED.granted THEN NOW() ELSE user_consents.granted_at END,
        revoked_at = CASE WHEN NOT EXCLUDED.granted THEN NOW() ELSE NULL END,
        updated_at = NOW()
    RETURNING id INTO consent_id;
    
    -- Log consent change
    PERFORM public.log_audit_event(
        consent_user_id,
        CASE WHEN granted_param THEN 'consent_granted' ELSE 'consent_revoked' END,
        'consent',
        consent_type_param,
        NULL,
        NULL,
        jsonb_build_object('consent_type', consent_type_param, 'granted', granted_param)
    );
    
    RETURN consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all user consents
CREATE OR REPLACE FUNCTION public.get_user_consents(check_user_id UUID)
RETURNS TABLE (
    consent_type TEXT,
    granted BOOLEAN,
    policy_version TEXT,
    granted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uc.consent_type,
        uc.granted,
        uc.policy_version,
        uc.granted_at,
        uc.updated_at
    FROM public.user_consents uc
    WHERE uc.user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. SUBSCRIPTION VERIFICATION FUNCTION (For periodic sync)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_expiring_subscriptions(days_until_expiry INTEGER DEFAULT 7)
RETURNS TABLE (
    subscription_id UUID,
    user_id UUID,
    platform TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ,
    auto_renew_enabled BOOLEAN,
    user_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS subscription_id,
        s.user_id,
        s.platform,
        s.status,
        s.current_period_end,
        s.auto_renew_enabled,
        p.email AS user_email
    FROM public.user_subscriptions s
    LEFT JOIN public.profiles p ON p.user_id = s.user_id
    WHERE s.status IN ('active', 'trialing', 'grace_period')
    AND s.current_period_end <= NOW() + (days_until_expiry || ' days')::INTERVAL
    AND s.current_period_end > NOW()
    ORDER BY s.current_period_end ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark expired subscriptions
CREATE OR REPLACE FUNCTION public.expire_old_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.user_subscriptions
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('active', 'trialing', 'grace_period')
    AND current_period_end < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. TRIGGERS FOR CONSENT AND COMPLIANCE
-- ============================================================================

-- Auto-create consent records on user signup
CREATE OR REPLACE FUNCTION public.create_initial_consents()
RETURNS TRIGGER AS $$
BEGIN
    -- Create required consent records
    INSERT INTO public.user_consents (user_id, consent_type, granted, consent_method, granted_at)
    VALUES 
        (NEW.id, 'privacy_policy', true, 'signup', NOW()),
        (NEW.id, 'terms_of_service', true, 'signup', NOW()),
        (NEW.id, 'data_processing', true, 'signup', NOW()),
        (NEW.id, 'analytics', true, 'implicit', NOW()),
        (NEW.id, 'marketing_emails', false, 'implicit', NULL),
        (NEW.id, 'push_notifications', false, 'implicit', NULL),
        (NEW.id, 'location_tracking', false, 'implicit', NULL)
    ON CONFLICT (user_id, consent_type) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_user_consents ON auth.users;
CREATE TRIGGER create_user_consents
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_initial_consents();

-- ============================================================================
-- 11. CLEANUP FUNCTIONS
-- ============================================================================

-- Clean up expired data export files
CREATE OR REPLACE FUNCTION public.cleanup_expired_exports()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE public.data_export_requests
    SET status = 'expired', export_file_url = NULL
    WHERE status = 'completed'
    AND export_file_expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old deletion request records (after retention period)
CREATE OR REPLACE FUNCTION public.cleanup_old_deletion_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.account_deletion_requests
    WHERE status = 'completed'
    AND data_retained_until < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. NOTIFICATION PREFERENCES (Enhanced)
-- ============================================================================

-- Add columns to existing notification_preferences table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
        ALTER TABLE public.notification_preferences
        ADD COLUMN IF NOT EXISTS marketing_notifications BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS subscription_reminders BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS expiry_warnings BOOLEAN DEFAULT true;
    END IF;
END $$;

