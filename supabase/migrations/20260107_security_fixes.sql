-- ============================================================================
-- SECURITY FIXES MIGRATION
-- Addresses LLM Database Check warnings:
-- 1. PUBLIC_USER_DATA - Remove email from profiles table
-- 2. EXPOSED_SENSITIVE_DATA - Restrict site_settings access
-- ============================================================================

-- ============================================================================
-- FIX 1: Remove email from profiles table
-- Email should only be stored in auth.users (which has built-in protection)
-- ============================================================================

-- First, update the handle_new_user function to not insert email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log the signup event (don't include email in public audit log)
    PERFORM public.log_audit_event(
        NEW.id,
        'user_signup',
        'user',
        NEW.id::TEXT,
        NULL,
        NULL,
        jsonb_build_object('provider', NEW.raw_app_meta_data->>'provider')
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail user creation if profile creation fails
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the email constraint first
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS check_email_format;

-- Remove email column from profiles (data is in auth.users)
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS email;

-- ============================================================================
-- FIX 2: Create function to safely get user email (for authorized access)
-- This allows code to get email through auth.users with proper authorization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Only allow users to get their own email
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Not authorized to access this user email';
    END IF;
    
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = target_user_id;
    
    RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIX 3: Restrict site_settings to only public categories
-- Add a 'is_public' column and update RLS policies
-- ============================================================================

-- Add is_public column to control visibility
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Mark all existing settings as public (they are UI content)
UPDATE public.site_settings SET is_public = true;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Create new policy that only allows viewing public settings for anonymous users
CREATE POLICY "Anyone can view public site settings"
ON public.site_settings
FOR SELECT
TO anon
USING (is_public = true);

-- Authenticated users can view public settings
CREATE POLICY "Authenticated users can view public site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (is_public = true OR public.is_admin(auth.uid()));

-- ============================================================================
-- FIX 4: Create separate table for sensitive configuration
-- This keeps truly sensitive config separate from public content
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can access app_config
CREATE POLICY "Only admins can view app config"
ON public.app_config
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can modify app config"
ON public.app_config
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Service role has full access
CREATE POLICY "Service role full access to app config"
ON public.app_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- FIX 5: Update data export function to get email from auth.users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_export_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    export_data JSONB;
    user_email TEXT;
BEGIN
    -- Verify the user is requesting their own data
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Not authorized to export this user data';
    END IF;
    
    -- Get email from auth.users (secure source)
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = target_user_id;
    
    -- Compile all user data
    SELECT jsonb_build_object(
        'profile', (
            SELECT jsonb_build_object(
                'user_id', p.user_id,
                'email', user_email,  -- From auth.users, not profiles
                'display_name', p.display_name,
                'location', p.location,
                'grass_type', p.grass_type,
                'marketing_opt_in', p.marketing_opt_in,
                'analytics_opt_in', p.analytics_opt_in,
                'created_at', p.created_at,
                'updated_at', p.updated_at
            )
            FROM public.profiles p
            WHERE p.user_id = target_user_id
        ),
        'saved_plans', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'id', stp.id,
                'diagnosis', stp.diagnosis,
                'treatment_plan', stp.treatment_plan,
                'grass_type', stp.grass_type,
                'season', stp.season,
                'created_at', stp.created_at
            )), '[]'::jsonb)
            FROM public.saved_treatment_plans stp
            WHERE stp.user_id = target_user_id
        ),
        'subscriptions', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'plan_id', us.plan_id,
                'platform', us.platform,
                'status', us.status,
                'billing_period', us.billing_period,
                'created_at', us.created_at
            )), '[]'::jsonb)
            FROM public.user_subscriptions us
            WHERE us.user_id = target_user_id
        ),
        'consents', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'consent_type', uc.consent_type,
                'granted', uc.granted,
                'granted_at', uc.granted_at
            )), '[]'::jsonb)
            FROM public.user_consents uc
            WHERE uc.user_id = target_user_id
        ),
        'exported_at', NOW()
    ) INTO export_data;
    
    RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUMMARY OF CHANGES:
-- 1. Removed 'email' column from profiles table
-- 2. Updated handle_new_user() to not store email in profiles
-- 3. Created get_user_email() function for secure email access
-- 4. Updated site_settings with is_public column
-- 5. Created restrictive RLS policies for site_settings
-- 6. Created app_config table for truly sensitive configuration
-- 7. Updated get_user_export_data() to fetch email from auth.users
-- ============================================================================

