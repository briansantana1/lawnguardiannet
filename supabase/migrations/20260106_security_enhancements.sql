-- ============================================================================
-- SECURITY ENHANCEMENTS
-- Additional security measures for production deployment
-- ============================================================================

-- ============================================================================
-- RATE LIMITING TABLE
-- Tracks API calls per user for rate limiting
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_rate_limit UNIQUE (user_id, ip_address, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON public.rate_limits(user_id, ip_address, endpoint, window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role manages rate limits"
ON public.rate_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- AUDIT LOG TABLE
-- Tracks important security events
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can manage all audit logs
CREATE POLICY "Service role manages audit logs"
ON public.audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    check_user_id UUID,
    check_ip TEXT,
    check_endpoint TEXT,
    max_requests INTEGER DEFAULT 100,
    window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INTEGER,
    limit_value INTEGER,
    reset_at TIMESTAMPTZ
) AS $$
DECLARE
    window_start_time TIMESTAMPTZ;
    current_request_count INTEGER;
BEGIN
    -- Calculate window start (rounded to window_minutes)
    window_start_time := date_trunc('minute', NOW()) - 
        (EXTRACT(MINUTE FROM NOW())::INTEGER % window_minutes) * INTERVAL '1 minute';
    
    -- Get or create rate limit record
    INSERT INTO public.rate_limits (user_id, ip_address, endpoint, window_start, request_count)
    VALUES (check_user_id, check_ip, check_endpoint, window_start_time, 1)
    ON CONFLICT (user_id, ip_address, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING rate_limits.request_count INTO current_request_count;
    
    -- Return result
    RETURN QUERY SELECT 
        current_request_count <= max_requests AS allowed,
        current_request_count AS current_count,
        max_requests AS limit_value,
        window_start_time + (window_minutes * INTERVAL '1 minute') AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION public.log_audit_event(
    event_user_id UUID,
    event_action TEXT,
    event_resource_type TEXT DEFAULT NULL,
    event_resource_id TEXT DEFAULT NULL,
    event_ip TEXT DEFAULT NULL,
    event_user_agent TEXT DEFAULT NULL,
    event_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.audit_log (
        user_id, action, resource_type, resource_id, 
        ip_address, user_agent, metadata
    )
    VALUES (
        event_user_id, event_action, event_resource_type, event_resource_id,
        event_ip, event_user_agent, event_metadata
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEANUP JOBS
-- Functions to clean up old data (call via pg_cron or external scheduler)
-- ============================================================================

-- Clean up old rate limit records (older than 1 day)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old audit logs (older than 90 days, keep important ones)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_log
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND action NOT IN ('account_deleted', 'subscription_purchased', 'subscription_canceled', 'refund_issued');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADDITIONAL SECURITY CONSTRAINTS
-- ============================================================================

-- Add constraints to prevent SQL injection in text fields
ALTER TABLE public.profiles
ADD CONSTRAINT check_display_name_length CHECK (char_length(display_name) <= 100),
ADD CONSTRAINT check_location_length CHECK (char_length(location) <= 200);

-- Ensure email format is valid in profiles
ALTER TABLE public.profiles
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL);

-- ============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Creates a profile when a new user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, display_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log the signup event
    PERFORM public.log_audit_event(
        NEW.id,
        'user_signup',
        'user',
        NEW.id::TEXT,
        NULL,
        NULL,
        jsonb_build_object('email', NEW.email, 'provider', NEW.raw_app_meta_data->>'provider')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SESSION SECURITY
-- Track active sessions for security monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_revoked BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(last_active_at) WHERE is_revoked = false;

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke own sessions"
ON public.user_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages sessions"
ON public.user_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

