-- Fix linter warning: avoid WITH CHECK (true) on INSERT policies.
-- This keeps audit log inserts restricted to service-role JWTs.

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (auth.role() = 'service_role');
