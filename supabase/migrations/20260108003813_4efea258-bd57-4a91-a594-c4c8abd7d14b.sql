-- Add UPDATE policy to saved_treatment_plans table
-- Users should be able to update their own treatment plans

CREATE POLICY "Users can update their own treatment plans"
ON public.saved_treatment_plans
FOR UPDATE
USING (auth.uid() = user_id);