-- Migration: Fix insecure RLS policy on schedule_updates
-- The previous policy allowed public access. 
-- Since the backend uses the Service Role key (which bypasses RLS), 
-- we can safely drop this policy to enforce default-deny for non-service users.

drop policy if exists "Service role has full access to schedule_updates" on public.schedule_updates;

-- Optional: If we want to be explicit about service role access (though not strictly needed as it bypasses)
-- create policy "Service role full access" 
-- on public.schedule_updates 
-- for all 
-- to service_role 
-- using (true) 
-- with check (true);
