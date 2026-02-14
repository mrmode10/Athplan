-- Migration: Fix RLS Policies for Security Compliance
-- Description:
-- 1. Adds explicit service_role policy to `schedule_updates` to resolve "RLS Enabled No Policy" warning.
-- 2. Restricts `teams` INSERT policy to prevent privilege escalation (e.g. setting 'active' status without payment).

-- 1. Fix `schedule_updates`
-- Ensure RLS is enabled
ALTER TABLE public.schedule_updates ENABLE ROW LEVEL SECURITY;

-- Create explicit policy for service_role (back-office/admin use)
-- This silences the "No Policy" warning while keeping it secure from public/anon users.
-- Create explicit policy for service_role (back-office/admin use)
-- This silences the "No Policy" warning while keeping it secure from public/anon users.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'schedule_updates'
        AND policyname = 'Service role full access'
    ) THEN
        CREATE POLICY "Service role full access"
        ON public.schedule_updates
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- 2. Fix `teams` INSERT policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can insert their own team" ON public.teams;

-- Create a stricter policy
CREATE POLICY "Users can insert their own team"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can only create a team if they are not setting protected fields to 'active' or 'premium' states manually
  -- Allow null (default) or 'trialing'/'free'
  (subscription_status IS NULL OR subscription_status IN ('trialing', 'free'))
  AND
  -- Cannot set a stripe_customer_id manually (must be null on creation)
  stripe_customer_id IS NULL
);
