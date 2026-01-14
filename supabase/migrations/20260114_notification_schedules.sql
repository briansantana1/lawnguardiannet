-- Create notification_schedules table for storing scheduled notifications
CREATE TABLE IF NOT EXISTS public.notification_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'medium',
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    is_sent BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    delivery_method TEXT DEFAULT 'browser', -- 'browser', 'email', 'push', 'all'
    weather_context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

-- Users can only view their own scheduled notifications
CREATE POLICY "Users can view own notification schedules"
ON public.notification_schedules FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can insert own notification schedules"
ON public.notification_schedules FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notification schedules"
ON public.notification_schedules FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notification schedules"
ON public.notification_schedules FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_notification_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_schedules_timestamp
    BEFORE UPDATE ON public.notification_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_schedules_updated_at();

-- Create indexes for faster lookups
CREATE INDEX idx_notification_schedules_user_id 
ON public.notification_schedules(user_id);

CREATE INDEX idx_notification_schedules_scheduled_for 
ON public.notification_schedules(scheduled_for);

CREATE INDEX idx_notification_schedules_is_sent 
ON public.notification_schedules(is_sent);

-- Index for finding unsent notifications due for delivery
CREATE INDEX idx_notification_schedules_pending 
ON public.notification_schedules(scheduled_for, is_sent) 
WHERE is_sent = false;
