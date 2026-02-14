-- Add join_code to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS join_code text UNIQUE;

-- Allow Authenticated Users to INSERT their own team
DROP POLICY IF EXISTS "Users can insert their own team" ON public.teams;
CREATE POLICY "Users can insert their own team" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS teams_join_code_idx ON public.teams (join_code);
