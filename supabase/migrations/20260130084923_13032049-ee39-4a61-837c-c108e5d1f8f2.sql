-- Add moderator_bots_enabled column to bot_settings
ALTER TABLE public.bot_settings 
ADD COLUMN IF NOT EXISTS moderator_bots_enabled boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.bot_settings.moderator_bots_enabled IS 'Keep moderator bots (Pixel, Echo) running even when main bots are disabled';