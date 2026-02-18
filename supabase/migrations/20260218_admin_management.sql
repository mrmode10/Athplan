-- Migration: Admin Management & Join Link Fixes
-- Date: 2026-02-18

-- 1. Ensure teams have a join_code
-- Create function to generate random 6-char code if missing
CREATE OR REPLACE FUNCTION public.ensure_join_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
     -- Generate a simple random code (e.g., 6 chars, uppercase alphanumeric)
     -- Using md5 for simplicity, taking first 6 chars.
     NEW.join_code := upper(substring(md5(random()::text) from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger properly
DROP TRIGGER IF EXISTS ensure_team_join_code ON public.teams;
CREATE TRIGGER ensure_team_join_code
BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.ensure_join_code();

-- Backfill existing teams
UPDATE public.teams 
SET join_code = upper(substring(md5(random()::text) from 1 for 6)) 
WHERE join_code IS NULL OR join_code = '';


-- 2. Function to add a secondary admin
-- Needs to be callable by authenticated users (who are admins of that team)
CREATE OR REPLACE FUNCTION public.add_team_admin(
  p_phone_number text,
  p_group_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_owner boolean;
  v_is_existing_admin boolean;
  v_team_id uuid;
BEGIN
  -- We need to check if the caller is allowed to add an admin.
  -- The caller is an authenticated user from auth.users.
  -- Strategy:
  -- 1. Check if the user is the OWNER of the team (linked via public.users.team_id -> teams.name = p_group_name).
  -- OR
  -- 2. Check if the user's phone number is already an ADMIN in bot_users for this group.

  v_current_user_id := auth.uid();

  -- Check if user is associated with this team via users table
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.teams t ON u.team_id = t.id
    WHERE u.id = v_current_user_id
    AND t.name = p_group_name
  ) INTO v_is_owner;

  -- If not owner by ID, check if they are admin by phone (scenario: secondary admin adding tertiary admin)
  IF NOT v_is_owner THEN
     -- Try to find phone number from metadata or other source?
     -- For now, strict: ONLY web-dashboard users who are on the team can add admins.
     -- If they are on the team, they are effectively admins of their own dashboard.
     -- Wait, 'users' table has team_id.
     RAISE EXCEPTION 'Unauthorized: You must be a member of this team to add admins.';
  END IF;

  -- Insert or Update the new admin in bot_users
  -- Uses ON CONFLICT to update if exists
  INSERT INTO public.bot_users (phone_number, group_name, is_admin)
  VALUES (p_phone_number, p_group_name, true)
  ON CONFLICT (phone_number) 
  DO UPDATE SET 
    is_admin = true, 
    group_name = p_group_name; -- Update group name if they moved? Or just ensure.

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_team_admin(text, text) TO authenticated;
