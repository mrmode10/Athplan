ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;
