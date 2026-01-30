-- Security and Performance Fixes 2026-01-30

-- 1. Recreate activity_logs properly
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 2. Secure Functions with Search Path
CREATE OR REPLACE FUNCTION public.check_team_limit(p_team_id uuid, p_metric_key text, p_increment_amount integer DEFAULT 1)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $function$
declare
  v_team_plan text;
  v_limit int;
  v_current_usage int;
  v_period_start date;
  v_period_end date;
begin
  select plan into v_team_plan from public.teams where id = p_team_id;
  if v_team_plan is null then v_team_plan := 'starter'; end if;
  execute format('select %I from public.subscription_tiers where id = $1', p_metric_key) into v_limit using v_team_plan;
  if p_metric_key = 'max_members' then
    select count(*) into v_current_usage from public.users where team_id = p_team_id;
    return (v_current_usage + p_increment_amount) <= v_limit;
  end if;
  if p_metric_key = 'max_monthly_events' then
    v_period_start := date_trunc('month', current_date);
    v_period_end := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
    select events_count into v_current_usage from public.team_usage where team_id = p_team_id and period_start = v_period_start;
    if v_current_usage is null then v_current_usage := 0; end if;
    return (v_current_usage + p_increment_amount) <= v_limit;
  end if;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.increment_team_usage(p_team_id uuid, p_amount integer DEFAULT 1)
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $function$
declare
  v_period_start date;
  v_new_count int;
begin
  v_period_start := date_trunc('month', current_date);
  insert into public.team_usage (team_id, period_start, period_end, events_count)
  values (p_team_id, v_period_start, (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date, p_amount)
  on conflict (team_id, period_start, period_end)
  do update set events_count = team_usage.events_count + excluded.events_count, updated_at = now()
  returning events_count into v_new_count;
  return v_new_count;
end;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_user(p_user_id uuid)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $function$
begin
  update public.users set first_name = 'Deleted', last_name = 'User', email = 'deleted_' || id || '@deleted.com', payment_method = null, communication_status = 'opted_out' where id = p_user_id;
  delete from public.alerts where team_id in (select team_id from public.users where id = p_user_id);
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.check_group_name_exists(p_name text)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $function$
declare v_exists boolean; begin select exists(select 1 from public.groups where lower(name) = lower(p_name)) into v_exists; return v_exists; end;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_retention_policy()
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $function$
begin NULL; end;
$function$;

-- 3. RLS Policies
-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Activity Logs
DROP POLICY IF EXISTS "Team members can view logs" ON activity_logs;
CREATE POLICY "Team members can view logs" ON activity_logs FOR SELECT USING (team_id IN (SELECT team_id FROM public.users WHERE id = (select auth.uid())));

-- Alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team view" ON alerts;
CREATE POLICY "Team view" ON alerts FOR SELECT USING (team_id IN (SELECT team_id FROM public.users WHERE id = (select auth.uid())));

-- Revenue Ledger
ALTER TABLE revenue_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team view" ON revenue_ledger;
CREATE POLICY "Team view" ON revenue_ledger FOR SELECT USING (team_id IN (SELECT team_id FROM public.users WHERE id = (select auth.uid())));

-- Deny All for Backend
ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all" ON public.bot_users FOR ALL USING (false);
CREATE POLICY "Deny all" ON public.usage FOR ALL USING (false);
CREATE POLICY "Deny all" ON public.whatsapp_users FOR ALL USING (false);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_team_id ON alerts(team_id);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_team_id ON revenue_ledger(team_id);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON public.chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_consents_user_id ON public.legal_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
