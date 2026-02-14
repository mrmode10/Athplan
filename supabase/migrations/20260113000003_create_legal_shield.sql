-- Create legal_consents table
create table public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  document_version text not null, -- e.g., 'tos-v1', 'privacy-v1'
  ip_address text,
  agreed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS for legal_consents
alter table public.legal_consents enable row level security;

-- Users can insert their own consents
create policy "Users can insert own consents"
  on public.legal_consents for insert
  with check (auth.uid() = user_id);

-- Users can view their own consents
create policy "Users can view own consents"
  on public.legal_consents for select
  using (auth.uid() = user_id);


-- Create retention_policies table
create table public.retention_policies (
  data_type text primary key, -- e.g., 'chat_logs', 'activity_logs'
  retention_days int not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Enable RLS for retention_policies
alter table public.retention_policies enable row level security;
-- Only admins/service role should modify this (policies left to default deny for now)
-- Allow read for transparency if needed
create policy "Authenticated users can view retention policies"
  on public.retention_policies for select
  using (auth.role() = 'authenticated');

-- Seed default retention policies
insert into public.retention_policies (data_type, retention_days, description)
values
  ('activity_logs', 90, 'User activity audit logs'),
  ('chat_logs', 30, 'Conversation history with AI agents');


-- Function to soft delete user (Right to be Forgotten)
create or replace function public.soft_delete_user(p_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Anonymize PII in users table
  update public.users
  set 
    first_name = 'Deleted',
    last_name = 'User',
    email = 'deleted_' || id || '@deleted.com',
    payment_method = null,
    communication_status = 'opted_out'
  where id = p_user_id;

  -- Remove or anonymize other related data if necessary
  -- (e.g., delete future alerts)
  delete from public.alerts where team_id in (select team_id from public.users where id = p_user_id);

  return true;
end;
$$;


-- Function to enforce retention policy (to be run via pg_cron or edge function)
create or replace function public.enforce_retention_policy()
returns void
language plpgsql
security definer
as $$
declare
  policy record;
begin
  for policy in select * from public.retention_policies loop
    
    if policy.data_type = 'activity_logs' then
      delete from public.activity_logs
      where created_at < (now() - (policy.retention_days || ' days')::interval);
    end if;

    -- Add other tables here as needed matches data_type
    -- e.g. if we had a chat_messages table
    
  end loop;
end;
$$;
