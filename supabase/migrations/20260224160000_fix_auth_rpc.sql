-- Migration: Fix RPC authorization checks using auth.users metadata
-- Date: 2026-02-24

-- 1. Update add_team_admin
CREATE OR REPLACE FUNCTION public.add_team_admin(
  p_phone_number text,
  p_group_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_owner boolean;
  v_user_team text;
BEGIN
  v_current_user_id := auth.uid();

  -- Get the user's team from auth.users metadata
  SELECT (raw_user_meta_data->>'team')::text 
  INTO v_user_team 
  FROM auth.users 
  WHERE id = v_current_user_id;

  IF v_user_team = p_group_name THEN
     v_is_owner := true;
  ELSE
     v_is_owner := false;
  END IF;

  IF NOT v_is_owner THEN
     RAISE EXCEPTION 'Unauthorized: You must be a member of this team to add admins.';
  END IF;

  -- Insert or Update the new admin in bot_users
  INSERT INTO public.bot_users (phone_number, group_name, is_admin)
  VALUES (p_phone_number, p_group_name, true)
  ON CONFLICT (phone_number) 
  DO UPDATE SET 
    is_admin = true, 
    group_name = p_group_name;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_team_admin(text, text) TO authenticated;

-- 2. Update update_team_name
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
  v_user_team text;
BEGIN
  v_current_user_id := auth.uid();

  SELECT (raw_user_meta_data->>'team')::text 
  INTO v_user_team 
  FROM auth.users 
  WHERE id = v_current_user_id;

  IF v_user_team = p_old_name THEN
     v_is_owner := true;
  ELSE
     v_is_owner := false;
  END IF;

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
