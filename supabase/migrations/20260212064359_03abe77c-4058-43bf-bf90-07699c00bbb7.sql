-- Grant SELECT on channels_public view to anon and authenticated roles
GRANT SELECT ON public.channels_public TO anon, authenticated;