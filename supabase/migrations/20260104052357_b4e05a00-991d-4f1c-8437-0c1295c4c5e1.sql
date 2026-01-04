-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  grass_type TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_treatment_plans table
CREATE TABLE public.saved_treatment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  diagnosis JSONB NOT NULL,
  treatment_plan JSONB NOT NULL,
  forecast JSONB,
  grass_type TEXT,
  season TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_treatment_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Saved treatment plans policies
CREATE POLICY "Users can view their own treatment plans" 
ON public.saved_treatment_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own treatment plans" 
ON public.saved_treatment_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatment plans" 
ON public.saved_treatment_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for lawn images
INSERT INTO storage.buckets (id, name, public) VALUES ('lawn-images', 'lawn-images', true);

-- Storage policies for lawn images
CREATE POLICY "Anyone can view lawn images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lawn-images');

CREATE POLICY "Authenticated users can upload lawn images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lawn-images' AND auth.role() = 'authenticated');