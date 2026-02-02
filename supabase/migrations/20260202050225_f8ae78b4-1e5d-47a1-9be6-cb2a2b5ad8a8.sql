-- Fix linter warning + tighten security for service-only tables.

-- 1) bot_photos: policy was mistakenly public + true/true.
DROP POLICY IF EXISTS "Service role can manage bot photos" ON public.bot_photos;

CREATE POLICY "Service role can manage bot photos"
ON public.bot_photos
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2) login_attempts: make explicit service-role guard (avoid USING true).
DROP POLICY IF EXISTS "Service role only" ON public.login_attempts;

CREATE POLICY "Service role only"
ON public.login_attempts
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
