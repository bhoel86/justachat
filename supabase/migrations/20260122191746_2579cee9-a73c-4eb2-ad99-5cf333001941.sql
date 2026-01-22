-- Create function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- Drop existing policy that might conflict
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Allow admins to update roles (except owner role)
CREATE POLICY "Admins can update non-admin roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') 
    AND role NOT IN ('owner', 'admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND role NOT IN ('owner', 'admin')
  );

-- Allow owners to update any role except owner
CREATE POLICY "Owners can update all roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    public.is_owner(auth.uid())
    AND role != 'owner'
  )
  WITH CHECK (
    public.is_owner(auth.uid())
    AND role != 'owner'
  );