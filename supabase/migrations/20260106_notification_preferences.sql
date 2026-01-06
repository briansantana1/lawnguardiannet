-- Create notification_preferences table for storing user notification settings
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    disease_alerts BOOLEAN DEFAULT true,
    insect_alerts BOOLEAN DEFAULT true,
    weather_alerts BOOLEAN DEFAULT true,
    treatment_reminders BOOLEAN DEFAULT true,
    daily_digest BOOLEAN DEFAULT false,
    weekly_report BOOLEAN DEFAULT true,
    preferred_time TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'America/Chicago',
    browser_notifications_enabled BOOLEAN DEFAULT false,
    email_notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view their own preferences
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_timestamp
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_notification_preferences_user_id 
ON public.notification_preferences(user_id);

