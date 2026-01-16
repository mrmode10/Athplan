-- Create subscription_tiers table
create table public.subscription_tiers (
  id text primary key, -- e.g., 'free', 'pro', 'enterprise'
  name text not null,
  max_members int not null default 5,
  max_monthly_events int not null default 100,
  features jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.subscription_tiers enable row level security;

-- Allow everyone to read tiers (for pricing pages etc)
create policy "Everyone can view tiers"
  on public.subscription_tiers for select
  using (true);

-- Seed default tiers
insert into public.subscription_tiers (id, name, max_members, max_monthly_events, features)
values
  ('starter', 'Starter', 5, 50, '{"ai_analysis": false, "advanced_reports": false}'),
  ('pro', 'Pro', 20, 500, '{"ai_analysis": true, "advanced_reports": true}'),
  ('enterprise', 'Enterprise', 999999, 999999, '{"ai_analysis": true, "advanced_reports": true, "custom_support": true}')
on conflict (id) do nothing;


-- Create team_usage table
create table public.team_usage (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) not null,
  period_start date not null, -- Start of the billing month
  period_end date not null,   -- End of the billing month
  events_count int not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(team_id, period_start, period_end)
);

-- Enable RLS
alter table public.team_usage enable row level security;

-- Team members can view their own team's usage
create policy "Team members can view team usage"
  on public.team_usage for select
  using (
    team_id in (
      select team_id from public.users
      where id = auth.uid()
    )
  );

-- Function to check limits
create or replace function public.check_team_limit(
  p_team_id uuid,
  p_metric_key text, -- 'max_members' or 'max_monthly_events'
  p_increment_amount int default 1
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_team_plan text;
  v_limit int;
  v_current_usage int;
  v_period_start date;
  v_period_end date;
begin
  -- Get team plan
  select plan into v_team_plan from public.teams where id = p_team_id;
  
  -- Default to starter if null (shouldn't happen but safe fallback)
  if v_team_plan is null then
    v_team_plan := 'starter';
  end if;

  -- Get limit from tiers
  execute format('select %I from public.subscription_tiers where id = $1', p_metric_key)
  into v_limit
  using v_team_plan;

  -- Handle member count check
  if p_metric_key = 'max_members' then
    select count(*) into v_current_usage from public.users where team_id = p_team_id;
    return (v_current_usage + p_increment_amount) <= v_limit;
  end if;

  -- Handle monthly events check
  if p_metric_key = 'max_monthly_events' then
    -- Determine current billing period (simplified to calendar month for now)
    v_period_start := date_trunc('month', current_date);
    v_period_end := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;

    -- Get current usage for this period
    select events_count into v_current_usage 
    from public.team_usage 
    where team_id = p_team_id 
    and period_start = v_period_start;

    if v_current_usage is null then
      v_current_usage := 0;
    end if;

    return (v_current_usage + p_increment_amount) <= v_limit;
  end if;

  -- Default true if metric unknown (or handle error)
  return true;
end;
$$;
