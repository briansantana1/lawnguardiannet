-- Fix missing UPDATE policy for saved_treatment_plans table
-- This allows users to update their own treatment plans

CREATE POLICY "Users can update their own treatment plans" 
ON public.saved_treatment_plans 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
