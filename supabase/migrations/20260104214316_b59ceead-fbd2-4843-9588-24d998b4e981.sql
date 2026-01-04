-- Create table for treatment calendar entries
CREATE TABLE public.treatment_calendar_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  product TEXT NOT NULL,
  notes TEXT,
  next_application_date DATE,
  notification_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.treatment_calendar_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own entries" 
ON public.treatment_calendar_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.treatment_calendar_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.treatment_calendar_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.treatment_calendar_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_treatment_calendar_entries_updated_at
BEFORE UPDATE ON public.treatment_calendar_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();