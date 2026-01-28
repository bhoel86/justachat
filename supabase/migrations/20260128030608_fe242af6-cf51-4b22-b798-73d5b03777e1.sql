-- Create a public view for user_locations that excludes sensitive fields
CREATE OR REPLACE VIEW public.user_locations_public
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  city,
  region,
  country,
  country_code,
  timezone,
  last_seen,
  created_at
FROM public.user_locations;
-- Excludes: ip_address, latitude, longitude, isp (sensitive data)

-- Drop existing permissive SELECT policies
DROP POLICY IF EXISTS "Admins can view all locations" ON public.user_locations;
DROP POLICY IF EXISTS "Users can view own location" ON public.user_locations;

-- Create restrictive policies - only admins/owners can see full data
CREATE POLICY "Admins and owners can view all locations"
ON public.user_locations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Users can only see their own location (for the map feature if needed)
CREATE POLICY "Users can view own location"
ON public.user_locations
FOR SELECT
USING (auth.uid() = user_id);