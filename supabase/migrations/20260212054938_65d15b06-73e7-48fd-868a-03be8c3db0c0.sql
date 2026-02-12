
-- Fix: Make the public channels SELECT policy PERMISSIVE (currently RESTRICTIVE = no rows returned)
DROP POLICY IF EXISTS "Anyone can view public channels" ON public.channels;
CREATE POLICY "Anyone can view public channels"
  ON public.channels
  FOR SELECT
  USING ((is_private = false) AND (is_hidden = false));

-- Also make the creator policy PERMISSIVE
DROP POLICY IF EXISTS "Channel creators can manage own channels" ON public.channels;
CREATE POLICY "Channel creators can manage own channels"
  ON public.channels
  FOR SELECT
  USING (created_by = auth.uid());
