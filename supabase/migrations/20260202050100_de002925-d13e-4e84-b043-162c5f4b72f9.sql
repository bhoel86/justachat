-- Allow all authenticated users to see which accounts are Owner/Admin (needed to always show staff in member list)
-- This does NOT allow role changes—only SELECT—and only for owner/admin rows.

DROP POLICY IF EXISTS "Authenticated users can view staff roles" ON public.user_roles;

CREATE POLICY "Authenticated users can view staff roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role IN ('owner'::public.app_role, 'admin'::public.app_role));
