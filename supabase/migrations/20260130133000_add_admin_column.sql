-- Migration: Add is_admin to bot_users
-- Date: 2026-01-30

alter table public.bot_users 
add column if not exists is_admin boolean default false;

-- Optional: Index on is_admin if we query by it often, but for now scan is fine given low user count
create index if not exists idx_bot_users_is_admin on public.bot_users(is_admin);
