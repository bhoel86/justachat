-- Add policy to allow users to see public channels
CREATE POLICY "Anyone can view public channels" 
ON public.channels 
FOR SELECT 
USING (is_private = false AND is_hidden = false);