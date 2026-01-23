-- Create k-lines table for global IP pattern bans (Owner/Admin only)
CREATE TABLE public.klines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_pattern TEXT NOT NULL,
  reason TEXT,
  set_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on klines
ALTER TABLE public.klines ENABLE ROW LEVEL SECURITY;

-- Only owners/admins can manage k-lines
CREATE POLICY "Owners and admins can manage klines"
ON public.klines
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Authenticated users can view k-lines (to check if they're banned)
CREATE POLICY "Authenticated users can view klines"
ON public.klines
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create registered_nicks table for NickServ-style registration
CREATE TABLE public.registered_nicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nickname TEXT NOT NULL UNIQUE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_identified TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false
);

-- Enable RLS on registered_nicks
ALTER TABLE public.registered_nicks ENABLE ROW LEVEL SECURITY;

-- Users can view all registered nicks (to check availability)
CREATE POLICY "Authenticated users can view registered nicks"
ON public.registered_nicks
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can register their own nick
CREATE POLICY "Users can register own nick"
ON public.registered_nicks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own registration
CREATE POLICY "Users can update own registration"
ON public.registered_nicks
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own registration
CREATE POLICY "Users can delete own registration"
ON public.registered_nicks
FOR DELETE
USING (auth.uid() = user_id);

-- Create channel_registrations for ChanServ-style registration
CREATE TABLE public.channel_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  founder_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  url TEXT,
  UNIQUE(channel_id)
);

-- Enable RLS on channel_registrations
ALTER TABLE public.channel_registrations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view channel registrations
CREATE POLICY "Authenticated users can view channel registrations"
ON public.channel_registrations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Channel founders can register their channels
CREATE POLICY "Channel founders can register"
ON public.channel_registrations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = channel_id AND created_by = auth.uid()
  )
);

-- Founders can update their registration
CREATE POLICY "Founders can update registration"
ON public.channel_registrations
FOR UPDATE
USING (founder_id = auth.uid());

-- Founders can delete registration
CREATE POLICY "Founders can delete registration"
ON public.channel_registrations
FOR DELETE
USING (founder_id = auth.uid() OR is_owner(auth.uid()));

-- Create channel_access_list for ChanServ access levels
CREATE TABLE public.channel_access_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  access_level INTEGER NOT NULL DEFAULT 0,
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Enable RLS on channel_access_list
ALTER TABLE public.channel_access_list ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view access lists
CREATE POLICY "Authenticated users can view access lists"
ON public.channel_access_list
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Channel owners can manage access
CREATE POLICY "Channel owners can manage access"
ON public.channel_access_list
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = channel_id AND created_by = auth.uid()
  ) OR is_owner(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add ghost_mode to profiles for invisible mode
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ghost_mode BOOLEAN DEFAULT false;

-- Create network_stats table for tracking
CREATE TABLE public.network_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type TEXT NOT NULL,
  stat_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on network_stats
ALTER TABLE public.network_stats ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view network stats
CREATE POLICY "Authenticated users can view stats"
ON public.network_stats
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only system can insert stats
CREATE POLICY "System can insert stats"
ON public.network_stats
FOR INSERT
WITH CHECK (is_owner(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));