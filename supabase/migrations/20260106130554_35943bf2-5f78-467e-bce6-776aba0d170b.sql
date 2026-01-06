-- Create site_settings table for editable content
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text,
    label text NOT NULL,
    category text NOT NULL DEFAULT 'general',
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (public content)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
TO authenticated, anon
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can insert settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete settings
CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.site_settings (key, value, label, category, description) VALUES
-- App Store URLs
('app_store_url', 'https://apps.apple.com/app/lawn-guardian', 'App Store URL', 'app_links', 'Apple App Store download link'),
('google_play_url', 'https://play.google.com/store/apps/details?id=app.lovable.lawnguardian', 'Google Play URL', 'app_links', 'Google Play Store download link'),

-- Hero Section
('hero_headline', 'Your Lawn''s AI-Powered Personal Expert', 'Hero Headline', 'hero', 'Main headline on the landing page'),
('hero_subheadline', 'Snap a photo. Get instant diagnosis. Receive personalized treatment plans. Transform your lawn with AI-powered care.', 'Hero Subheadline', 'hero', 'Subheadline text below the main headline'),
('brand_name', 'Lawn Guardian', 'Brand Name', 'hero', 'The app brand name displayed across the site'),

-- Features Section
('feature_1_title', 'AI Photo Diagnosis', 'Feature 1 Title', 'features', 'First feature card title'),
('feature_1_description', 'Take a photo of any lawn problem and get instant identification of diseases, weeds, and pests.', 'Feature 1 Description', 'features', 'First feature card description'),
('feature_2_title', 'Smart Treatment Plans', 'Feature 2 Title', 'features', 'Second feature card title'),
('feature_2_description', 'Receive personalized treatment recommendations based on your specific grass type and climate.', 'Feature 2 Description', 'features', 'Second feature card description'),
('feature_3_title', 'Weather-Based Alerts', 'Feature 3 Title', 'features', 'Third feature card title'),
('feature_3_description', 'Get proactive notifications when weather conditions put your lawn at risk.', 'Feature 3 Description', 'features', 'Third feature card description'),
('feature_4_title', 'Treatment Calendar', 'Feature 4 Title', 'features', 'Fourth feature card title'),
('feature_4_description', 'Track applications and never miss a treatment with smart scheduling reminders.', 'Feature 4 Description', 'features', 'Fourth feature card description'),
('feature_5_title', 'Disease Prevention', 'Feature 5 Title', 'features', 'Fifth feature card title'),
('feature_5_description', 'Stay ahead of problems with predictive alerts based on local conditions.', 'Feature 5 Description', 'features', 'Fifth feature card description'),
('feature_6_title', 'Progress Tracking', 'Feature 6 Title', 'features', 'Sixth feature card title'),
('feature_6_description', 'Monitor your lawn''s health over time and see your improvements.', 'Feature 6 Description', 'features', 'Sixth feature card description'),

-- CTA Section
('cta_headline', 'Ready for a Healthier Lawn?', 'CTA Headline', 'cta', 'Call-to-action section headline'),
('cta_subheadline', 'Join thousands of homeowners who trust Lawn Guardian for expert lawn care advice.', 'CTA Subheadline', 'cta', 'Call-to-action section subtext'),

-- Footer
('footer_copyright', '© 2025 Lawn Guardian. All rights reserved.', 'Footer Copyright', 'footer', 'Copyright text in the footer');