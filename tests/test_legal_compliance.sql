-- Test Script for Legal Compliance (Retention Policy Only)
do $$
declare
  v_activity_id bigint;
begin
  -- 1. Test Retention Policy
  -- Insert old activity log (older than 90 days)
  -- 'activity_logs' retention is 90 days
  insert into public.activity_logs (query, status, created_at)
  values ('OLD QUERY', 'success', now() - interval '91 days')
  returning id into v_activity_id;

  raise notice 'Created old activity log: %', v_activity_id;

  -- Verify it exists
  if not exists (select 1 from public.activity_logs where id = v_activity_id) then
      raise exception 'Setup Failed: Could not insert old activity log';
  end if;

  -- Run enforcement
  perform public.enforce_retention_policy();

  -- Verify deletion
  if exists (select 1 from public.activity_logs where id = v_activity_id) then
    raise exception 'Test Failed: Old activity log was not deleted (Retention Policy)';
  else
    raise notice 'Test Passed: Retention policy enforced (Old log deleted)';
  end if;

end;
$$;
