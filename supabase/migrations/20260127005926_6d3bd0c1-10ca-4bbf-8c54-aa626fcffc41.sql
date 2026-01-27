-- Add parental consent tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_email text,
ADD COLUMN IF NOT EXISTS parent_consent_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_consent_token text,
ADD COLUMN IF NOT EXISTS parent_consent_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_minor boolean DEFAULT false;

-- Update handle_new_user to include parent email and minor status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, age, parent_email, is_minor)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
    (NEW.raw_user_meta_data->>'age')::integer,
    NEW.raw_user_meta_data->>'parent_email',
    COALESCE((NEW.raw_user_meta_data->>'is_minor')::boolean, false)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Allow admins to view all profiles for minor management
CREATE POLICY "Admins can view all profiles for management" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR is_owner(auth.uid()));

-- Allow admins to update consent status
CREATE POLICY "Admins can update profiles for consent management" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR is_owner(auth.uid()));