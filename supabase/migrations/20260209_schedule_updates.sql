-- Migration: Create schedule_updates table for admin schedule updates via WhatsApp
-- Command: #schedule <message>

create table if not exists public.schedule_updates (
    id uuid primary key default gen_random_uuid(),
    group_name text not null,
    content text not null,
    created_by text not null,
    created_at timestamptz default now()
);

-- Index for fast lookups by group
create index if not exists idx_schedule_updates_group on public.schedule_updates(group_name);

-- Index for ordering by date
create index if not exists idx_schedule_updates_date on public.schedule_updates(created_at desc);

-- Enable RLS
alter table public.schedule_updates enable row level security;

-- Policy: Allow service role full access
create policy "Service role has full access to schedule_updates"
on public.schedule_updates
for all
using (true)
with check (true);

comment on table public.schedule_updates is 'Stores schedule updates sent by admins via WhatsApp #schedule command';
