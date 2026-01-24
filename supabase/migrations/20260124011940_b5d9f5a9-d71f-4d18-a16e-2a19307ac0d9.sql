-- Create bot settings table for admin control
CREATE TABLE public.bot_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  allowed_channels text[] NOT NULL DEFAULT ARRAY['general']::text[],
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view bot settings"
ON public.bot_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and owners can manage bot settings"
ON public.bot_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Insert default settings row
INSERT INTO public.bot_settings (enabled, allowed_channels) VALUES (true, ARRAY['general']::text[]);

-- Create updated_at trigger
CREATE TRIGGER update_bot_settings_updated_at
BEFORE UPDATE ON public.bot_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();