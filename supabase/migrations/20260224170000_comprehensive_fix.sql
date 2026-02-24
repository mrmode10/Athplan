-- Migration: Comprehensive fix for team name, admin, and WhatsApp link bugs
-- Date: 2026-02-24

-- 1. Add is_admin column to bot_users
ALTER TABLE public.bot_users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Rewrite add_team_admin — get team from auth metadata directly
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
  v_user_team text;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT (raw_user_meta_data->>'team')::text
  INTO v_user_team
  FROM auth.users
  WHERE id = v_current_user_id;

  IF v_user_team IS NULL OR v_user_team = '' THEN
    v_user_team := p_group_name;
  END IF;

  IF v_user_team IS DISTINCT FROM p_group_name THEN
    RAISE EXCEPTION 'Unauthorized: group name does not match your team.';
  END IF;

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

-- 3. Rewrite update_team_name — handle NULL old name
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
  v_user_team text;
  v_group_exists boolean;
BEGIN
  v_current_user_id := auth.uid();

  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT (raw_user_meta_data->>'team')::text
  INTO v_user_team
  FROM auth.users
  WHERE id = v_current_user_id;

  IF v_user_team IS NOT NULL AND v_user_team <> '' AND v_user_team IS DISTINCT FROM p_old_name THEN
    RAISE EXCEPTION 'Unauthorized: your team does not match the old name provided.';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.groups WHERE name = p_old_name) INTO v_group_exists;

  IF v_group_exists THEN
    UPDATE public.groups SET name = p_new_name WHERE name = p_old_name;
  ELSE
    INSERT INTO public.groups (name, join_code)
    VALUES (p_new_name, upper(substring(md5(random()::text) from 1 for 6)));
  END IF;

  UPDATE public.teams SET name = p_new_name WHERE name = p_old_name;
  UPDATE public.bot_users SET group_name = p_new_name WHERE group_name = p_old_name;
  UPDATE public.schedule_updates SET group_name = p_new_name WHERE group_name = p_old_name;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_team_name(text, text) TO authenticated;
