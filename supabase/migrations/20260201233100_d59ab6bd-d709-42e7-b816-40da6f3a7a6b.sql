-- Fix: Remove overly permissive policy that exposes user conversation topics to all users
-- The "Service role can manage conversation topics" policy has USING(true) which allows ANY user to read ALL records
-- Service role bypasses RLS anyway, so this policy only creates a security hole

-- Drop the problematic policy
DROP POLICY IF EXISTS "Service role can manage conversation topics" ON public.user_conversation_topics;

-- The existing policies are correct:
-- "Users can view own conversation topics" - USING (auth.uid() = user_id)
-- "Users can insert own conversation topics" - WITH CHECK (auth.uid() = user_id)  
-- "Users can update own conversation topics" - USING (auth.uid() = user_id)