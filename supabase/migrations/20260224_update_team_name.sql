-- Migration: Handle synchronized team name updates
-- Date: 2026-02-24

CREATE OR REPLACE FUNCTION public.update_team_name(
  p_old_name text,
  p_new_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_owner boolean;
BEGIN
  v_current_user_id := auth.uid();

  -- Verify user is associated with the team
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.teams t ON u.team_id = t.id
    WHERE u.id = v_current_user_id
    AND t.name = p_old_name
  ) INTO v_is_owner;

  IF NOT v_is_owner THEN
     RAISE EXCEPTION 'Unauthorized: You must be a member of this team to update its name.';
  END IF;

  -- 1. Update teams table
  UPDATE public.teams 
  SET name = p_new_name 
  WHERE name = p_old_name;

  -- 2. Update groups table
  UPDATE public.groups 
  SET name = p_new_name 
  WHERE name = p_old_name;

  -- 3. Update bot_users table
  UPDATE public.bot_users 
  SET group_name = p_new_name 
  WHERE group_name = p_old_name;

  -- 4. Update schedule_updates table
  UPDATE public.schedule_updates 
  SET group_name = p_new_name 
  WHERE group_name = p_old_name;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_team_name(text, text) TO authenticated;
