-- Add DELETE policy to profiles table for GDPR compliance
-- Users should be able to delete their own profile data

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);