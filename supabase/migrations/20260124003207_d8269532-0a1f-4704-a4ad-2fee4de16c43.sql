-- Drop existing restrictive policies on user_roles
DROP POLICY IF EXISTS "Admins can insert non-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update non-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can update all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create PERMISSIVE policies (at least one must pass)
-- Owner can insert any role except owner
CREATE POLICY "Owners can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (is_owner(auth.uid()) AND role <> 'owner'::app_role);

-- Owner can update any role except owner
CREATE POLICY "Owners can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (is_owner(auth.uid()) AND role <> 'owner'::app_role)
WITH CHECK (is_owner(auth.uid()) AND role <> 'owner'::app_role);

-- Admins can insert user/moderator roles only
CREATE POLICY "Admins can insert non-admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role = ANY (ARRAY['user'::app_role, 'moderator'::app_role]));

-- Admins can update to user/moderator roles only
CREATE POLICY "Admins can update non-admin roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND role = ANY (ARRAY['user'::app_role, 'moderator'::app_role]))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role = ANY (ARRAY['user'::app_role, 'moderator'::app_role]));

-- Owners can view all roles
CREATE POLICY "Owners can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (is_owner(auth.uid()));

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);