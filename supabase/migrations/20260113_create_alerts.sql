
-- Add communication_status to users
alter table public.users 
add column communication_status text default 'opted_in' check (communication_status in ('opted_in', 'opted_out', 'manual_contact'));

-- Create alerts table
create table public.alerts (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id),
    type text, -- 'opt_out', 'billing', 'system'
    message text,
    is_read boolean default false,
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.alerts enable row level security;
