-- Function to increment usage safely
create or replace function public.increment_team_usage(
  p_team_id uuid,
  p_amount int default 1
)
returns int
language plpgsql
security definer
as $$
declare
  v_period_start date;
  v_new_count int;
begin
  -- Determine current billing period
  v_period_start := date_trunc('month', current_date);

  -- Upsert usage record
  insert into public.team_usage (team_id, period_start, period_end, events_count)
  values (
    p_team_id,
    v_period_start,
    (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date,
    p_amount
  )
  on conflict (team_id, period_start, period_end)
  do update set 
    events_count = team_usage.events_count + excluded.events_count,
    updated_at = now()
  returning events_count into v_new_count;

  return v_new_count;
end;
$$;
