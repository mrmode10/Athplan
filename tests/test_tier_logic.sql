-- Test Script for Tier Logic and Usage Increment

do $$
declare
  v_team_id uuid;
  v_can_add boolean;
  v_new_count int;
begin
  -- 1. Insert a test team into the 'Starter' tier
  insert into public.teams (name, plan) values ('Test Team Starter', 'starter') returning id into v_team_id;
  raise notice 'Created test team with ID: %', v_team_id;
  
  -- 2. Check initial limit (should allow)
  select public.check_team_limit(v_team_id, 'max_monthly_events', 1) into v_can_add;
  if not v_can_add then
    raise exception 'Test Failed: Should allow usage when count is 0';
  end if;

  -- 3. Increment usage to limit (50)
  perform public.increment_team_usage(v_team_id, 50);
  
  -- Check new count
  select events_count into v_new_count 
  from public.team_usage 
  where team_id = v_team_id;
  
  raise notice 'Current usage count: %', v_new_count;
  
  if v_new_count != 50 then
    raise exception 'Test Failed: Usage count should be 50, got %', v_new_count;
  end if;

  -- 4. Check if we can increment 1 more (should fail/return false)
  select public.check_team_limit(v_team_id, 'max_monthly_events', 1) into v_can_add;
  
  if v_can_add then
    raise exception 'Test Failed: Should not allow exceeding 50 events on starter plan';
  else
    raise notice 'Test Passed: 50 events limit enforced';
  end if;

  -- Clean up
  delete from public.team_usage where team_id = v_team_id;
  delete from public.teams where id = v_team_id;
end;
$$;
