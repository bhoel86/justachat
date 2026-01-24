-- Create table to track user channel visits for personalized greetings
CREATE TABLE public.user_channel_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_name TEXT NOT NULL,
  username TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1,
  first_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_name)
);

-- Enable RLS
ALTER TABLE public.user_channel_visits ENABLE ROW LEVEL SECURITY;

-- Users can read their own visits
CREATE POLICY "Users can view their own visits"
ON public.user_channel_visits
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own visits
CREATE POLICY "Users can insert their own visits"
ON public.user_channel_visits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own visits
CREATE POLICY "Users can update their own visits"
ON public.user_channel_visits
FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_user_channel_visits_lookup ON public.user_channel_visits(user_id, channel_name);