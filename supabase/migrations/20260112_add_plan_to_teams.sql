
-- Add plan column to teams table
alter table public.teams 
add column plan text default 'starter';
