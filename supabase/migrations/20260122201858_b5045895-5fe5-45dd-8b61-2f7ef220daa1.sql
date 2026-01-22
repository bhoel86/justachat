-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.user_locations;

-- Create new policy: only owners can view all locations, users can view their own
CREATE POLICY "Owners can view all locations" 
ON public.user_locations 
FOR SELECT 
USING (is_owner(auth.uid()));

CREATE POLICY "Users can view own location" 
ON public.user_locations 
FOR SELECT 
USING (auth.uid() = user_id);