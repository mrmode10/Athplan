
-- Create teams table
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text,
  stripe_customer_id text,
  subscription_status text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.teams enable row level security;

-- Add team_id to users
alter table public.users 
add column team_id uuid references public.teams(id);

-- RLS Policies for teams
create policy "Users can view their own team"
on public.teams for select
using (
  id in (
    select team_id from public.users
    where id = auth.uid()
  )
);
