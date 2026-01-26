-- Create a function to check if a group name exists (case-insensitive)
create or replace function public.check_group_name_exists(p_name text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_exists boolean;
begin
  select exists(
    select 1 
    from public.groups 
    where lower(name) = lower(p_name)
  ) into v_exists;
  
  return v_exists;
end;
$$;

-- Grant execute permission to anon and authenticated users
grant execute on function public.check_group_name_exists(text) to anon, authenticated;
